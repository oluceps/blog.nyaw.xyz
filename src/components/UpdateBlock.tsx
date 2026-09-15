import { For, type Component } from "solid-js";
import { A } from "@solidjs/router";
import updates from "../generated/updates.json";

export const UpdateBlock: Component = () => {
	const recentUpdates = updates.slice(0, 5);

	return (
		<div class="w-full md:w-1/2 mx-auto px-6 mb-8">
			<div class="flex items-center gap-2 mb-4">
				<div class="i-ri:notification-3-line text-sprout-600" />
				<h2 class="text-sm font-mono uppercase tracking-widest text-ink-mute m-0">
					Recent Updates
				</h2>
			</div>
			<div class="space-y-4 border-l-2 border-sprout-100 pl-4">
				<For each={recentUpdates}>
					{(update) => (
						<div class="group">
							<div class="flex items-baseline gap-2 mb-1">
								<span class="text-[10px] font-mono text-ink-mute uppercase">
									{new Date(update.date).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</span>
								<span class="text-[10px] font-mono text-sprout-600">
									on
								</span>
								<A
									href={`/${update.postPath}`}
									class="text-[11px] font-serif italic text-ink-soft hover:text-sprout-700 transition-colors no-underline"
								>
									{update.postTitle}
								</A>
							</div>
							<p class="text-sm text-ink leading-relaxed m-0 line-clamp-2">
								{update.content}
							</p>
						</div>
					)}
				</For>
			</div>
		</div>
	);
};
