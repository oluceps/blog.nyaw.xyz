import { Component, createSignal, ParentProps } from "solid-js"


const Collapse: Component<ParentProps & { title: string }> =
  (props: ParentProps & { title: string }) => {
    const [expandState, setExpandState] = createSignal(false)

    return (<>
      <div class="my-2 p-3 rounded-lg border-2 rounded-md border-sprout-300 w-full" onmouseenter={() => setExpandState(true)} onmouseleave={() => setExpandState(false)}>
        <div class="font-bold">{props.title}</div>
        <div class={expandState() ? "" : `hidden`}>
          {props.children}
        </div>
      </div></>
    )
  }


export default Collapse;
