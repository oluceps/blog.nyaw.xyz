import { createEffect, createResource, createSignal, onMount } from "solid-js";
import { TypstDocument } from "../lib/TypstDocument";

export default function Typstest() {

	const getArtifactData = async () => {
		const response = await fetch(
			'http://localhost:3000/a.artifact.sir.in',
		).then(response => response.arrayBuffer());

		return (new Uint8Array(response));
	};
	const [a] = createResource(getArtifactData);

	return (
		<div class="w-full h-full justify-center items-center flex flex-col">
			This is for testing the [WIP] typst solidjs component
			<TypstDocument fill="#343541" artifact={a()} />
		</div>
	);
}
