import { Component, createSignal, ParentProps } from "solid-js"
import { Collapse } from 'solid-collapse';
import { plus } from "solid-heroicons/solid-mini"
import { Icon } from "solid-heroicons";


const Col: Component<ParentProps & { title: string }> =
  (props: ParentProps & { title: string }) => {
    const [expandState, setExpandState] = createSignal(false)

    return (
      <div class="rounded-md ring ring-sprout-200 p-3 mt-3"
        onmouseenter={() => setExpandState(!expandState())}
        onmouseleave={() => setExpandState(!expandState())}
      >
        <section class="CollapseContainer">
          <div class="flex justify-between items-center"><div class={`font-bold ${expandState() ? "text-sprout-600" : "text-slate-500"}`}>{props.title}</div><Icon path={plus} class={`w-4 h-4 mr-3 transition-all duration-500 ${expandState() ? "rotate-45" : ""}`} /></div>
          <Collapse value={expandState()} class="CollapseTransition">
            {props.children}
          </Collapse>
        </section>
      </div>
    )
  }


export default Col;
