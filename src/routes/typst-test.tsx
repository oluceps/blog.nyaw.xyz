import { createSignal } from "solid-js";
import { TypstDocument } from "../lib/TypstDocument"

export function Typstest() {

  const str = "Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!";
  const [artifact] = createSignal(new Uint8Array(str as unknown as number));
  return (<div class="w-full h-full"><TypstDocument fill="#343541" artifact={artifact()} /></div>)
}
