import cfg from "../constant";
import type { FetchEvent } from "@solidjs/start/server";
import ky from "ky";

const PLAIN_TEXT = ["/id_ed25519", "/minisign"] as const;

function isPlaintext(path: string): path is typeof PLAIN_TEXT[number] {
	return PLAIN_TEXT.includes(path as typeof PLAIN_TEXT[number]);
}

export const handleHeaderResetPlaintextContent = async (event: FetchEvent) => {

	const { pathname } = new URL(event.request.url);

	if (isPlaintext(pathname)) {
		console.log("Get", pathname)
		event.response.headers.append("Content-Type", "text/plain")

		let res = ky.get(cfg.base_url + pathname + ".pub").then((r) => new Response(r.body));
		return await res;
	}
};

