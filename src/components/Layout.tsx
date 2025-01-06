import { lazy } from "solid-js";
import {
	type ParentProps,
	createEffect,
	createSignal,
} from "solid-js";
import { useLocation } from "@solidjs/router";
import Me from "~/ingredients/me";
import Footer from "./Footer";

const Header = lazy(() => import("./Header"));

export function Layout(props: ParentProps) {
	const location = useLocation();
	const [currentPath, setCurrentPath] = createSignal(location.pathname);

	createEffect(() => {
		setCurrentPath(location.pathname);
	});

	const isRoot = () => currentPath() === "/";

	return (
		<>
			<div class="flex flex-col bg-zinc-50 dark:bg-[#171717] min-h-screen items-center">
				<Header sticky={isRoot()} />
				<Me />
				<Footer />
			</div>
		</>
	);
}
