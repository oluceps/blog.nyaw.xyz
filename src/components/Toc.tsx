import {
	type Component,
	Index,
	Show,
	createEffect,
	onCleanup,
	createSignal,
	onMount,
	type ResolvedChildren,
} from "solid-js";
import { useLocation } from "@solidjs/router";
import { usePageState } from "./PageState";

export const TableOfContents: Component<{ children: ResolvedChildren }> = (
	props,
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
				(child) => child instanceof HTMLElement,
			) as HTMLElement | null;
			// if any of the child elements are not connected to the DOM the page contents haven't mounted yet
			if (firstElement && !firstElement.isConnected) return;
		}

		const headings = document.querySelectorAll("main h1, main h2, main h3");
		const sections: any = [];

		if (headings) {
			headings.forEach((heading) => {
				switch (heading.tagName) {
					case "H1":
						sections.push({
							text: heading.textContent,
							id: heading.id,
							level: 1,
							children: [],
						});
						break;
					case "H2":
						sections[sections.length - 1].children.push({
							text: heading.textContent,
							id: heading.id,
							level: 2,
							children: [],
						});
						break;
					case "H3":
						const ayaya = sections[sections.length - 1].children.length;
						sections[sections.length - 1].children[ayaya - 1].children.push({
							text: heading.textContent,
							id: heading.id,
							level: 3,
						});
						break;
				}
			});
		}

		setPageSections({
			path: location.pathname,
			sections: sections,
		});
		// console.log(sections)
	}

	createEffect(() => getHeaders(props.children));

	onMount(() => {
		document.addEventListener("layout-mounted", () =>
			getHeaders(props.children),
		);
	});

	const textAttr = "no-underline font-normal hover:font-bold";
	const olAttr =
		"pl-3 text-xs text-slate-700 list-disc decoration-sprout-300 active:font-bold active:text-sprout-600 space-y-0.5";

	return (
		<div class="w-full">
			<ol role="list" class={olAttr + " " + "marker:text-sprout-400"}>
				<Index each={pageSections.sections}>
					{(section) => {
						return (
							<Show when={section().id != ""}>
								<li class="pl-1.5 pt-0 space-y-px list-disc marker:text-sprout-400 my-0">
									<span>
										<a
											href={`#${section().id}`}
											classList={{
												"text-sprout-600 hover:text-slate-700":
													currentSection() === section().id,
											}}
											class={textAttr}
											target="_self"
										>
											{section().text}
										</a>
									</span>

									<Show when={section().children.length !== 0}>
										<ol role="list" class={olAttr}>
											<Index each={section().children}>
												{(subSection, idxSubSec) => (
													<li class="pl-1.5 pt-0 space-y-px list-disc marker:text-sprout-400 my-0">
														<a
															href={`#${subSection().id}`}
															class={textAttr}
															target="_self"
														>
															{subSection().text}
														</a>

														<Show when={section().children.length !== 0}>
															<ol role="list" class={olAttr}>
																<Index
																	each={section().children[idxSubSec].children}
																>
																	{(subSectionSub) => (
																		<li class="my-0">
																			<a
																				href={`#${subSectionSub().id}`}
																				class={textAttr}
																				target="_self"
																			>
																				{subSectionSub().text}
																			</a>
																		</li>
																	)}
																</Index>
															</ol>
														</Show>
													</li>
												)}
											</Index>
										</ol>
									</Show>
								</li>
							</Show>
						);
					}}
				</Index>
			</ol>
		</div>
	);
};
