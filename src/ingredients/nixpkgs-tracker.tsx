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

	// ==========================


	const [tokenText, setTokenText] = createSignal("");
	const [btnStatus, setBtnStatus] = createSignal(false);
	const [loading, setLoading] = createSignal(false);
	const [qnum, setQnum] = createSignal<number>();
	const [queryStatus, setQueryStatus] = createSignal<Partial<{
		title: string, state: string, user: string, how: "notfound" | "good" | "bad"
	}>>();

	const api = ky.create({
		prefixUrl: "https://api.github.com/repos/nixos/nixpkgs/",
		headers: tokenText() ? { Authorization: `token ${tokenText()}` } : {},
	});

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
			<div class="grid md:grid-cols-2 gap-3 place-items-start">
				<div class="flex flex-col w-full justify-center items-start space-y-4 md:space-y-2">
					<input
						type="text"
						class="mx-auto p-2 border"
						placeholder="PR Number"
						onBeforeInput={(e) => setQnum(Number.parseInt(e.target.value))}
						onInput={(e) => setQnum(Number.parseInt(e.target.value))}
					/>
					<input
						type="password"
						class="mx-auto p-2 border"
						placeholder="API Token (Optional)"
						onInput={(e) => setTokenText(e.data!)}
					/>
					<button
						class="btn glass mx-auto"
						disabled={!btnStatus()}
						onClick={async () => {
							resetBranchStatus()
							await chkAllBranch(qnum()!);
							setBtnStatus(true);
						}}
					>
						Query
					</button>

					<Show when={!loading()} fallback={<div class="i-svg-spinners:wind-toy w-full h-8 text-sprout-400" />}>
						<div
							class={twMerge(
								"h-full p-2 text-zink-800 rounded-md shadow-md opacity-85 w-full",
								queryStatus()?.how == "good" ? "bg-sprout-200" : "bg-red-200",
								queryStatus()?.how ? "opacity-100" : "opacity-0"
							)}
							onClick={() =>
								queryStatus()?.how == "good"
									? window.open(
										"https://github.com/nixos/nixpkgs/pull/" + qnum(),
									)
									: ""
							}
						>
							{queryStatus()?.how == "good" ? `${queryStatus()?.title}\nfrom ${queryStatus()?.user}\n | ${(queryStatus()?.state)?.toUpperCase}` :
								queryStatus()?.how == "notfound" ? "Pull Req Not Found" : null}
						</div>
					</Show>
				</div>

				<div class="flex flex-col justify-center items-center mx-auto">
					<For each={Array.from(branchStatus)}>
						{(k, _) => {
							return (
								<>
									<div class="flex items-start h-8">
										<div class={k[1] ? `text-sprout-400` : `text-slate-300`}>
											{k}
										</div>
										<Show when={k[1]}>〇</Show>
									</div>
								</>
							);
						}}
					</For>
				</div >
			</div>
		</>
	);
};

export default Tracker;
