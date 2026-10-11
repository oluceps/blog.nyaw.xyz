import type { APIEvent } from "@solidjs/start/server";
import cfg from "~/constant";

export async function GET(event: APIEvent) {
  try {
    const { searchParams } = new URL(event.request.url);

    const hasText = searchParams.has('text');
    const text = hasText
      ? searchParams.get('text')?.slice(0, 100)
      : undefined;

    if (!text) {
      return new Response("bad", {
        status: 400,
      })
    }

    return new Response(Buffer.from(text, 'base64').toString('utf8'), {
      status: 400
    }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed`, {
      status: 500,
    });
  }
}
