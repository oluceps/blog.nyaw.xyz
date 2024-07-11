import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { Show, ParentComponent, children, createSignal, createEffect, createMemo } from "solid-js";
import cfg from "../constant";
import data from "../routes/data.json"
import { useLocation } from "@solidjs/router";
import { TableOfContents } from "./Toc";
import BackTopBtn from "./BackTopBtn";

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
			<Meta name="description" content={article()?.description || cfg.description} />
			<Meta
				name="keywords"
				content={article()?.tags?.join(",")}
			/>
			<Meta property="article:published_time" content={formatDate(article()?.date)} />
			<article class="antialiased prose 2xl:prose-lg dark:prose-invert justify-self-center mx-auto mb-16 w-full mt-10 break-words">
				<Show when={!article()?.noBanner}>
					<h1>{article()?.title}</h1>
					<div class="text-zinc-500 font-serif mb-2 font-light text-sm 2xl:text-lg">
						{formatDate(article()?.date)}
					</div>

					<div class="flex w-auto mb-10 justify-end items-end">
						<Show when={1}>
							<i class="text-pretty text-slate-500 text-start text-sm 2xl:text-lg font-mono leading-loose">
								{article()?.description}
							</i>
						</Show>
					</div>
					<Show when={article()?.toc}>
						<TableOfContents children={resolved()} />
					</Show>
				</Show>
				{resolved()}
			</article>
		</MetaProvider>
	);
};
export default Page;
