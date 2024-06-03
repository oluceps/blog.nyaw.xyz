import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { type Component, Show, ParentComponent, children, createSignal, createEffect, createMemo, Suspense } from "solid-js";

import cfg from "../constant";
import { Layout } from "./Layout";
import components from "./Mdx";
import { isError } from "vinxi/http";
import data from "../routes/data.json"
import { useLocation } from "@solidjs/router";
import PageLoading from "./PageLoading";

function formatDate(date: Date | undefined) {
	if (date === undefined) {
		return ""
	}
	const year = date.getFullYear();

	const month = (date.getMonth() + 1).toString().padStart(2, "0");

	const day = date.getDate().toString().padStart(2, "0");

	return `${year}-${month}-${day}`;
}
const Page: ParentComponent<{ isError?: false }> = (props) => {
	const resolved = children(() => props.children)
	const location = useLocation();
	const [currentPath, setCurrentPath] = createSignal(location.pathname);
	createEffect(() => {
		setCurrentPath(location.pathname);
	});

	const [ctx] = createSignal(
		data.map((i) => { return { ...i, date: new Date(i.date) } })
	);

	const currentUrl = `${cfg.base_url}${location.pathname}`

	const article = createMemo(() => ctx().find((i) => i.path === currentPath().substring(1)))
	return (
		<MetaProvider>
			<Title>{`${article()?.title} - ${cfg.title}`}</Title>
			<Link rel="canonical" href={currentUrl} />
			<Meta name="description" content={article()?.description || cfg.extra.description} />
			<Meta
				name="keywords"
				content={article()?.tags?.join(",")}
			/>
			<article class="antialiased prose dark:prose-invert justify-self-center mx-auto mb-16 w-full mt-10 break-words">
				<h1>{article()?.title}</h1>
				<div class="text-zinc-500 font-serif mb-2 font-light text-sm">
					{formatDate(article()?.date)}
				</div>

				<div class="flex w-auto mb-10 justify-end items-end">
					<Show when={1}>
						<i class="text-pretty text-slate-500 text-start text-sm font-mono leading-loose">
							{article()?.description}
						</i>
					</Show>
				</div>
				{resolved()}
			</article>

		</MetaProvider>
	);
};
export default Page;
