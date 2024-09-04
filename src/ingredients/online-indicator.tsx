import { onCleanup, Show, type Component } from "solid-js";
import { createSignal, onMount } from "solid-js";
import ky from "ky";
import { twMerge } from "tailwind-merge";
const OnlineIndicator: Component = () => {
	const [isOnline, setIsOnline] = createSignal(false);

	const fetchOnlineStatus = async () => {
		try {
			const response = await ky.get(`/api/online`).json<boolean>();
			setIsOnline(response);
		} catch (error) {
			console.error("Failed to fetch user status:", error);
			setIsOnline(false);
		}
	};
	onMount(() => {
		fetchOnlineStatus();

		const interval = setInterval(fetchOnlineStatus, 5000);

		onCleanup(() => clearInterval(interval));
	});

	return (
		<>
			<Show when={isOnline()}>
				<div class="absolute top-1.5 right-1.5 w-6 h-6 md:-top-2 md:-right-2 z-20 bg-sprout-200 rounded-full animate-ping pointer-events-none" />
			</Show>
			<a
				data-tip={isOnline() ? "online" : "offline"}
				class={twMerge(
					`absolute tooltip ring-2 z-10 ring-sprout-50 top-1.5 right-1.5 w-6 h-6 md:-top-2 md:-right-2 rounded-full`,
					isOnline() ? "bg-sprout-200" : "bg-slate-300",
				)}
				href="https://nyaw.xyz/@lyo"
			/>
		</>
	);
};

// <div {...(isOnline() ? { 'data-tip': "online" } : {})} class={twMerge(`absolute tooltip -bottom-0 -right-0 w-4 h-4 md:w-8 md:h-8 md:-top-2 md:-right-2 rounded-full`, isOnline() ? "bg-sprout-200 md:bg-sprout-300" : "bg-slate-300")} />
export default OnlineIndicator;
