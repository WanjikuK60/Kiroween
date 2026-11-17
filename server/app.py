"""Sign-in helper for The Haunted Portfolio's "Deploy to GitHub Pages" button.

GitHub's OAuth flow needs a client secret, which must never be shipped to a
browser. This tiny service holds that secret and does three things:

  GET  /auth/login     send the visitor to GitHub to approve access
  GET  /auth/callback  swap GitHub's one-time code for an access token and
                       hand it to the portfolio page (window.postMessage)
  POST /auth/revoke    hand the token back to GitHub once the deploy is done

The browser does the deploy itself with the GitHub API, so this service never
sees the visitor's portfolio and stores nothing.

Environment variables:
  GITHUB_CLIENT_ID      from the GitHub OAuth app
  GITHUB_CLIENT_SECRET  from the GitHub OAuth app (keep it secret)
  ALLOWED_ORIGIN        the site allowed to receive tokens,
                        e.g. https://wanjikuk60.github.io

Run locally:  uvicorn app:app --reload
"""

import json
import os
import re
from urllib.parse import urlencode

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API = "https://api.github.com"
# public_repo is the smallest GitHub scope that can create a public repo,
# add a file to it and turn on GitHub Pages.
SCOPE = "public_repo"
STATE_PATTERN = re.compile(r"^[A-Za-z0-9_-]{16,128}$")


def settings() -> tuple[str, str, str]:
    client_id = os.environ.get("GITHUB_CLIENT_ID", "")
    client_secret = os.environ.get("GITHUB_CLIENT_SECRET", "")
    origin = os.environ.get("ALLOWED_ORIGIN", "https://wanjikuk60.github.io")
    return client_id, client_secret, origin


app = FastAPI(title="Haunted Portfolio deploy helper", docs_url=None, redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings()[2]],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


@app.get("/")
def health() -> dict:
    client_id, client_secret, _ = settings()
    return {"status": "ok", "configured": bool(client_id and client_secret)}


@app.get("/auth/login")
def login(state: str) -> RedirectResponse:
    client_id, client_secret, _ = settings()
    if not (client_id and client_secret):
        raise HTTPException(503, "The deploy helper is not configured yet.")
    if not STATE_PATTERN.match(state):
        raise HTTPException(400, "Invalid state.")
    query = urlencode({"client_id": client_id, "scope": SCOPE, "state": state, "allow_signup": "true"})
    return RedirectResponse(f"{GITHUB_AUTHORIZE_URL}?{query}")


def exchange_code(code: str) -> str:
    """Swap GitHub's one-time code for an access token."""
    client_id, client_secret, _ = settings()
    response = httpx.post(
        GITHUB_TOKEN_URL,
        data={"client_id": client_id, "client_secret": client_secret, "code": code},
        headers={"Accept": "application/json"},
        timeout=15,
    )
    response.raise_for_status()
    payload = response.json()
    token = payload.get("access_token")
    if not token:
        raise ValueError(payload.get("error_description") or payload.get("error") or "No token returned")
    return token


def reply_page(message: dict, origin: str) -> HTMLResponse:
    """A page that passes the result to the portfolio window, then closes."""
    # json.dumps keeps the data a plain JS value; escaping "<" stops it closing the script tag.
    data = json.dumps(message).replace("<", "\\u003c")
    target = json.dumps(origin).replace("<", "\\u003c")
    html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Summoning…</title>
<meta name="referrer" content="no-referrer"></head>
<body style="background:#07060b;color:#d9d4c7;font-family:Georgia,serif;text-align:center;padding-top:20vh">
<p id="msg">Returning to the haunted house…</p>
<script>
  if (window.opener) {{
    window.opener.postMessage({data}, {target});
    window.close();
  }} else {{
    document.getElementById("msg").textContent = "Please return to the haunted portfolio tab.";
  }}
</script>
</body></html>"""
    return HTMLResponse(html, headers={"Cache-Control": "no-store"})


@app.get("/auth/callback")
def callback(state: str = "", code: str = "", error: str = "") -> HTMLResponse:
    _, _, origin = settings()
    message: dict = {"type": "haunted-auth", "state": state if STATE_PATTERN.match(state) else ""}
    if error or not code:
        message["error"] = "GitHub sign-in was cancelled." if error == "access_denied" else "GitHub sign-in failed."
        return reply_page(message, origin)
    try:
        message["token"] = exchange_code(code)
    except (httpx.HTTPError, ValueError):
        message["error"] = "GitHub sign-in failed. Please try again."
    return reply_page(message, origin)


class RevokeRequest(BaseModel):
    token: str


def revoke_token(token: str) -> None:
    client_id, client_secret, _ = settings()
    httpx.request(
        "DELETE",
        f"{GITHUB_API}/applications/{client_id}/token",
        auth=(client_id, client_secret),
        json={"access_token": token},
        headers={"Accept": "application/vnd.github+json"},
        timeout=15,
    )


@app.post("/auth/revoke", status_code=204)
def revoke(body: RevokeRequest) -> None:
    client_id, client_secret, _ = settings()
    if not (client_id and client_secret) or not body.token:
        return
    try:
        revoke_token(body.token)
    except httpx.HTTPError:
        pass  # The token also expires if the visitor revokes it in GitHub settings.
