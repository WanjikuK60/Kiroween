// "Deploy to my GitHub Pages" for the Summoning Circle.
//
// 1. A sign-in window asks GitHub for permission (via the small helper in server/,
//    which holds the OAuth secret) and passes back a short-lived access token.
// 2. This page uses the GitHub API to create a repo on the visitor's account,
//    upload their portfolio as index.html, and turn on GitHub Pages.
// 3. The token is handed back to GitHub straight away and never stored.
(() => {
  const DEPLOY_API = "https://kiroween-deploy.onrender.com";
  const GITHUB_API = "https://api.github.com";
  // Marks repos made by this tool, so we never overwrite an unrelated repo.
  const MARKER = "My haunted portfolio, summoned with The Haunted Portfolio";
  const REPO_NAME = /^(?!\.{1,2}$)[A-Za-z0-9._-]{1,100}$/;

  const button = document.getElementById("deploy-button");
  const repoInput = document.getElementById("deploy-repo");
  const steps = document.getElementById("deploy-steps");
  const result = document.getElementById("deploy-result");
  if (!button || !window.HauntedBuilder) return;

  // Free servers sleep when idle: wake the helper as soon as the builder is in view.
  const circle = document.getElementById("builder-form");
  const waker = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      fetch(DEPLOY_API + "/", { mode: "no-cors" }).catch(() => {});
      waker.disconnect();
    }
  });
  if (circle) waker.observe(circle);

  const STEP_NAMES = [
    "Sign in with GitHub",
    "Create your repository",
    "Upload your portfolio",
    "Turn on GitHub Pages",
    "Wait for your site to go live",
  ];
  const showSteps = () => {
    steps.replaceChildren(...STEP_NAMES.map((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      return li;
    }));
    steps.hidden = false;
  };
  const mark = (index, state) => {
    STEP_NAMES.forEach((_, i) => {
      const li = steps.children[i];
      if (i < index) li.dataset.state = "done";
      else if (i === index) li.dataset.state = state;
      else delete li.dataset.state;
    });
  };
  const say = (text, isError = false) => {
    result.textContent = text;
    result.classList.toggle("error", isError);
  };

  const randomState = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  };

  // Opens the sign-in window and resolves with an access token.
  const signIn = () => new Promise((resolve, reject) => {
    const state = randomState();
    const apiOrigin = new URL(DEPLOY_API).origin;
    const popup = window.open(
      `${DEPLOY_API}/auth/login?state=${state}`,
      "haunted-github-sign-in",
      "width=640,height=760",
    );
    if (!popup) {
      reject(new Error("Your browser blocked the sign-in window. Allow pop-ups for this site and try again."));
      return;
    }
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      removeEventListener("message", onMessage);
      clearInterval(watch);
      fn(value);
    };
    const onMessage = (event) => {
      if (event.origin !== apiOrigin) return;
      const data = event.data || {};
      if (data.type !== "haunted-auth" || data.state !== state) return;
      if (data.token) finish(resolve, data.token);
      else finish(reject, new Error(data.error || "GitHub sign-in failed."));
    };
    addEventListener("message", onMessage);
    const watch = setInterval(() => {
      if (popup.closed) setTimeout(() => finish(reject, new Error("The sign-in window was closed before you finished.")), 800);
    }, 500);
  });

  const toBase64 = (text) => {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  };

  const github = (token) => async (path, { method = "GET", body } = {}) => {
    const response = await fetch(GITHUB_API + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    return { status: response.status, data };
  };

  const revoke = (token) => fetch(`${DEPLOY_API}/auth/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  }).catch(() => {});

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const deploy = async () => {
    const repo = repoInput.value.trim();
    if (!REPO_NAME.test(repo)) {
      say("Repository names can use letters, numbers, dots, dashes and underscores.", true);
      repoInput.focus();
      return;
    }
    const html = window.HauntedBuilder.buildPage(window.HauntedBuilder.readForm());

    button.disabled = true;
    say("");
    showSteps();
    mark(0, "active");
    say("A GitHub window is opening. The free sign-in server can take up to a minute to wake up.");

    let token;
    try {
      token = await signIn();
      const gh = github(token);

      const user = await gh("/user");
      if (user.status !== 200) throw new Error("GitHub didn't accept the sign-in. Please try again.");
      const owner = user.data.login;
      const siteUrl = `https://${owner.toLowerCase()}.github.io/${repo}/`;

      mark(1, "active");
      say(`Signed in as ${owner}.`);
      let existing = await gh(`/repos/${owner}/${repo}`);
      if (existing.status === 200 && existing.data.description !== MARKER) {
        throw new Error(`You already have a repository called "${repo}" that wasn't made here. Choose another name so it isn't overwritten.`);
      }
      if (existing.status === 404) {
        const created = await gh("/user/repos", {
          method: "POST",
          body: { name: repo, description: MARKER, homepage: siteUrl, auto_init: true, has_issues: false, has_wiki: false, has_projects: false },
        });
        if (created.status !== 201) throw new Error(created.data?.message || "GitHub couldn't create the repository.");
        existing = created;
        await sleep(1500); // let GitHub finish the first commit
      } else if (existing.status !== 200) {
        throw new Error("Couldn't check your repositories. Please try again.");
      }
      const branch = existing.data.default_branch || "main";

      mark(2, "active");
      const current = await gh(`/repos/${owner}/${repo}/contents/index.html?ref=${branch}`);
      const upload = await gh(`/repos/${owner}/${repo}/contents/index.html`, {
        method: "PUT",
        body: {
          message: "Summon my haunted portfolio",
          content: toBase64(html),
          branch,
          ...(current.status === 200 ? { sha: current.data.sha } : {}),
        },
      });
      if (upload.status !== 200 && upload.status !== 201) throw new Error(upload.data?.message || "Upload failed.");

      mark(3, "active");
      const pages = await gh(`/repos/${owner}/${repo}/pages`, {
        method: "POST",
        body: { build_type: "legacy", source: { branch, path: "/" } },
      });
      if (pages.status !== 201 && pages.status !== 409) throw new Error(pages.data?.message || "Couldn't turn on GitHub Pages.");

      mark(4, "active");
      say("GitHub is building your site. This usually takes about a minute…");
      for (let i = 0; i < 36; i++) {
        await sleep(5000);
        const build = await gh(`/repos/${owner}/${repo}/pages/builds/latest`);
        if (build.data?.status === "built") break;
        if (build.data?.status === "errored") throw new Error("GitHub Pages reported a build error. Try deploying again.");
      }
      mark(STEP_NAMES.length, "done");
      result.classList.remove("error");
      result.replaceChildren(
        "🎉 Your haunted portfolio is live: ",
        Object.assign(document.createElement("a"), { href: siteUrl, textContent: siteUrl, rel: "noopener", target: "_blank" }),
        ". If it shows a 404, wait a minute and refresh.",
      );
    } catch (error) {
      const failing = [...steps.children].findIndex((li) => li.dataset.state === "active");
      if (failing >= 0) steps.children[failing].dataset.state = "failed";
      say(error.message, true);
    } finally {
      if (token) revoke(token);
      token = undefined;
      button.disabled = false;
    }
  };

  button.addEventListener("click", deploy);
})();
