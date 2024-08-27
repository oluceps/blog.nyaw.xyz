import { createSignal } from "solid-js";
import { TypstDocument } from "../lib/TypstDocument"

export function Typstest() {

  const str = "Hello, World!";
  const [artifact] = createSignal(new Uint8Array(str as unknown as number));
  return (<TypstDocument fill="#343541" artifact={artifact()} />)
}
