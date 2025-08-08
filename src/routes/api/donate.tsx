import type { APIEvent } from "@solidjs/start/server";

export function GET(_event: APIEvent) {
	const addr = {
		"Solana": {
			address: "FPxWFtvomGmfrzGvBcdEW1Gw5V1zyukHhyFfvPGm66Bh",
			hash: "sha256:8b2deac15b1364e37b8021defabbf27dcc215f3c5ce973b9472df867034cfd8a"
		}
	}
	return new Response(JSON.stringify(addr), {
		headers: { "content-type": "application/json" },
	});
}
