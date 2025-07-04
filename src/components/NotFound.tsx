import { HttpStatusCode } from "@solidjs/start";
import { Layout } from "./Layout";

// here the whitespace-pre not working
const NotFound = () => {
	return (
		<Layout>
			<div class="flex flex-col w-full items-center justify-center h-full grow text-lg text-red-400 leading-none">
				<HttpStatusCode code={404} />
				／|、
				<br />
				(˙、．7
				<br />
				|、～ヽ
				<br />
				じしf_,)ノ
				<br />
				Page Not Found
			</div>
		</Layout>
	);
};

export default NotFound;
