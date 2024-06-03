import { A } from "@solidjs/router";
import { type Component, For } from "solid-js";
import cfg from "../constant";

const Header: Component<{sticky: boolean}> = (props) => {

	return (
		<header class={`${props.sticky ? "sticky" : ""} backdrop-blur-xl top-0 w-screen px-3 xl:px-5 2xl:px-6 pt-2 pb-2`}>
			<nav class="flex items-center justify-between flex-nowrap">
				<A
					href="/"
					class="flex items-center justify-center text-lg font-bold px-1 rounded-sm text-sprout-650 overflow-visible"
				>
					<div class="relative h-4 w-auto">
						<div class="absolute h-4 w-4 -top-1.5 -start-1.5 bg-sprout-300 dark:bg-sprout-400 rounded-sm" />
						<div class="absolute leading-none text-slate-600 dark:text-slate-200 text-nowrap">
							{cfg.title}
						</div>
					</div>
				</A>
				<div id="nav-menu" class="flex justify-end items-end w-auto space-x-1">
					<For each={cfg.extra.menu}>
						{(item) => (
							<A
								href={item.url}
								class="flex text-slate-600 px-3 py-2 leading-none hover:shadow-sm hover:text-slate-700 ease-in-out hover:backdrop-blur-2xl hover:bg-sprout-100 transition-all duration-400 justify-center items-center rounded-md overflow-visible dark:text-chill-200"
							>
								{item.name}
							</A>
						)}
					</For>
				</div>
			</nav>
		</header>
	);
};

export default Header;
