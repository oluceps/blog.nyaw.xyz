import { createMemo, createResource, type Component } from "solid-js";
import cfg from "../constant";
import ky from "ky";

const Footer: Component = () => {
	const fetchOnlineStatus = async () => {
		try {
			const rsp = await ky.get(cfg.base_url + "/api/operational").json<any>();
			return { up: rsp.up, down: rsp.down };
		} catch {
			return undefined;
		}
	};

	const [systat] = createResource(() => fetchOnlineStatus());

	const statusColor = createMemo(() => {
		const data = systat();
		if (!data) return "#8b8b86";
		if (data.down === 0) return "#8dab70";
		if (data.up === 0) return "#2a2a28";
		return "#e63f66";
	});

	const statusText = createMemo(() => {
		const data = systat();
		if (!data) return "operational";
		if (data.down === 0) return "operational";
		if (data.up === 0) return "down";
		return "degraded";
	});

	return (
		<div
			class="w-full font-mono flex items-center justify-between px-5 py-3"
			style={{ "font-size": "10px", color: "#8b8b86" }}
		>
			<div
				class="flex items-center gap-1.25 cursor-pointer"
				onClick={() => window.open("https://status.nyaw.xyz", "_blank")}
			>
				<div style={{
					width: "5px", height: "5px",
					"border-radius": "50%",
					background: statusColor(),
				}} />
				<span>{statusText()}</span>
			</div>
			<span>©2018–2026 {cfg.author}</span>
		</div>
	);
};
export default Footer;
