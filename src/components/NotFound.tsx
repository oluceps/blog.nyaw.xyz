import { HttpStatusCode } from "@solidjs/start";

const NotFound = () => {
	return (
		<div class="flex flex-col w-full items-center justify-center h-full grow text-lg font-mono text-red-400">
			<HttpStatusCode code={404} />
			Page Not Found
		</div>
	);
};

export default NotFound;
