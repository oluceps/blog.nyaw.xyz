import { cache, createAsync, useNavigate } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import cfg from "../constant";
import { useLocation } from "@solidjs/router";
import { twMerge } from "tailwind-merge";

export default function Home() {
	const menu = cfg.menu;

	// if (limit()) {
	// 	menu.splice(0, 1);
	// }

	const navigate = useNavigate();

	type TabRef = HTMLButtonElement | null;
	const [tabRefs] = createSignal<TabRef[]>([]);

	const [hoveredIdx, setHoveredIdx] = createSignal<number | null>(null);
	const [hoveredTab, setHoveredTab] = createSignal<DOMRect | undefined>(
		tabRefs()[hoveredIdx() ?? -1]?.getBoundingClientRect(),
	);

	createEffect(() => {
		setHoveredTab(tabRefs()[hoveredIdx() ?? -1]?.getBoundingClientRect());
	});

	return (
		<nav
			onmouseleave={() => {
				setHoveredIdx(null);
			}}
			class={`bg-background flex items-center justify-end relative px-2 py-1.5`}
		>
			{menu.map((tab, idx) => (
				<button
					ref={(el) => {
						tabRefs()[idx] = el;
					}}
					class={twMerge(
						`bg-transparent font-sans px-1.5 py-1 z-10 text-neutral-500 hover:text-neutral-600 rounded-md transition ease-in delay-200`,
						useLocation().pathname == tab.url &&
							!hoveredTab() &&
							useLocation().pathname.length != 1
							? "bg-sprout-100 text-neutral-700/80"
							: "",
					)}
					onpointerenter={() => {
						setHoveredIdx(idx);
					}}
					onclick={() =>
						tab.url.startsWith("/")
							? navigate(tab.url)
							: window.open(tab.url, "_blank")
					}
				>
					{tab.name}
				</button>
			))}
			{hoveredTab() ? (
				<Presence>
					<Motion.button
						class="absolute top-0 right-0 bg-sprout-200/90 rounded-md"
						initial={{
							top: hoveredTab()?.bottom! - 24 + "px",
							right:
								document.documentElement.clientWidth -
								(hoveredTab()?.right || 0) +
								"px",
							width: hoveredTab()?.width + "px",
							height: hoveredTab()?.height + "px",
							opacity: 0,
						}}
						animate={{
							top: hoveredTab()?.top + "px",
							right:
								document.documentElement.clientWidth -
								(hoveredTab()?.right || 0) +
								"px",
							width: hoveredTab()?.width + "px",
							height: hoveredTab()?.height + "px",
							opacity: 1,
						}}
						transition={{
							duration: 0.18,
						}}
					/>
				</Presence>
			) : null}
		</nav>
	);
}
