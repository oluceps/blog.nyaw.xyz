import { onCleanup, Show, type Component } from "solid-js";
import { createSignal, onMount } from "solid-js";
import ky from "ky";
import { twMerge } from "tailwind-merge";
import Tooltip from "@corvu/tooltip";
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

			<Tooltip
				placement="top"
				openDelay={200}
				floatingOptions={{
					offset: 13,
					flip: true,
					shift: true,
				}}
			>

				<Tooltip.Trigger
					as="a"
					class={twMerge(
						`absolute tooltip ring-2 z-10 ring-sprout-50 top-1.5 right-1.5 w-6 h-6 md:-top-2 md:-right-2 rounded-full`,
						isOnline() ? "bg-sprout-200" : "bg-slate-300",
					)}
					href="https://nyaw.xyz/@lyo"
					target="_blank"
				>
					<span class="sr-only">misskey profile</span>
				</Tooltip.Trigger>
				<Tooltip.Portal>
					<Tooltip.Content class="rounded-lg bg-corvu-100 px-2 py-1 font-medium corvu-open:animate-in corvu-open:fade-in-50 corvu-open:slide-in-from-bottom-1 corvu-closed:animate-out corvu-closed:fade-out-50 corvu-closed:slide-out-to-bottom-1 text-zinc-600 font-sans font-bold">
						{isOnline() ? "在线" : "待机"}
						<Tooltip.Arrow class="text-corvu-100" />
					</Tooltip.Content>
				</Tooltip.Portal>
			</Tooltip>
		</>
	);
};

export default OnlineIndicator;
