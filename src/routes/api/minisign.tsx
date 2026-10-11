import type { APIEvent } from "@solidjs/start/server";
import cfg from "../../constant"

export function GET(_event: APIEvent) {
  const k = cfg.minisign_pubkey;
  return new Response(k, {
    headers: { "content-type": "text/plain" },
  });
}
