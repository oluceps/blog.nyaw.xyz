import { Layout } from "./Layout";
import { HttpStatusCode } from "@solidjs/start";

const IErr = () => {
	return (
		<Layout>
			<div class="flex flex-col w-full items-center justify-center h-full grow text-lg font-mono text-red-400">
				<HttpStatusCode code={500} />
				Interal Error
			</div>
		</Layout>
	);
};

export default IErr;
