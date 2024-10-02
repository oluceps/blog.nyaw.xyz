import type { APIEvent } from "@solidjs/start/server";
import { geolocation } from "@vercel/functions";

export function GET(event: APIEvent) {
	const { country } = geolocation(event.request);
	return new Response((country === "CN" ? 1 : 0).toString(), {
		headers: { "content-type": "application/json" },
	});
}
