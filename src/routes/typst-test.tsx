import { createResource } from "solid-js";
import { TypstDocument } from "../lib/TypstDocument";
import cfg from "../constant";

export default function Typstest() {
	const getArtifactData = async () => {
		const response = await fetch(
			(() => {
				const suff = "/readme.artifact.sir.in";
				// @ts-ignore
				if (import.meta.env.PROD) {
					return cfg.base_url + suff;
				}
				const ret = "http://localhost:3000" + suff;
				console.log(ret);
				return ret;
			})(),
		).then((response) => response.arrayBuffer());

		return new Uint8Array(response);
	};
	const [a] = createResource(getArtifactData);

	return (
		<div class="w-full h-full justify-center items-center flex flex-col">
			This is for testing the [WIP] typst solidjs component
			<TypstDocument fill="#343541" artifact={a()} />
		</div>
	);
}
