import {
	createContext,
	useContext,
	createEffect,
	onCleanup,
	createSignal,
} from "solid-js";
import type { LenisContextValue, LenisProps } from "./types";
import { onMount } from "solid-js";
import Tempus from "@darkroom.engineering/tempus";
import Lenis, { type ScrollCallback } from "lenis";
import { createStore } from "solid-js/store";

export const LenisContext = createContext<LenisContextValue>();

const [rootLenisContextStore, setRootLenisContextStore] = createStore<Partial<LenisContextValue>>();


// Lenis hook in SolidJS
export function useLenis(callback?: ScrollCallback, priority = 0) {
	const fallbackContext: Partial<LenisContextValue> = {};
	const localContext = useContext(LenisContext);
	const rootContext = rootLenisContextStore;

	// Check if it's an accessor or the direct value
	const currentContext = localContext ?? rootContext ?? fallbackContext;

	const { lenis, addCallback, removeCallback } =
		currentContext as LenisContextValue;

	createEffect(() => {
		if (!callback || !addCallback || !removeCallback || !lenis) return;

		addCallback(callback, priority);
		callback(lenis);

		onCleanup(() => removeCallback(callback));
	});

	return lenis;
}

// Lenis component in SolidJS
export function SolidLenis(props: LenisProps) {
	const [wrapperRef, setWrapperRef] = createSignal<HTMLDivElement | null>();
	const [contentRef, setContentRef] = createSignal<HTMLDivElement | null>();
	const [lenis, setLenis] = createSignal<Lenis | undefined>(undefined);

	createEffect(() => {
		console.log(rootLenisContextStore.lenis)
	})

	onMount(() => {
		console.log("solid lenis init");
		const lenisInstance = new Lenis({
			...props.options,
			...(props.root === false && {
				wrapper: wrapperRef()!,
				content: contentRef()!,
			}),
		});
		setLenis(lenisInstance);

		if (props.autoRaf) {
			const rafId = Tempus.add(
				(time: number) => lenisInstance.raf(time),
				props.rafPriority || 0,
			);
			onCleanup(() => Tempus.remove(rafId));
		}

		if (props.root) {
			setRootLenisContextStore({
				lenis: lenisInstance,
				addCallback,
				removeCallback,
			});
			onCleanup(() => setRootLenisContextStore({}));
		}

		onCleanup(() => {
			lenisInstance.destroy();
			setLenis(undefined);
		});
	});

	const callbacksRefs = [] as { callback: ScrollCallback; priority: number }[];

	const addCallback: LenisContextValue["addCallback"] = (
		callback,
		priority,
	) => {
		callbacksRefs.push({ callback, priority });
		callbacksRefs.sort((a, b) => a.priority - b.priority);
	};

	const removeCallback: LenisContextValue["removeCallback"] = (callback) => {
		callbacksRefs.splice(
			callbacksRefs.findIndex((cb) => cb.callback === callback),
			1,
		);
	};

	createEffect(() => {
		const lenisInstance = lenis();
		if (!lenisInstance) return;

		const onScroll: ScrollCallback = (data) => {
			callbacksRefs.forEach((cb) => cb.callback(data));
		};

		lenisInstance.on("scroll", onScroll);
		onCleanup(() => lenisInstance.off("scroll", onScroll));
	});

	return (
		<LenisContext.Provider
			value={{ lenis: lenis()!, addCallback, removeCallback }}
		>
			{props.root ? (
				props.children
			) : (
				<div ref={setWrapperRef} class={props.className} {...props.props}>
					<div ref={setContentRef}>{props.children}</div>
				</div>
			)}
		</LenisContext.Provider>
	);
}

export * from "./types";
export { SolidLenis as Lenis };
export default SolidLenis;
