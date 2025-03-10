import { createResource, createSignal, Show, Suspense, type Component } from "solid-js";
import cfg from "../constant";
import ky from "ky";
import { createAsync } from "@solidjs/router";
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
	const enumStat = {
		up: { color: "bg-sprout-300", text: "All Systems Operational" },
		downgrade: { color: "bg-pink-300", text: "System Downgraded" },
		down: { color: "bg-red-200", text: "Systems Down" }
	}
	return (
		<div class="relative bottom-0 w-full justify-between text-[10px] flex-nowrap flex min-h-5">
			<div class="flex items-center ml-1 px-0.5 my-1 hover:cursor-pointer group transition-all hover:bg-gray-200 rounded-sm" onclick={() => window.open("https://status.nyaw.xyz", "_blank")}>
				<Suspense>
					<Show when={systat()}>
						{(how) => {
							const stat = how().down === 0 ? "up" : how().up === 0 ? "down" : "downgrade" as keyof typeof enumStat;
							return <div class="flex items-center gap-1 group">
								<div class={twMerge("w-2.5 h-2.5 rounded-full", enumStat[stat].color)} />
								<div class="group-hover:opacity-100 opacity-0 text-zinc-600">{enumStat[stat].text}</div>
							</div>
						}}
					</Show>
				</Suspense>
			</div>
			<div class="flex justify-end items-center mr-3 space-x-1 flex-nowrap">
				©2018-2025 {cfg.author} | {cfg.license}
			</div>
		</div>
	);
};
export default Footer;
