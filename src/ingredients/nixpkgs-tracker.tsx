import ky from "ky";
import { createEffect, createSignal, For, Show } from "solid-js";
import { ReactiveMap } from "@solid-primitives/map";
import { twMerge } from "tailwind-merge";

const Tracker = () => {
	const [tokenText, setTokenText] = createSignal("");

	const getHeaders = () => {
		return tokenText() ? { Authorization: `token ${tokenText()}` } : {};
	};

	const api = ky.create({
		prefixUrl: "https://api.github.com/repos/nixos/nixpkgs/",
		headers: getHeaders(),
	});

	type PRTitle = {
		title: string;
		statusCode: number;
	};

	const getPRTitle = async (pr: number): Promise<PRTitle> => {
		try {
			const { title } = await api.get(`pulls/${pr}`).json<any>();
			return { title, statusCode: 200 }; // Assuming status 200 for simplicity
		} catch (e) {
			console.log(e);
			return { title: "NotFound", statusCode: 404 };
		}
	};

	const getMergeCommit = async (pr: number): Promise<string> => {
		const { merge_commit_sha } = await api.get(`pulls/${pr}`).json<any>();
		return merge_commit_sha;
	};

	const isContain = async (
		branch: string,
		commit: string,
	): Promise<boolean> => {
		try {
			const { status } = await api
				.get(`compare/${branch}...${commit}`)
				.json<any>();
			return status === "identical" || status === "behind";
		} catch (error) {
			// @ts-ignore
			if (error.response?.status === 404) {
				return false;
			}
			throw error;
		}
	};

	// ==========================

	const [btnStatus, setBtnStatus] = createSignal(false);
	const [loading, setLoading] = createSignal(false);
	const [qnum, setQnum] = createSignal<number>();
	const [queryStatus, setQueryStatus] = createSignal(["", true]);

	createEffect(() => {
		console.log(qnum());
	});

	const branchStatus = new ReactiveMap<string, boolean>([
		["staging-next", false],
		["master", false],
		["nixos-unstable-small", false],
		["nixpkgs-unstable", false],
		["nixos-unstable", false],
	]);

	const resetBranchStatus = () =>
		branchStatus.forEach((_, v) => {
			branchStatus.set(v, false);
		});

	const handlePR = async (pr: number) => {
		setBtnStatus(false);
		setLoading(true);
		resetBranchStatus();

		const tokenElement = document.querySelector<HTMLInputElement>("#token")!;

		const titleStatMap = await getPRTitle(pr);

		const ready = () => {
			setBtnStatus(true);
			setLoading(false);
		};

		switch (titleStatMap.statusCode) {
			case 404:
				setQueryStatus(["PR not found", false]);
				ready();
				return;
			case 403:
				setQueryStatus(["Rate limit exceeded -- Please set token", false]);
				ready();
				return;
			case 401:
				setQueryStatus(["Unauthorized -- Please set correct token", false]);
				tokenElement.focus();
				ready();
				return;
			case 200:
				setQueryStatus([titleStatMap.title, true]);
		}

		const checkBranch = async (branch: string) => {
			const merged = await getMergeCommit(pr).then((commit) =>
				isContain(branch, commit),
			);
			if (merged) branchStatus.set(branch, true);
		};
		try {
			await Promise.all(Array.from(branchStatus.keys()).map(checkBranch));
			console.log("inhandle", branchStatus);
		} catch (e) {
			console.log(e);
		}

		ready();
	};

	createEffect(() => {
		setBtnStatus(qnum() ? true : false);
	});

	return (
		<>
			<div class="grid md:grid-cols-2 w-full gap-3">
				<div class="flex flex-col w-full justify-center items-center space-y-4 md:space-y-2">
					<label class="input input-bordered flex items-center gap-2">
						<input
							type="text"
							class="grow"
							placeholder="PR Number"
							onBeforeInput={(e) => setQnum(Number.parseInt(e.target.value))}
							onInput={(e) => setQnum(Number.parseInt(e.target.value))}
						/>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 16 16"
							fill="currentColor"
							class="h-4 w-4 opacity-70"
						>
							<path
								fill-rule="evenodd"
								d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
								clip-rule="evenodd"
							/>
						</svg>
					</label>

					<label class="input input-bordered flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 16 16"
							fill="currentColor"
							class="h-4 w-4 opacity-70"
						>
							<path
								fill-rule="evenodd"
								d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
								clip-rule="evenodd"
							/>
						</svg>
						<input
							type="password"
							class="grow token"
							placeholder="API Token (Optional)"
							onInput={(e) => setTokenText(e.data!)}
						/>
					</label>
					<button
						class="btn glass"
						disabled={!btnStatus()}
						onClick={async () => await handlePR(qnum()!)}
					>
						<Show when={loading()}>
							<span class="loading loading-spinner"></span>
						</Show>
						Query
					</button>
					<Show when={queryStatus()[0] != ""}>
						<div
							class={`p-2 text-zink-800 rounded-md shadow-md opacity-85 ${queryStatus()[1] ? "bg-sprout-200" : "bg-red-200"}`}
							onClick={() =>
								queryStatus()[0] != ""
									? window.open(
											"https://github.com/nixos/nixpkgs/pull/" + qnum(),
										)
									: ""
							}
						>
							{queryStatus()}
						</div>
					</Show>
				</div>
				<div class="flex flex-col justify-center items-center">
					<For each={Array.from(branchStatus)}>
						{(k, _) => {
							return (
								<>
									<div class="flex items-center">
										<div class={k[1] ? `text-sprout-400` : `text-slate-300`}>
											{k}
										</div>
										<Show when={k[1]}>〇</Show>
									</div>
								</>
							);
						}}
					</For>
				</div>
			</div>
		</>
	);
};

export default Tracker;
