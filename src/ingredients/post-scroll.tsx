import { Show, type Component, type ParentProps } from "solid-js";

import { useWindowScrollPosition } from "@solid-primitives/scroll";

const PostScoll: Component<ParentProps> = (props) => {
	const scroll = useWindowScrollPosition();
	return (
		<>
			<div id="enc" class={scroll.y < 20 ? "h-48" : "h-4"} />
			<Show when={scroll.y > 20}>{props.children}</Show>
		</>
	);
};

export default PostScoll;
