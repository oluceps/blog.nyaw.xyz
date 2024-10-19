import type { APIEvent } from "@solidjs/start/server";

export function GET(_event: APIEvent) {
	const addr = {
		"Monero": "46TckNysSV7PdNA3PW134heWh4Nv3Fxv7Lab7aqw6utMEFK5qJypgteRZppWfsYnZAeoi7sddUP41Sr2YfFqr4urBiE1Xbw",
		"Solana": "AqRNAHbp12wk6HMSd8cffFz1NXXigBiU14LLecP4Rkxo",
		"ERC-20": "0xAD109D5E5CE7EF7F6263AA5238d6fb1b40516e68"
	}
	return new Response(JSON.stringify(addr), {
		headers: { "content-type": "application/json" },
	});
}
