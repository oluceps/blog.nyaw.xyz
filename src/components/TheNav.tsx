
import { A } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import { Motion, Presence } from "solid-motionone"
import cfg from "../constant";

export default function Home() {
  const menu = cfg.extra.menu;

  type TabRef = HTMLButtonElement | null;
  const [tabRefs] = createSignal<TabRef[]>([]);

  const [hoveredIdx, setHoveredIdx] = createSignal<number | null>(null);
  const [hoveredTab, setHoveredTab] = createSignal<DOMRect | undefined>(tabRefs()[hoveredIdx() ?? -1]?.getBoundingClientRect())

  createEffect(() => {
    setHoveredTab(tabRefs()[hoveredIdx() ?? -1]?.getBoundingClientRect())
  })

  return (
    <nav
      onmouseleave={() => {
        setHoveredIdx(null);
      }}
      class={`bg-background flex items-center justify-end relative pt-2 pr-2 flex-1`}
    >
      {menu.map((tab, idx) =>
        <button ref={(el) => {
          tabRefs()[idx] = el
        }}
          class="px-2 py-1.5 z-10 font-base text-slate-600 hover:text-black"
          onpointerenter={() => { setHoveredIdx(idx); console.log("enter", idx) }}
        >
          <A href={tab.url}>
            {tab.name}
          </A>
        </button>)
      }
      {hoveredTab() ? (
        <Presence>
          <Motion.button
            class="absolute top-0 left-0 bg-sprout-200/90 rounded-md"
            initial={{
              top: hoveredTab()?.top + "px",
              left: hoveredTab()?.left + "px",
              width: hoveredTab()?.width + "px",
              height: hoveredTab()?.height + "px",
              opacity: 0,
            }}
            animate={{
              top: hoveredTab()?.top + "px",
              left: hoveredTab()?.left + "px",
              width: hoveredTab()?.width + "px",
              height: hoveredTab()?.height + "px",
              opacity: 1,
            }}
            exit={{
              top: hoveredTab()?.top + "px",
              left: hoveredTab()?.left + "px",
              width: hoveredTab()?.width + "px",
              height: hoveredTab()?.height + "px",
              opacity: 0,
            }}
            transition={{
              duration: 0.14,
            }}
          />
        </Presence>
      ) : null}
    </nav>
  );
}


