import type { APIEvent } from "@solidjs/start/server";

export function GET(_event: APIEvent) {
	const addr = {
		"Monero": {
			address: "46TckNysSV7PdNA3PW134heWh4Nv3Fxv7Lab7aqw6utMEFK5qJypgteRZppWfsYnZAeoi7sddUP41Sr2YfFqr4urBiE1Xbw",
			blake3_hash: "625a890df3403600c73a84f6153c191490de600625e6ca6dd8acaa3f58b92423"
		},
		"Solana": {
			address: "AqRNAHbp12wk6HMSd8cffFz1NXXigBiU14LLecP4Rkxo",
			blake3_hash: "4e7d49734ffb6e38e52696f815b2fa5072211ef3c79f4d26f498a4a5091d2cd3"
		},
		"ERC-20": {
			address: "0xAD109D5E5CE7EF7F6263AA5238d6fb1b40516e68",
			blake3_hash: "d53b982a1e938f5615393795e0ba0b390950fdd9e7c924657dd8ff63d8366447"
		}
	}
	return new Response(JSON.stringify(addr), {
		headers: { "content-type": "application/json" },
	});
}
