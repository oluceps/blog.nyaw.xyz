import { useLocation } from "@solidjs/router";
import { Show } from "solid-js";
import Page from "~/components/Page";
import { docsMap } from "solid:collection";

export default function PostLayout(props: { children?: any }) {
	const location = useLocation();

	const article = () => {
		const path = location.pathname.slice(1); // remove leading slash
		return docsMap[path];
	};

	return (
		<Show when={article()} fallback={<div>Loading...</div>}>
			<Page article={article()}>
				{props.children}
			</Page>
		</Show>
	);
}
