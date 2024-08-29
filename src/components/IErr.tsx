import type { ParentProps } from "solid-js";
import { Layout } from "./Layout";
import { HttpStatusCode } from "@solidjs/start";

const IErr = (props: ParentProps) => {
	return (
		<Layout>
			<div class="flex flex-col w-full items-center justify-center h-full grow text-lg text-red-400">
				<HttpStatusCode code={500} />
				{props.children} (ﾟд⊙)
			</div>
		</Layout>
	);
};

export default IErr;
