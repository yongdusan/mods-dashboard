/**
 * Cloudflare Pages Function — POST /api/refresh
 *
 * Triggers the `news-refresh` GitHub Actions workflow via workflow_dispatch.
 * Required environment variable (set in Cloudflare Pages → Settings → Environment variables):
 *   GITHUB_TOKEN  — Personal Access Token with `repo` + `actions:write` scopes
 */

const REPO_OWNER = "yongdusan";
const REPO_NAME  = "mods-dashboard";
const WORKFLOW_FILE = "news-refresh.yml";

export async function onRequestPost(context) {
  const token = context.env.GITHUB_TOKEN;

  if (!token) {
    return jsonResponse(500, {
      ok: false,
      error: "GITHUB_TOKEN environment variable is not set in Cloudflare Pages.",
    });
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
    return jsonResponse(502, { ok: false, error: `GitHub API fetch failed: ${err.message}` });
  }

  // 204 No Content = success
  if (ghRes.status === 204) {
    return jsonResponse(200, {
      ok: true,
      message: "뉴스 업데이트가 시작되었습니다. 약 2~3분 후 페이지를 새로고침하면 최신 뉴스가 반영됩니다.",
    });
  }

  const body = await ghRes.text();
  return jsonResponse(ghRes.status, {
    ok: false,
    error: `GitHub API responded with ${ghRes.status}: ${body}`,
  });
}

// Allow preflight for local dev
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
