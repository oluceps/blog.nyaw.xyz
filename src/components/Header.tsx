import { A } from "@solidjs/router";
import { createEffect, createSignal, Suspense, type Component } from "solid-js";
import TheNav from "./TheNav";
import { useWindowScrollPosition } from "@solid-primitives/scroll";
import { twMerge } from "tailwind-merge";

const Header: Component = () => {
	const scroll = useWindowScrollPosition();

	const [afterHover, setAfterScroll] = createSignal("");

	createEffect(() => {
		setAfterScroll(scroll.y > 100 ? "bg-sprout-200 top-0 left-0" : "");
	});

	return (
		<header
			class={`flex w-full items-center justify-between pointer-events-none`}
		>
			<A
				href="/"
				class="flex items-center justify-center text-lg 2xl:text-2xl font-semibold rounded-sm text-sprout-650 overflow-visible group pointer-events-auto ml-3"
			>
				<div class="relative h-4">
					<div
						class={twMerge(
							"absolute h-4 w-4 -top-1.5 -left-1.5 bg-sprout-300 dark:bg-sprout-400 rounded-full transition-all duration-500 delay-800 transform-gpu shadow-md",
							afterHover(),
						)}
					/>
					<div class="absolute leading-none text-ouchi-200 text-shadow-xl dark:text-slate-200 text-nowrap font-sans">
						<div class="i-ci:leaf w-6 h-6 text-sprout-600" />
					</div>
				</div>
			</A>
			<div class="pointer-events-auto backdrop-blur-sm rounded-bl-2xl">
				<Suspense>
					<TheNav />
				</Suspense>
			</div>
		</header>
	);
};

export default Header;
