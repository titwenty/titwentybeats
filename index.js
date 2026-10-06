export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      // Public API: list beats
      if (url.pathname === "/api/beats" && request.method === "GET") {
        if (!env.BEATS) return json({ error: "R2 binding BEATS is not configured." }, 500);

        const listed = await env.BEATS.list({ limit: 1000 });
        const beats = listed.objects.map((obj) => ({
          id: obj.key,
          name: obj.customMetadata?.name || obj.key,
          genre: obj.customMetadata?.genre || "Other",
          bpm: obj.customMetadata?.bpm || "",
          uploaded: obj.uploaded,
          url: `/media/${encodeURIComponent(obj.key)}`
        }));
        return json(beats);
      }

      // Admin upload
      if (url.pathname === "/api/upload" && request.method === "POST") {
        if (!env.BEATS) return json({ error: "R2 binding BEATS is not configured." }, 500);
        if (!authorized(request, env)) return new Response("Unauthorized", { status: 401 });

        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File)) return new Response("Audio file is required.", { status: 400 });

        const safeName = file.name.replace(/[^a-zA-Z0-9._()\- ]/g, "_");
        const key = `${Date.now()}-${safeName}`;

        await env.BEATS.put(key, file.stream(), {
          httpMetadata: {
            contentType: file.type || "audio/mpeg",
            cacheControl: "public, max-age=31536000"
          },
          customMetadata: {
            name: String(form.get("name") || file.name),
            genre: String(form.get("genre") || "Other"),
            bpm: String(form.get("bpm") || "")
          }
        });

        return json({ ok: true, id: key });
      }

      // Admin delete
      if (url.pathname.startsWith("/api/beats/") && request.method === "DELETE") {
        if (!env.BEATS) return json({ error: "R2 binding BEATS is not configured." }, 500);
        if (!authorized(request, env)) return new Response("Unauthorized", { status: 401 });

        const key = decodeURIComponent(url.pathname.slice("/api/beats/".length));
        await env.BEATS.delete(key);
        return json({ ok: true });
      }

      // Audio
      if (url.pathname.startsWith("/media/") && request.method === "GET") {
        if (!env.BEATS) return new Response("R2 binding BEATS is not configured.", { status: 500 });

        const key = decodeURIComponent(url.pathname.slice("/media/".length));
        const object = await env.BEATS.get(key);
        if (!object) return new Response("Beat not found.", { status: 404 });

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("ETag", object.httpEtag);
        headers.set("Accept-Ranges", "bytes");
        return new Response(object.body, { headers });
      }

      // Static website
      return env.ASSETS.fetch(request);
    } catch (error) {
      return json({ error: error?.message || String(error) }, 500);
    }
  }
};

function authorized(request, env) {
  const auth = request.headers.get("Authorization") || "";
  return Boolean(env.ADMIN_PASSWORD) && auth === `Bearer ${env.ADMIN_PASSWORD}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
