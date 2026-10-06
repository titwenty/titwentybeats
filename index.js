export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/beats" && request.method === "GET") {
        const listed = await env.BEATS.list({ limit: 1000 });
        const beats = listed.objects.map((obj) => ({
          id: obj.key,
          name: obj.customMetadata?.name || obj.key,
          genre: obj.customMetadata?.genre || "Other",
          bpm: obj.customMetadata?.bpm || "",
          size: obj.size,
          uploaded: obj.uploaded,
          url: `/media/${encodeURIComponent(obj.key)}`
        }));
        return json(beats);
      }

      if (url.pathname === "/api/upload" && request.method === "POST") {
        if (!authorized(request, env)) return new Response("Unauthorized", { status: 401 });

        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File)) return new Response("No file", { status: 400 });

        const safeName = file.name.replace(/[^a-zA-Z0-9._()\- ]/g, "_");
        const id = `${Date.now()}-${safeName}`;

        await env.BEATS.put(id, file.stream(), {
          httpMetadata: { contentType: file.type || "audio/mpeg" },
          customMetadata: {
            name: String(form.get("name") || file.name),
            genre: String(form.get("genre") || "Other"),
            bpm: String(form.get("bpm") || "")
          }
        });

        return json({ ok: true, id });
      }

      if (url.pathname.startsWith("/api/beats/") && request.method === "DELETE") {
        if (!authorized(request, env)) return new Response("Unauthorized", { status: 401 });

        const id = decodeURIComponent(url.pathname.slice("/api/beats/".length));
        await env.BEATS.delete(id);
        return json({ ok: true });
      }

      if (url.pathname.startsWith("/media/") && request.method === "GET") {
        const id = decodeURIComponent(url.pathname.slice("/media/".length));
        const obj = await env.BEATS.get(id);
        if (!obj) return new Response("Not found", { status: 404 });

        const headers = new Headers();
        obj.writeHttpMetadata(headers);
        headers.set("etag", obj.httpEtag);
        headers.set("Accept-Ranges", "bytes");
        return new Response(obj.body, { headers });
      }

      return env.ASSETS.fetch(request);
    } catch (err) {
      return new Response(`Server error: ${err?.message || err}`, { status: 500 });
    }
  }
};

function authorized(request, env) {
  const header = request.headers.get("Authorization") || "";
  return header === `Bearer ${env.ADMIN_PASSWORD}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
