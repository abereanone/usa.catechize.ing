export default {
  async fetch(request, env) {
    try {
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
