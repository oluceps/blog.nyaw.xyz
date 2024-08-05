import { createMemo, type Component, type ParentProps } from "solid-js"
import { Collapse } from 'solid-collapse';
import { plus } from "solid-heroicons/solid-mini"
import { Icon } from "solid-heroicons";
import { useAboutState } from "./about-state";


const Col: Component<ParentProps & { title: string }> =
  (props: ParentProps & { title: string }) => {

    const { activeState, setActiveState } = useAboutState();

    const isActive = createMemo(() => activeState.state == props.title);

    return (
      <div class="rounded-md ring ring-sprout-200 p-3 mt-3"
        onClick={() => setActiveState({ state: props.title })}
      >
        <section class="CollapseContainer">
          <div class="flex justify-between items-center"><div class={`font-bold ${isActive() ? "text-sprout-600" : "text-slate-500"}`}>
            {props.title}
          </div>
            <Icon path={plus} class={`w-4 h-4 mr-3 transition-all duration-500 transform-gpu ${isActive() ? "rotate-45" : ""}`} />
          </div>
          <div onClick={(e) => e.stopPropagation()} >
            <Collapse value={isActive()} class="CollapseTransition">
              {props.children}
            </Collapse>
          </div>
        </section>
      </div>
    )
  }


export default Col;
