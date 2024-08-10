import { createMemo, type Component, type ParentProps } from "solid-js"
import { Collapse } from 'solid-collapse';
import { plus } from "solid-heroicons/solid-mini"
import { Icon } from "solid-heroicons";
import { useAboutState } from "./about-state";


const Col: Component<ParentProps & { title: string, comment: string }> =
  (props) => {

    const { activeState, setActiveState } = useAboutState();

    const isActive = createMemo(() => activeState() == props.title);

    return (
      <div class="rounded-md hover:shadow-md border border-sprout-300 transition-all duration-200 p-3 mt-3"
        onClick={() => props.title == activeState() ? setActiveState("") : setActiveState(props.title)}
      >
        <section>
          <div class="flex justify-start items-center">
            <Icon path={plus} class={`w-4 h-4 mx-3 my-2 transition-all duration-500 transform-gpu ${isActive() ? "rotate-45" : ""}`} />
            <div class={`font-bold flex w-full items-center justify-between mx-3 ${isActive() ? "text-sprout-600" : "text-zinc-500"}`}>
              <div>{props.title}</div>
              <div class="font-mono text-zinc-400">{props.comment}</div>
            </div>
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
