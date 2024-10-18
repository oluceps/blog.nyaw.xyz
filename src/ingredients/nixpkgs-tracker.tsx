import ky, { KyInstance } from "ky";
import { createEffect, createSignal, For, Show } from "solid-js";
import { ReactiveMap } from "@solid-primitives/map";
import { twMerge } from "tailwind-merge";
import cfg from "../constant"

export type PrInfo = {
	title: string
	state: string
	status: number
	user: { login: string }
	merge_commit_sha: string
}
export const getTitle = async (pr: number, api: KyInstance): Promise<Partial<PrInfo>> => {
	try {
		const response = await api.get(`pulls/${pr}`).json<any>();

		const filteredResponse: Partial<PrInfo> = {
			title: response.title,
			state: response.state,
			status: response.status,
			user: { login: response.user.login },
			merge_commit_sha: response.merge_commit_sha,
		};

		return filteredResponse;
	} catch (e) {
		console.log(e);
		return {};
	}
};

export const isContain = async (
	branch: string,
	commit: string,
	api: KyInstance
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

const Tracker = () => {
	const api = ky.create({
		prefixUrl: "https://api.github.com/repos/nixos/nixpkgs/",
	});

	// ==========================


	const [tokenText, setTokenText] = createSignal("");
	const [btnStatus, setBtnStatus] = createSignal(false);
	const [loading, setLoading] = createSignal(false);
	const [qnum, setQnum] = createSignal<number>();
	const [queryStatus, setQueryStatus] = createSignal<Partial<{
		title: string, state: string, user: string, how: "notfound" | "good" | "bad"
	}>>();

	const branchStatus = new ReactiveMap<string, boolean>([
		["staging-next", false],
		["master", false],
		["nixos-unstable-small", false],
		["nixpkgs-unstable", false],
		["nixos-unstable", false],
	]);

	const resetBranchStatus = () => {
		branchStatus.forEach((_, v) => {
			branchStatus.set(v, false);
		});
	};
	createEffect(() => {
		setBtnStatus(qnum() ? true : false);
	});

	const chkLocal = async (bs: string[], pr: Partial<PrInfo>) => {
		setQueryStatus({
			title: pr.title!,
			state: pr.state!,
			user: pr.user?.login!,
			how: "good"
		},)
		setLoading(true)
		await Promise.all(bs.map(async b => {
			await isContain(b, pr.merge_commit_sha!, api) ?
				(() => {
					branchStatus.set(b, true)
				})() : null;
		}))
		setLoading(false)
	};

	const chkAllBranch = async (n: number) => {
		setBtnStatus(false);
		try {
			const r = await getTitle(n, api);

			if (!r.title) {
				setQueryStatus({ title: "Not Found", how: "notfound" })
				throw new Error("get pr title error, NotFound");
			}
			if (!r.merge_commit_sha) {
				setQueryStatus({ title: "Bad body", how: "bad" })
				throw new Error("get merge commit sha error")
			};

			const prInfo = r as Partial<PrInfo>;

			return await chkLocal(Array.from(branchStatus.keys()), prInfo); // checked
		} catch (error) {
			console.error(error);
			throw error;
		}
	};
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
					<div class="grid grid-cols-2 place-items-ceneter w-3/5">

						<div class="flex justify-center items-center">
							<span class={twMerge("i-svg-spinners:wind-toy w-full h-8 text-sprout-400",
								loading() ? "opacity-100" : "opacity-0")}></span>
						</div>
						<button
							class="btn glass"
							disabled={!btnStatus()}
							onClick={async () => {
								resetBranchStatus()
								await chkAllBranch(qnum()!);
								setBtnStatus(true);
							}}
						>
							Query
						</button>
					</div>
					<Show when={queryStatus()?.how}>
						<div
							class={`p-2 text-zink-800 rounded-md shadow-md opacity-85 ${queryStatus()?.how == "good" ? "bg-sprout-200" : "bg-red-200"}`}
							onClick={() =>
								queryStatus()?.how == "good"
									? window.open(
										"https://github.com/nixos/nixpkgs/pull/" + qnum(),
									)
									: ""
							}
						>
							{queryStatus()?.how ? queryStatus()?.title : null}
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
