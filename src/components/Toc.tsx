import {
	Component,
	Index,
	Show,
	createEffect,
	onCleanup,
	createSignal,
	onMount,
	type ResolvedChildren,
} from "solid-js";
import { useLocation } from "@solidjs/router";
import { usePageState } from "./page-state";


export const TableOfContents: Component<{ children: ResolvedChildren }> = (
	props
) => {
	const location = useLocation();
	const [currentSection, setCurrentSection] = createSignal("");
	const { setPageSections, pageSections } = usePageState();


	const onScroll = () => {
		const headings = document.querySelectorAll("main h1, main h2, main h3");
		let currentSection = "";
		headings.forEach((heading) => {
			if (heading.getBoundingClientRect().top < 300) {
				currentSection = heading.id;
			}
		});
		setCurrentSection(currentSection);
	};

	createEffect(() => {
		window.addEventListener("scroll", onScroll);
		onCleanup(() => {
			window.removeEventListener("scroll", onScroll);
		});
	});

	function getHeaders(children: ResolvedChildren) {
		if (children) {
			if (!Array.isArray(children)) return;
			const firstElement = children.find(
				(child) => child instanceof HTMLElement
			) as HTMLElement | null;
			// if any of the child elements are not connected to the DOM the page contents haven't mounted yet
			if (firstElement && !firstElement.isConnected) return;
		}

		const headings = document.querySelectorAll("main h1, main h2, main h3");
		const sections: any = [];

		if (headings) {
			headings.forEach((heading) => {

				if (heading.tagName === "H1") {
					sections.push({
						text: heading.textContent,
						id: heading.id,
						level: 1,
						children: [],
					});
				} else if (heading.tagName === "H2") {
					sections.push({
						text: heading.textContent,
						id: heading.id,
						level: 2,
						children: [],
					});
				} else if (heading.tagName === "H3") {
					sections[sections.length - 1].children.push({
						text: heading.textContent,
						id: heading.id,
						level: 3,
					});
				}
			});
		}

		setPageSections({
			path: location.pathname,
			sections: sections,
		});
	}

	createEffect(() => getHeaders(props.children));

	onMount(() => {
		document.addEventListener("layout-mounted", () =>
			getHeaders(props.children)
		);
	});

	return (
		<div class="w-full">
			<ol
				role="list"
				class="text-xs list-none marker:text-sprout-400 mt-2 p-0 flex flex-col pl-2.5 space-y-1"
			>
				<Index each={pageSections.sections}>
					{(section) => {
						console.log(section)
						return (

							<Show when={section().id != ""}>
								<li class="pl-1.5 pt-0 space-y-0.5 list-disc marker:text-sprout-400">
									<span>
										<a
											href={`#${section().id}`}
											classList={{
												"text-sprout-600 hover:text-slate-700 font-bold":
													currentSection() === section().id,
											}}
											class="no-underline hover:font-bold hover:text-slate-700"
											target="_self"
										>
											{section().text}
										</a>
									</span>

									<Show when={section().children.length !== 0}>
										<ol
											role="list"
											class="pl-2.5 text-slate-500 list-disc decoration-sprout-300 active:font-bold hover:text-slate-700 font-bold active:text-sprout-600 space-y-0.5"
										>
											<Index each={section().children}>
												{(subSection) => (
													<li>
														<a
															href={`#${subSection().id}`}
															classList={{
																"text-sprout-600 hover:text-slate-700 font-bold":
																	currentSection() === subSection().id,
															}}
															class="no-underline hover:font-bold hover:text-sprout-700"
															target="_self"
														>
															{subSection().text}
														</a>
													</li>
												)}
											</Index>
										</ol>
									</Show>
								</li>

							</Show>
						)
					}}
				</Index>
			</ol>
		</div>
	);
}
