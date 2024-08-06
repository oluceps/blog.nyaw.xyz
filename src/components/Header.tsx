import { A } from "@solidjs/router";
import { createEffect, createSignal, type Component } from "solid-js";
import cfg from "../constant";
import TheNav from "./TheNav";
import { useWindowScrollPosition } from "@solid-primitives/scroll";
import { twMerge } from 'tailwind-merge'

const Header: Component<{ sticky: boolean }> = (props) => {
	const scroll = useWindowScrollPosition();

	const [afterHover, setAfterHover] = createSignal("");

	createEffect(() => {
		setAfterHover(scroll.y > 350 ? "bg-sprout-200 top-1.5 left-1.5" : "")
	})

	return (
		<header class={`${props.sticky ? "sticky" : ""} top-0 w-screen flex items-center justify-between mx-3 xl:mx-5 2xl:mx-6`}>
			<A
				href="/"
				class="flex items-center justify-center text-lg 2xl:text-2xl font-bold px-1 rounded-sm text-sprout-650 overflow-visible ml-2 group"
			>
				<div class="relative h-4 w-auto">
					<div class={twMerge('absolute h-4 w-4 -top-1.5 -left-1.5 bg-sprout-300 dark:bg-sprout-400 rounded-sm transition-all duration-500 delay-300 transform-gpu', afterHover())} />
					<div class="absolute leading-none text-neutral-600 dark:text-slate-200 text-nowrap">
						{cfg.title}
					</div>
				</div>
			</A>
			<TheNav />
		</header>
	);
};

export default Header;
