import { createMemo, createResource, createSignal, Show, Suspense, type Component } from "solid-js";
import cfg from "../constant";
import ky from "ky";
import { A, createAsync } from "@solidjs/router";
import { twMerge } from "tailwind-merge";

const Footer: Component = () => {
	const fetchOnlineStatus = async () => {
		try {
			const rsp = await ky.get(cfg.base_url + "/api/operational").json<any>();
			return { up: rsp.up, down: rsp.down }
		} catch (error) {
			console.error("Failed to fetch status:", error);
		}
	};
	const [systat] = createResource(() => fetchOnlineStatus())
	const stat = createMemo(() => systat()?.down === 0 ? "up" : systat()?.up === 0 ? "down" : "downgrade" as keyof typeof enumStat);

	const redOpacity = createMemo(() => {
		if (stat() !== "downgrade") return "";

		const up = systat()?.up ?? 0;
		const down = systat()?.down ?? 0;
		const total = up + down;
		if (total === 0) return "";

		const opacityValue = Math.floor((up / total) * 10) * 10;

		// https://tailwindcss.com/docs/detecting-classes-in-source-files#dynamic-class-names
		const opacityMap: Record<number, string> = {
			0: "opacity-0",
			10: "opacity-10",
			20: "opacity-20",
			30: "opacity-30",
			40: "opacity-40",
			50: "opacity-50",
			60: "opacity-60",
			70: "opacity-70",
			80: "opacity-80",
			90: "opacity-90",
			100: "opacity-100",
		};

		return opacityMap[opacityValue] || "";
	});
	const enumStat = {
		up: { color: "bg-sprout-300", text: "All Systems Operational" },
		downgrade: { color: "bg-red-500", text: "System Downgraded" },
		down: { color: "bg-black", text: "Systems Down" }
	}
	return (
		<div class="relative bottom-0 w-full justify-between text-[10px] flex-nowrap flex min-h-5">
			<div class="flex items-center ml-1 px-0.5 my-1 hover:cursor-pointer group transition-all hover:bg-gray-200 rounded-sm" onclick={() => window.open("https://status.nyaw.xyz", "_blank")}>
				<Suspense>
					<Show when={systat()}>
						{(how) => {
							return <div class="flex items-center gap-1 group">
								<div class={twMerge("w-2.5 h-2.5 rounded-full", enumStat[stat()].color, redOpacity())} />
								<div class="group-hover:opacity-100 opacity-0 text-zinc-600">{stat() == "downgrade" ? `${how().up}/${how().up + how().down} Alive | ` : ""}{enumStat[stat()].text}</div>
							</div>
						}}
					</Show>
				</Suspense>
			</div>
			<div class="flex justify-end items-center mr-3 space-x-1 flex-nowrap">
				<A href="/rss.xml" target="_blank" class="i-material-symbols:rss-feed px-2 rounded-sm bg-gray-600"></A>
				©2018-2025 {cfg.author} | {cfg.license}
			</div>
		</div>
	);
};
export default Footer;
