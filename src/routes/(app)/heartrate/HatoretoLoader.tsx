import { type Component, createSignal, onMount, Show } from "solid-js";

const HatoretoLoader: Component = () => {
	const [Component, setComponent] = createSignal<Component | null>(null);

	onMount(async () => {
		const mod = await import("./Hatoreto");
		setComponent(() => mod.default);
	});

	return (
		<Show when={Component()}>
			{(Comp) => <Comp />}
		</Show>
	);
};

export default HatoretoLoader;
