import { Link, Meta, Title } from "@solidjs/meta";
import { Show, type ParentComponent, children, createMemo } from "solid-js";
import cfg from "../constant";
import { useLocation } from "@solidjs/router";
import { TableOfContents } from "./Toc";
import { ctxFiltered } from "./Arti";

function formatDate(date: Date | undefined) {
	if (date === undefined) {
		return "";
	}
	const year = date.getFullYear();

	const month = (date.getMonth() + 1).toString().padStart(2, "0");

	const day = date.getDate().toString().padStart(2, "0");

	return `${year}-${month}-${day}`;
}
const Page: ParentComponent<{ isError?: false }> = (props) => {
	const resolved = children(() => props.children);
	const location = useLocation();

	const ctx = ctxFiltered;

	const article = createMemo(() =>
		ctx.find((i) => i.path == location.pathname.replaceAll("/", "")),
	);

	const currentUrl = `${cfg.base_url}${location.pathname}`;
	return (
		<article class="antialiased prose 2xl:prose-lg dark:prose-invert justify-self-center mx-auto mb-16 w-full mt-10 break-words">
			<Title>{`${article()?.title} - ${cfg.title}`}</Title>
			<Link rel="canonical" href={currentUrl} />
			<Meta property="og:url" content={currentUrl} />
			<Meta
				name="description"
				content={article()?.description || cfg.description}
			/>
			<Meta property="og:title" content={cfg.title} />
			<Meta property="og:description" content={cfg.description} />
			<Meta name="keywords" content={article()?.tags?.join(",")} />
			<Meta
				property="article:published_time"
				content={formatDate(article()?.date)}
			/>
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
			{resolved()}
		</article>
	);
};
export default Page;
