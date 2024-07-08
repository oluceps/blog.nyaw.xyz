import { createEffect, createSignal, Show, type Component } from "solid-js";
import { useWindowScrollPosition } from "@solid-primitives/scroll";
import { Icon } from "solid-heroicons";

import {
  chevronUp
} from "solid-heroicons/solid";
const ScrollTopBtn: Component = () => {
  const [hiddenState, setHiddenState] = createSignal(true)
  const scroll = useWindowScrollPosition();
  createEffect(() => {
    if (scroll.y > 350) {
      setHiddenState(false)
    } else {
      setHiddenState(true)
    }
  })
  return (<>
    <Show when={!hiddenState() && (document.documentElement.clientWidth > 930)}>
      <button onclick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }} class={`!fixed bottom-5 right-5 p-3 mb-3 bg-sprout-200/60 backdrop-blur-md rounded-md h-9 w-9 grid items-center justify-center}`}>
        <Icon path={chevronUp} class="h-full w-full" />
      </button>
    </Show>
  </>
  );
};

export default ScrollTopBtn;