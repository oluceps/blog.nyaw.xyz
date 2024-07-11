import { A } from "@solidjs/router";
import { type Component } from "solid-js";
import cfg from "../constant";
import TheNav from "./TheNav";

const Header: Component<{ sticky: boolean }> = (props) => {

	return (
		<header class={`${props.sticky ? "sticky" : ""} backdrop-blur-sm top-0 w-screen flex items-center justify-between mx-3 xl:mx-5 2xl:mx-6`}>
			<A
				href="/"
				class="flex items-center justify-center text-lg 2xl:text-2xl font-bold px-1 rounded-sm text-sprout-650 overflow-visible ml-2 group"
			>
				<div class="relative h-4 w-auto">
					<div class="absolute h-4 w-4 -top-1.5 -start-1.5 bg-sprout-300 dark:bg-sprout-400 rounded-sm group-hover:h-6 group-hover:w-6 transition-all duration-500 group-hover:bg-sprout-200" />
					<div class="absolute leading-none text-neutral-600 group-hover:text-neutral-500 dark:text-slate-200 text-nowrap">
						{cfg.title}
					</div>
				</div>
			</A>
			<TheNav />
		</header>
	);
};

export default Header;
