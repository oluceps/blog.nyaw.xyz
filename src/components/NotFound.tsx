import { HttpStatusCode } from "@solidjs/start";
import { Layout } from "./Layout";

const NotFound = () => {
	return (
		<Layout>
			<div class="flex flex-col w-full items-center justify-center h-full grow text-lg text-red-400">
				<HttpStatusCode code={404} />
				Page Not Found =ↀωↀ=
			</div>
		</Layout>
	);
};

export default NotFound;
