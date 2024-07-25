
import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import { Motion, Presence } from "solid-motionone"
import cfg from "../constant";
import { useLocation } from "@solidjs/router";

export default function Home() {
  const menu = cfg.menu;

  const navigate = useNavigate();

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
      class={`bg-background flex items-center justify-end relative pt-2 pr-2`}
    >
      {menu.map((tab, idx) =>
        <button ref={(el) => {
          tabRefs()[idx] = el
        }}
          class={`px-1.5 py-1 z-10 font-base text-neutral-500 hover:text-neutral-600 transition-all duration-500 rounded-md
          ${useLocation().pathname == tab.url && !hoveredTab() && useLocation().pathname.length != 1 ? "bg-sprout-100 text-neutral-700/80" : ""}`}
          onpointerenter={() => { setHoveredIdx(idx) }}
          onclick={() => tab.url.startsWith("/") ? navigate(tab.url) : window.open(tab.url, '_blank')}
        >
          {tab.name}
        </button>)
      }
      {hoveredTab() ? (
        <Presence>
          <Motion.button
            class="absolute top-0 right-0 bg-sprout-200/90 rounded-md"
            initial={{
              top: hoveredTab()?.top + "px",
              right: document.documentElement.clientWidth - (hoveredTab()?.right || 0) + "px",
              width: hoveredTab()?.width + "px",
              height: hoveredTab()?.height + "px",
              opacity: 0,
            }}
            animate={{
              top: hoveredTab()?.top + "px",
              right: document.documentElement.clientWidth - (hoveredTab()?.right || 0) + "px",
              width: hoveredTab()?.width + "px",
              height: hoveredTab()?.height + "px",
              opacity: 1,
            }}
            exit={{
              top: hoveredTab()?.top + "px",
              right: document.documentElement.clientWidth - (hoveredTab()?.right || 0) + "px",
              width: hoveredTab()?.width + "px",
              height: hoveredTab()?.height + "px",
              opacity: 0,
            }}
            transition={{
              duration: 0.18,
            }}
          />
        </Presence>
      ) : null}
    </nav>
  );
}


