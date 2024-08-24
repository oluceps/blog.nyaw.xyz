import { Layout } from "./Layout";
import { HttpStatusCode } from "@solidjs/start";

const NotFound = () => {
	return (
		<Layout>
			<div class="flex flex-col w-11/12 md:w-3/4 mx-auto pt-8 space-y-8 text-2xl">
				<HttpStatusCode code={404} />
				Page Not Found
			</div>
		</Layout>
	);
};

export default NotFound;
