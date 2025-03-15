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
import { SolidLenis } from "lenis-solid";
import { useLocation } from "@solidjs/router";
import Page from "./Page";
import Root from "./Root";
import { PageStateProvider, TaxoJumpStateProvider, TaxoTypeStateProvider } from "./PageState";
import Taxo from "./Taxo";
import Me from "~/ingredients/me";
import Search from "./Search"
import Spinner from "./Spinner";

const BackTopBtn = lazy(() => import("./BackTopBtn"));
const Header = lazy(() => import("./Header"));
const Footer = lazy(() => import("./Footer"));

export function Layout(props: ParentProps) {
	const location = useLocation();
	const [currentPath, setCurrentPath] = createSignal(location.pathname);

	createEffect(() => {
		setCurrentPath(location.pathname);
	});

	const isRoot = () => currentPath() === "/";
	const isTaxo = () => currentPath().replaceAll("/", "") === "taxonomy";
	const isSearch = () => currentPath().replaceAll("/", "") === "search";
	const isMe = () => currentPath().replaceAll("/", "") === "me";
	const easeCurve = (x: number) => 1 - Math.pow(1 - x, 4);
	return (
		<PageStateProvider>
			<TaxoJumpStateProvider>
				<MetaProvider>
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
				</MetaProvider>
				<SolidLenis autoRaf={true} root options={{
					duration: 0.80,
					easing: easeCurve,
					__experimental__naiveDimensions: true
				}}>
					<div class="flex flex-col bg-zinc-50 dark:bg-[#171717] min-h-screen grow items-center">
						<Suspense>
							<Header />
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
								<Suspense
									fallback={
										<Spinner />
									}
								>
									<Me />
								</Suspense>
							</Match>
							<Match when={isTaxo()}>
								<Taxo />
							</Match>
							<Match when={isSearch()}>
								<Search />
							</Match>
						</Switch>

						<Suspense>
							<Footer />
						</Suspense>
					</div>
				</SolidLenis>

				<Suspense>
					<BackTopBtn />
				</Suspense>
			</TaxoJumpStateProvider>
		</PageStateProvider>
	);
}
