// Legacy alias: /q/<slugOrId> used to be a generated page emitting a meta-refresh.
// It is now a real 301 so the canonical /questions/<slugOrId> URL gets the credit.
const LEGACY_QUESTION_ALIAS = /^\/q\/([^/]+?)(?:\.html)?\/?$/;

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const aliasMatch = url.pathname.match(LEGACY_QUESTION_ALIAS);

      if (aliasMatch) {
        const target = new URL(`/questions/${aliasMatch[1]}`, url);
        target.search = url.search;
        return Response.redirect(target.toString(), 301);
      }

      if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
        console.error("ASSETS binding unavailable on this deployment.");
        return new Response("Internal Server Error", { status: 500 });
      }

      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404 || request.method !== "GET") {
        return assetResponse;
      }

      const notFoundUrl = new URL("/404.html", request.url);
      const notFoundResponse = await env.ASSETS.fetch(notFoundUrl);

      if (notFoundResponse.status === 200) {
        const body = await notFoundResponse.arrayBuffer();
        return new Response(body, {
          status: 404,
          headers: new Headers(notFoundResponse.headers),
        });
      }

      return assetResponse;
    } catch (error) {
      console.error("Worker error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
