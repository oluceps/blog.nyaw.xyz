import { Show, type Component } from "solid-js";
import { useWindowScrollPosition } from "@solid-primitives/scroll";
import { Icon } from "solid-heroicons";
import { chevronUp } from "solid-heroicons/solid";
const ScrollTopBtn: Component = () => {
	const scroll = useWindowScrollPosition();
	return (
		<>
			<Show when={scroll.y > 350 && document.documentElement.clientWidth > 930}>
				<button
					onclick={() => {
						window.scrollTo({ top: 0, behavior: "smooth" });
					}}
					class="!fixed bottom-5 right-5 p-3 mb-3 hover:bg-sprout-200/60 bg-sprout-100 rounded-md h-9 w-9 grid items-center justify-center duration-200 bg-sprout-300/75 h-9 w-9"
				>
					<Icon path={chevronUp} class={`h-full w-full`} />
				</button>
			</Show>
		</>
	);
};

export default ScrollTopBtn;
