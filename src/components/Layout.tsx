import { Link, Meta, MetaProvider } from "@solidjs/meta";
import cfg from "../constant";
import { lazy, Suspense } from "solid-js";
import {
	Match,
	type ParentProps,
	Switch,
	createEffect,
	createSignal,
} from "solid-js";
import { useLocation } from "@solidjs/router";
import Page from "./Page";
import Root from "./Root";
import { PageStateProvider } from "./PageState";
import Taxo from "./Taxo";
// import Footer from "./Footer";
import Me from "~/ingredients/me";
import Footer from "./Footer";

const BackTopBtn = lazy(() => import("./BackTopBtn"));
const Header = lazy(() => import("./Header"));

export function Layout(props: ParentProps) {
	const location = useLocation();
	const [currentPath, setCurrentPath] = createSignal(location.pathname);
	createEffect(() => {
		setCurrentPath(location.pathname);
	});

	const isRoot = () => currentPath() === "/";
	const isTaxo = () => currentPath().replaceAll("/", "") === "taxonomy";
	const isMe = () => currentPath().replaceAll("/", "") === "me";

	return (
		<MetaProvider>
			<PageStateProvider>
				<Link rel="canonical" href={cfg.base_url} />
				<Meta
					name="twitter:image"
					content={cfg.base_url + "/" + "twitter-card.png"}
				/>
				<Meta name="twitter:card" content="summary_large_image" />
				<Meta
					property="og:image"
					content={cfg.base_url + "/" + "twitter-card.png"}
				/>
				<Meta property="og:url" content={cfg.base_url} />
				<Meta property="og:site_name" content={cfg.title} />
				<Meta property="og:title" content={cfg.title} />
				<Meta property="og:description" content={cfg.description} />
				<div class="flex flex-col bg-zinc-50 dark:bg-[#171717] min-h-screen items-center">
					<Suspense>
						<Header sticky={isRoot()} />
					</Suspense>
					<Switch
						fallback={
							<div class="flex flex-col flex-1 grow pb-12 w-11/12 md:w-full">
								<Page>{props.children}</Page>
							</div>
						}
					>
						<Match when={isRoot()}>
							<Root />
						</Match>
						<Match when={isMe()}>
							<Me />
						</Match>
						<Match when={isTaxo()}>
							<Taxo />
						</Match>
					</Switch>
					<Suspense>
						<BackTopBtn />
					</Suspense>
					<Footer />
				</div>
			</PageStateProvider>
		</MetaProvider>
	);
}
