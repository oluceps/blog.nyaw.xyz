import { Component, createSignal, ParentProps } from "solid-js"
import { Collapse } from 'solid-collapse';


const Col: Component<ParentProps & { title: string }> =
  (props: ParentProps & { title: string }) => {
    const [expandState, setExpandState] = createSignal(false)

    return (
      <section class="CollapseContainer">
        <button
          onClick={() => setExpandState(!expandState())}
          class={`CollapseHeader ${!expandState() ? 'CollapseHeaderActive' : ''}`}
        >
          {props.title}
        </button>
        <Collapse value={expandState()} class="CollapseTransition">
          {props.children}
        </Collapse>
      </section>
    )
  }


export default Col;
