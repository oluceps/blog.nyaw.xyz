import { A, useLocation } from "@solidjs/router";
import { createEffect, createMemo, createSignal, Suspense, type Component } from "solid-js";
import TheNav from "./TheNav";
import { useWindowScrollPosition } from "@solid-primitives/scroll";
import { twMerge } from "tailwind-merge";

const Header: Component = () => {
	const scroll = useWindowScrollPosition();

	const [afterScroll, setAfterScroll] = createSignal("");

	const location = useLocation();

	const onTop = createMemo(() => location.pathname == "/");

	createEffect(() => {
		setAfterScroll(scroll.y > 100 ? "bg-sprout-200/60 top-0 left-0 shadow-none" : "");
	});

	return (
		<header
			class={twMerge(`flex w-full items-center justify-between pointer-events-none`, onTop() ? "fixed top-0" : "")}
		>
			<A
				href="/"
				class="flex items-center justify-center text-lg 2xl:text-2xl font-semibold rounded-sm text-sprout-650 overflow-visible group pointer-events-auto ml-3"
			>
				<div class="relative h-4">
					<div
						class={twMerge(
							"absolute h-4 w-4 -top-1.5 -left-1.5 bg-sprout-300 rounded-full transition-all duration-500 delay-400 transform-gpu shadow-md",
							afterScroll(),
						)}
					/>
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
