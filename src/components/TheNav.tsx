
import { createEffect, createSignal, For } from "solid-js";
import { Motion, Presence } from "solid-motionone"

export default function Home() {
  const tabs = ["Project", "Deployments", "Speed Insights", "Logs"];

  type TabRef = HTMLButtonElement | null;
  const [tabRefs] = createSignal<TabRef[]>([]);

  const [hoveredIdx, setHoveredIdx] = createSignal<number | null>(null);
  const [hoveredTab, setHoveredTab] = createSignal<DOMRect | undefined>(tabRefs()[hoveredIdx() ?? -1]?.getBoundingClientRect())

  createEffect(() => {
    setHoveredTab(tabRefs()[hoveredIdx() ?? -1]?.getBoundingClientRect())
  })

  createEffect(() => {
    // console.log(tabRefs())
    console.log(hoveredTab())
  })

  return (
    // <div class="flex-1">
      <nav
        onmouseleave={() => {
          setHoveredIdx(null);
        }}
        class={`bg-background flex items-center justify-end relative p-2 flex-1`}
      >
        {tabs.map((tab, idx) =>
          <button ref={(el) => {
            tabRefs()[idx] = el
          }}
            class="px-3 py-1.5 z-10 font-medium"
            onpointerenter={() => { setHoveredIdx(idx); console.log("enter", idx) }}
          >
            {tab}
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
    // </div>
  );
}


