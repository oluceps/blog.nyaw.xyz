import type { ParentProps } from "solid-js";
import { Layout } from "./Layout";
import { HttpStatusCode } from "@solidjs/start";

const IErr = (props: ParentProps) => {
	return (
		<Layout>
			<div class="flex flex-col w-full items-center justify-center h-full grow text-lg text-red-400 leading-none">
				<HttpStatusCode code={500} />
				／|、
				<br />
				(˙、．7
				<br />
				|、～ヽ
				<br />
				じしf_,)ノ
				<br />
				{props.children}
			</div>
		</Layout>
	);
};

export default IErr;
