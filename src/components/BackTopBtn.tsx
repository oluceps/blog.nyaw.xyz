import { createEffect, createSignal, Show, type Component } from "solid-js";
import { useWindowScrollPosition } from "@solid-primitives/scroll";
import { Icon } from "solid-heroicons";

import {
  chevronUp
} from "solid-heroicons/solid";
const ScrollTopBtn: Component = () => {
  const scroll = useWindowScrollPosition();
  return (<>
    <Show when={(scroll.y > 350) && (document.documentElement.clientWidth > 930)}>
      <button onclick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }} class={`!fixed bottom-5 right-5 p-3 mb-3 bg-sprout-200/60 backdrop-blur-md rounded-md h-9 w-9 grid items-center justify-center
        transition-all duration-500 hover:h-11 hover:w-11
        ${document.documentElement.scrollHeight - document.documentElement.clientHeight - scroll.y < 200 ? "[&:not(:hover)]:motion-safe:animate-pulse bg-sprout-300/75" : ""}`}>
        <Icon path={chevronUp} class={`h-full w-full`} />
      </button>
    </Show>
  </>
  );
};

export default ScrollTopBtn;
