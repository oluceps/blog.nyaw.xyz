import ky from "ky";
import type { APIEvent, } from "@solidjs/start/server";

export async function GET(e: APIEvent) {
	//@ts-ignore
	const username = import.meta.env.VITE_ALERTMANAGER_USER;
	//@ts-ignore
	const password = import.meta.env.VITE_ALERTMANAGER_PASSWORD;

	if (username == null || password == null) {
		console.log("env corrupt")
	}

	if (!username || !password) {
		console.error("Alertmanager credentials (VITE_ALERTMANAGER_USER, VITE_ALERTMANAGER_PASSWORD) are not set in environment variables.");
		return new Response(JSON.stringify({ status: "error", message: "Server configuration error." }), { status: 500 });
	}

	const alertPayload = [
		{
			labels: {
				alertname: "secrets reveal",
			},
			annotations: {
				source_ip: e.clientAddress || "noip",
			},
		},
	];

	const authHeader = `Basic ${btoa(`${username}:${password}`)}`;

	const alertmanagerApiUrl = "https://alert.nyaw.xyz/api/v2/alerts";

	try {
		const response = await ky.post(alertmanagerApiUrl, {
			headers: {
				"Authorization": authHeader,
			},
			json: alertPayload,
		}).json();

		console.log("Sent alert to Alertmanager");

		return new Response(JSON.stringify({
			status: "success",
			message: "Alert sent successfully.",
			upstreamResponse: response
		}));

	} catch (error) {
		console.error("Failed to send alert to Alertmanager:", error);

		return new Response(JSON.stringify({
			status: "error",
			message: "Failed to send alert to upstream Alertmanager."
		}), { status: 502 });
	}
}
