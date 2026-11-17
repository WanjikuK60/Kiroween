import re

import pytest
from fastapi.testclient import TestClient

import app as server

STATE = "abcdefghijklmnop1234"


@pytest.fixture(autouse=True)
def configured(monkeypatch):
    monkeypatch.setenv("GITHUB_CLIENT_ID", "client-123")
    monkeypatch.setenv("GITHUB_CLIENT_SECRET", "secret-456")
    monkeypatch.setenv("ALLOWED_ORIGIN", "https://wanjikuk60.github.io")


client = TestClient(server.app)


def test_health_reports_configured():
    assert client.get("/").json() == {"status": "ok", "configured": True}


def test_login_redirects_to_github_with_public_repo_scope():
    response = client.get("/auth/login", params={"state": STATE}, follow_redirects=False)
    assert response.status_code == 307
    location = response.headers["location"]
    assert location.startswith("https://github.com/login/oauth/authorize?")
    assert "client_id=client-123" in location
    assert "scope=public_repo" in location
    assert f"state={STATE}" in location
    assert "secret-456" not in location


def test_login_rejects_bad_state():
    response = client.get("/auth/login", params={"state": "<script>"}, follow_redirects=False)
    assert response.status_code == 400


def test_login_when_not_configured(monkeypatch):
    monkeypatch.delenv("GITHUB_CLIENT_SECRET")
    response = client.get("/auth/login", params={"state": STATE}, follow_redirects=False)
    assert response.status_code == 503


def test_callback_posts_token_only_to_allowed_origin(monkeypatch):
    monkeypatch.setattr(server, "exchange_code", lambda code: "gho_token")
    response = client.get("/auth/callback", params={"state": STATE, "code": "one-time"})
    body = response.text
    assert response.headers["cache-control"] == "no-store"
    assert '"token": "gho_token"' in body
    assert f'"state": "{STATE}"' in body
    assert 'postMessage({"type": "haunted-auth"' in body
    assert '"https://wanjikuk60.github.io")' in body
    assert "*" not in re.findall(r"postMessage\((.*)\)", body)[0].split(",")[-1]


def test_callback_cancelled_sends_friendly_error():
    response = client.get("/auth/callback", params={"state": STATE, "error": "access_denied"})
    assert "GitHub sign-in was cancelled." in response.text
    assert "token" not in response.text.split("<script>")[1].split("</script>")[0].replace("haunted-auth", "")


def test_callback_exchange_failure(monkeypatch):
    def boom(code):
        raise ValueError("bad_verification_code")

    monkeypatch.setattr(server, "exchange_code", boom)
    response = client.get("/auth/callback", params={"state": STATE, "code": "used"})
    assert "GitHub sign-in failed. Please try again." in response.text
    assert "bad_verification_code" not in response.text


def test_callback_cannot_break_out_of_script(monkeypatch):
    monkeypatch.setattr(server, "exchange_code", lambda code: "</script><script>alert(1)</script>")
    response = client.get("/auth/callback", params={"state": STATE, "code": "x"})
    script = response.text.split("<script>", 1)[1]
    assert "</script><script>alert(1)" not in script
    assert "\\u003c/script>" in script


def test_callback_drops_invalid_state(monkeypatch):
    monkeypatch.setattr(server, "exchange_code", lambda code: "gho_token")
    response = client.get("/auth/callback", params={"state": "bad state!", "code": "x"})
    assert '"state": ""' in response.text


def test_revoke_calls_github(monkeypatch):
    calls = []
    monkeypatch.setattr(server, "revoke_token", lambda token: calls.append(token))
    response = client.post("/auth/revoke", json={"token": "gho_token"})
    assert response.status_code == 204
    assert calls == ["gho_token"]


def test_cors_allows_only_the_portfolio_site():
    ok = client.options(
        "/auth/revoke",
        headers={"Origin": "https://wanjikuk60.github.io", "Access-Control-Request-Method": "POST",
                 "Access-Control-Request-Headers": "Content-Type"},
    )
    assert ok.headers["access-control-allow-origin"] == "https://wanjikuk60.github.io"
    other = client.post("/auth/revoke", json={"token": "t"}, headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in other.headers
