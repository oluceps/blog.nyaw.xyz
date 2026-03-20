import { MeiliSearch } from "meilisearch";
import { getRequestEvent } from "solid-js/web";

function getApiKey(): string | undefined {
  const event = getRequestEvent();
  if (event?.nativeEvent?.context?.cloudflare?.env?.MS_KEY) {
    return event.nativeEvent.context.cloudflare.env.MS_KEY;
  }
  return process.env.MS_KEY;
}

export async function GET({ params }: { params: { q: string } }) {
  const q = params.q;

  if (!q || q.length < 2) {
    return Response.json({ hits: [] });
  }

  const apiKey = getApiKey();

  if (!apiKey) {
    return Response.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    const client = new MeiliSearch({
      host: "https://ms.nyaw.xyz",
      apiKey,
    });

    const index = client.index("blog");
    const search = await index.search(q, {
      limit: 20,
    });

    return Response.json({ hits: search.hits });
  } catch (e) {
    console.error("Search error:", e);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
