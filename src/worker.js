const REPO_OWNER    = "yongdusan";
const REPO_NAME     = "mods-dashboard";
const WORKFLOW_FILE = "news-refresh.yml";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // POST /api/refresh → trigger GitHub Actions workflow
    if (url.pathname === "/api/refresh" && request.method === "POST") {
      const token = env.GITHUB_TOKEN;

      if (!token) {
        return Response.json(
          { ok: false, error: "GITHUB_TOKEN secret is not configured." },
          { status: 500 }
        );
      }

      const dispatchUrl =
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}` +
        `/actions/workflows/${WORKFLOW_FILE}/dispatches`;

      let ghRes;
      try {
        ghRes = await fetch(dispatchUrl, {
          method: "POST",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
            "User-Agent": "modu-dashboard-refresh",
          },
          body: JSON.stringify({ ref: "main" }),
        });
      } catch (err) {
        return Response.json(
          { ok: false, error: `GitHub API fetch failed: ${err.message}` },
          { status: 502 }
        );
      }

      if (ghRes.status === 204) {
        return Response.json({
          ok: true,
          message:
            "뉴스 업데이트가 시작되었습니다. 약 2~3분 후 페이지를 새로고침하면 최신 뉴스가 반영됩니다.",
        });
      }

      const body = await ghRes.text();
      return Response.json(
        { ok: false, error: `GitHub API: ${ghRes.status} — ${body}` },
        { status: ghRes.status }
      );
    }

    // All other requests → serve static assets
    return env.ASSETS.fetch(request);
  },
};
