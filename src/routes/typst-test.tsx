import { createSignal } from "solid-js";
import { TypstDocument } from "../lib/TypstDocument"

export default function Typstest() {

  const str = "Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!";
  const [artifact] = createSignal(new Uint8Array(str as unknown as number));
  return (<div class="w-full h-full justify-center items-center flex flex-col">
    This is for testing the [WIP] typst solidjs component
    <TypstDocument fill="#343541" artifact={artifact()} />
  </div>)
}
