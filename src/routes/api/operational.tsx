import ky from "ky";

export async function GET() {
	interface Rsp {
		up: number;
		down: number;
	}

	const statusAPI = "https://status.nyaw.xyz";

	const fetchSysStatus = async () => {
		try {
			const response = await ky
				.get(`${statusAPI}/api/data`)
				.json<Rsp>();

			const { up, down } = response;
			return { up, down };
		} catch (error) {
			console.error("Failed to fetch user status:", error);
			return 0;
		}
	};

	const res = await fetchSysStatus();
	return new Response(JSON.stringify(res), {
		headers: { "content-type": "application/json" },
	});
}
