import type { FetchEvent } from "@solidjs/start/server";

/**
 * Redirect Dictionary
 * {origin: destination}
 */
const PLAIN_TEXT = ["/id_ed25519.pub", "/minisign.pub"] as const;

function isPlaintext(path: string): path is typeof PLAIN_TEXT[number] {
	return PLAIN_TEXT.includes(path as typeof PLAIN_TEXT[number]);
}

export const handleHeaderResetPlaintextContent = (event: FetchEvent) => {

	const { pathname } = new URL(event.request.url);

	if (isPlaintext(pathname)) {
		event.response.headers.append("Content-Type", "text/plain")
	}
};
