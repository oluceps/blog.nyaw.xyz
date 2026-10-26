import type { APIEvent } from "@solidjs/start/server";

export function GET(_event: APIEvent) {
	const ctt = {
		"welcome": "Welcome to the nyaw.xyz JSON API.",
		"version": "0.1.0",
		"path": "/api",
		"links": [
			{
				"href": "/minisign",
				"rel": "minisign_public_key",
				"type": "GET"
			},
			{
				"href": "/tier",
				"rel": "req_src_country_is_cn",
				"type": "GET"
			},
			{
				"href": "/donate",
				"rel": "donate_method",
				"type": "GET"
			},
			{
				"href": "/operational",
				"rel": "status_of_system",
				"type": "GET"
			},
			{
				"href": "/pr-stat",
				"rel": "get_nixpkgs_pr_stat",
				"type": "GET"
			},
			{
				"href": "/online",
				"rel": "misskey_online_status",
				"type": "GET"
			}
		]
	}
	return new Response(JSON.stringify(ctt), {
		headers: { "content-type": "application/json" },
	});
}
