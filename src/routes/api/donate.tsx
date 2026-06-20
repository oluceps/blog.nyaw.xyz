import type { APIEvent } from "@solidjs/start/server";

export function GET(_event: APIEvent) {
	const addr = {
		"Solana": {
			address: "FPxWFtvomGmfrzGvBcdEW1Gw5V1zyukHhyFfvPGm66Bh",
			hash: "sha256:8b2deac15b1364e37b8021defabbf27dcc215f3c5ce973b9472df867034cfd8a"
		},
		"ERC-20": {
			address: "0x612D4B912606eFfCd81Fd3337Cb14250AF4C6c2b",
			hash: "sha256:a8156dffcff08aafff2e1707c6bda09cf8445c2a8d22c7bc76046a4e5f8eeb24"
		}
	}
	return new Response(JSON.stringify(addr), {
		headers: { "content-type": "application/json" },
	});
}
