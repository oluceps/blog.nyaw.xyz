import ky from "ky";
import { createSignal, Show } from "solid-js";
import { twMerge } from "tailwind-merge";

const API_ORIGIN = "https://dn42.nyaw.xyz";
const PEERS_API = `${API_ORIGIN}/api/peers`;
const CHALLENGES_API = `${API_ORIGIN}/api/challenges`;
const LOCAL_ASN = 4242420291;

export default function Autopeer() {
	const [asn, setAsn] = createSignal("");
	const [peerName, setPeerName] = createSignal("");
	const [pubkey, setPubkey] = createSignal("");
	const [endpoint, setEndpoint] = createSignal("");
	const [auth, setAuth] = createSignal("");
	const [signature, setSignature] = createSignal("");
	const [mode, setMode] = createSignal<"post" | "patch" | "delete">("post");
	const [signMode, setSignMode] = createSignal<"ssh" | "gpg">("ssh");
	const [clearEndpoint, setClearEndpoint] = createSignal(false);
	const [nonce, setNonce] = createSignal("");
	const [expiresAt, setExpiresAt] = createSignal<number | null>(null);

	const [loading, setLoading] = createSignal(false);
	const [challengeLoading, setChallengeLoading] = createSignal(false);
	const [errorMsg, setErrorMsg] = createSignal("");
	const [result, setResult] = createSignal<any>(null);
	const [copiedAddress, setCopiedAddress] = createSignal("");

	const parseAsn = () => {
		const value = asn().trim().replace(/^AS/i, "");
		if (!/^\d+$/.test(value)) return null;
		const parsed = Number(value);
		return Number.isSafeInteger(parsed) && parsed <= 0xffffffff ? parsed : null;
	};
	const getParsedAsn = () => parseAsn() ?? "<your_asn>";
	const asnLinkLocal = (value: number) =>
		`fe80::${Math.floor(value / 0x10000).toString(16)}:${(value % 0x10000).toString(16)}`;
	const remoteLinkLocal = () => {
		const parsed = parseAsn();
		return parsed === null ? null : asnLinkLocal(parsed);
	};
	const copyAddress = async (address: string) => {
		try {
			await navigator.clipboard.writeText(address);
			setCopiedAddress(address);
			window.setTimeout(() => setCopiedAddress(""), 1500);
		} catch {
			setErrorMsg("The browser could not copy the address.");
		}
	};
	const getParsedPeerName = () => peerName().trim() || "<peer_name>";
	const isValidPeerName = () =>
		/^[a-z0-9][a-z0-9-]{0,31}$/.test(peerName().trim());
	const invalidateChallenge = () => {
		setNonce("");
		setExpiresAt(null);
		setSignature("");
	};
	const selectMode = (nextMode: "post" | "patch" | "delete") => {
		setMode(nextMode);
		setClearEndpoint(false);
		invalidateChallenge();
	};
	const normalizeEndpoint = (input: string) => {
		const value = input.trim();
		if (!value) return "";
		try {
			const url = new URL(`http://${value}`);
			if (
				!url.port ||
				url.pathname !== "/" ||
				url.search ||
				url.hash ||
				url.username ||
				url.password
			)
				return null;
			const host = url.hostname;
			const isIpv6 = host.startsWith("[") && host.endsWith("]");
			const isIpv4 =
				host.split(".").length === 4 &&
				host.split(".").every((part) => /^\d+$/.test(part));
			if (!isIpv4 && !isIpv6) return null;
			return `${host}:${url.port}`;
		} catch {
			return null;
		}
	};
	const endpointMessage = () => {
		const normalized = normalizeEndpoint(endpoint());
		if (mode() === "post") return normalized || "none";
		if (clearEndpoint()) return "clear";
		return normalized ? `set:${normalized}` : "unchanged";
	};
	const canGetChallenge = () =>
		parseAsn() !== null && isValidPeerName();

	const challengeMessage = () => {
		const a = getParsedAsn();
		const name = getParsedPeerName();
		const pk = pubkey().trim() || "<your_wireguard_pubkey>";
		const challengeNonce = nonce() || "<nonce>";
		const expiration = expiresAt() ?? "<expires_at>";
		if (mode() === "delete") {
			return `DN42-AUTOPEER-V2\noperation:delete\nasn:${a}\npeer_name:${name}\nnonce:${challengeNonce}\nexpires_at:${expiration}`;
		}
		return `DN42-AUTOPEER-V2\noperation:${mode() === "post" ? "create" : "update"}\nasn:${a}\npeer_name:${name}\npubkey:${pk}\nendpoint:${endpointMessage()}\nnonce:${challengeNonce}\nexpires_at:${expiration}`;
	};

	const challengeCmd = () => {
		const a = parseAsn();
		const pk = pubkey().trim();

		if (a === null) {
			return "# Please fill out your ASN to generate the challenge command.";
		}
		if (!isValidPeerName()) {
			return "# Please enter a valid peer name to generate the challenge command.";
		}
		if (mode() !== "delete" && !pk) {
			return "# Please fill out your WireGuard Public Key to generate the challenge command.";
		}

		if (!nonce() || !expiresAt())
			return "# Get a challenge from the server first.";

		const message = challengeMessage().replaceAll("'", "'\\''");
		const writeMessage = `printf '%s' '${message}' > dn42-autopeer-request.txt`;
		if (signMode() === "ssh") {
			return `${writeMessage}\nssh-keygen -Y sign -f ~/.ssh/<your_id_ed25519> -n dn42 dn42-autopeer-request.txt\ncat dn42-autopeer-request.txt.sig`;
		}
		return `${writeMessage}\ngpg --armor --detach-sign dn42-autopeer-request.txt\ncat dn42-autopeer-request.txt.asc`;
	};
	const buildPayload = () => {
		const payload: any = {
			asn: parseAsn(),
			peer_name: peerName().trim(),
			challenge: {
				auth: auth(),
				signature: signature(),
				nonce: nonce(),
				expires_at: expiresAt(),
			},
		};
		if (mode() !== "delete" && pubkey().trim())
			payload.pubkey = pubkey().trim();
		const normalized = normalizeEndpoint(endpoint());
		if (mode() === "patch" && clearEndpoint()) payload.endpoint = null;
		else if (mode() !== "delete" && normalized) payload.endpoint = normalized;
		return payload;
	};
	const readError = async (error: any) => {
		try {
			const body = await error.response.json();
			return body.detail
				? `${body.error}: ${body.detail}`
				: body.error || body.message || error.message;
		} catch {
			return error.message;
		}
	};
	const getChallenge = async () => {
		const parsedAsn = parseAsn();
		if (parsedAsn === null) {
			setErrorMsg("Enter a valid ASN first.");
			return;
		}
		if (!isValidPeerName()) {
			setErrorMsg("Enter a valid peer name first.");
			return;
		}
		if (mode() !== "delete" && !pubkey().trim()) {
			setErrorMsg("Enter a WireGuard public key first.");
			return;
		}
		if (
			mode() !== "delete" &&
			!clearEndpoint() &&
			endpoint().trim() &&
			normalizeEndpoint(endpoint()) === null
		) {
			setErrorMsg("The endpoint must contain a numeric IP address and port.");
			return;
		}

		setChallengeLoading(true);
		setErrorMsg("");
		setResult(null);
		try {
			const challenge = await ky
				.post(CHALLENGES_API, { json: { asn: parsedAsn } })
				.json<{ nonce: string; expires_at: number }>();
			setNonce(challenge.nonce);
			setExpiresAt(challenge.expires_at);
			setSignature("");
		} catch (error: any) {
			setErrorMsg(await readError(error));
		} finally {
			setChallengeLoading(false);
		}
	};

	const request = async (method: "post" | "patch" | "delete") => {
		if (
			!asn() ||
			!isValidPeerName() ||
			!auth() ||
			!signature() ||
			!nonce() ||
			!expiresAt()
		) {
			setErrorMsg(
				"The ASN, peer name, auth key, signature, and a current challenge are required.",
			);
			return;
		}
		if (expiresAt()! < Math.floor(Date.now() / 1000)) {
			setErrorMsg("The challenge expired. Get a new challenge.");
			return;
		}
		if (method !== "delete" && !pubkey().trim()) {
			setErrorMsg(
				"WireGuard Public Key is required to create or update a peer.",
			);
			return;
		}

		setLoading(true);
		setErrorMsg("");
		setResult(null);

		try {
			let res;
			if (method === "post") {
				res = await ky.post(PEERS_API, { json: buildPayload() }).json();
			} else if (method === "patch") {
				res = await ky.patch(PEERS_API, { json: buildPayload() }).json();
			} else if (method === "delete") {
				res = await ky.delete(PEERS_API, { json: buildPayload() }).json();
			}
			setResult(res);
		} catch (e: any) {
			setErrorMsg(await readError(e));
		} finally {
			setNonce("");
			setExpiresAt(null);
			setSignature("");
			setLoading(false);
		}
	};

	const inputClass =
		"w-full px-4 py-2 mt-1 mb-4 text-sm bg-base-100 border border-base-content/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-base-content transition-all duration-300";
	const btnClass =
		"px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:active:scale-100";

	const canSubmit = () => {
		if (
			!asn() ||
			!isValidPeerName() ||
			!auth() ||
			!signature() ||
			!nonce() ||
			!expiresAt()
		)
			return false;
		if (expiresAt()! < Math.floor(Date.now() / 1000)) return false;
		if (mode() !== "delete" && !pubkey().trim()) return false;
		return true;
	};

	return (
		<div class="max-w-2xl mx-auto p-6 bg-base-200/50 backdrop-blur-md rounded-2xl shadow-xl border border-base-content/10">
			<h2 class="text-2xl font-bold mb-6 text-base-content">
				Configure DN42 Peering
			</h2>

			<div class="mb-6 flex gap-2 p-1 bg-base-300/50 rounded-lg w-fit">
				<button
					class={twMerge(
						"px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
						mode() === "post"
							? "bg-[#b5caa0] shadow-sm text-base-content/80"
							: "text-base-content/60 hover:text-base-content",
					)}
					onClick={() => selectMode("post")}
				>
					Create Peer
				</button>
				<button
					class={twMerge(
						"px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
						mode() === "patch"
							? "bg-[#b5caa0] shadow-sm text-base-content/80"
							: "text-base-content/60 hover:text-base-content",
					)}
					onClick={() => selectMode("patch")}
				>
					Update
				</button>
				<button
					class={twMerge(
						"px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
						mode() === "delete"
							? "bg-[#b5caa0] shadow-sm text-base-content/80"
							: "text-base-content/60 hover:text-base-content",
					)}
					onClick={() => selectMode("delete")}
				>
					Delete
				</button>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
				<div>
					<label class="block text-xs font-semibold text-base-content/70 uppercase tracking-wide">
						Your ASN
					</label>
					<input
						type="text"
						placeholder="e.g. 4242421234"
						class={inputClass}
						value={asn()}
						onInput={(e) => {
							setAsn(e.currentTarget.value);
							invalidateChallenge();
						}}
					/>
				</div>
				<div>
					<label class="block text-xs font-semibold text-base-content/70 uppercase tracking-wide">
						Peer Name
					</label>
					<input
						type="text"
						placeholder="e.g. fra1"
						class={inputClass}
						value={peerName()}
						onInput={(e) => {
							setPeerName(e.currentTarget.value);
							invalidateChallenge();
						}}
					/>
					<p class="-mt-3 mb-4 text-[10px] text-base-content/50">
						Use lowercase letters, digits, or hyphens. Use a different name for
						each machine.
					</p>
				</div>
				<Show when={mode() !== "delete"}>
					<div>
						<label class="block text-xs font-semibold text-base-content/70 uppercase tracking-wide">
							{mode() === "patch"
								? "Endpoint (empty keeps current)"
								: "Endpoint (Optional)"}
						</label>
						<input
							type="text"
							placeholder="e.g. 198.51.100.1:51820"
							class={inputClass}
							value={endpoint()}
							disabled={clearEndpoint()}
							onInput={(e) => {
								setEndpoint(e.currentTarget.value);
								invalidateChallenge();
							}}
						/>
						<Show when={mode() === "patch"}>
							<label class="-mt-2 mb-4 flex items-center gap-2 text-xs text-base-content/70">
								<input
									type="checkbox"
									checked={clearEndpoint()}
									onChange={(e) => {
										setClearEndpoint(e.currentTarget.checked);
										invalidateChallenge();
									}}
								/>
								Clear the current endpoint
							</label>
						</Show>
					</div>
					<Show when={mode() === "post"}>
						<div
							class="group relative mb-4 rounded-xl border border-base-content/10 bg-gradient-to-br from-base-300/60 to-base-200/30 p-3 transition duration-200 hover:border-[#b5caa0]/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
							tabindex="0"
							aria-describedby="link-local-address-help"
						>
							<div class="flex items-start justify-between gap-3">
								<div>
									<p class="font-sans text-xs font-semibold uppercase tracking-wide text-base-content/70">
										Link-local addresses
									</p>
									<p class="mt-0.5 font-sans text-[10px] text-base-content/50">
										Preview from the entered ASN
									</p>
								</div>
								<span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-base-content/20 font-sans text-xs font-semibold text-base-content/50">
									?
								</span>
							</div>
							<div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
									<button
										type="button"
										disabled={!remoteLinkLocal()}
										onClick={() => {
											const address = remoteLinkLocal();
											if (address) copyAddress(address);
										}}
										class="w-full rounded-lg border border-base-content/5 bg-base-100/50 px-2.5 py-2 text-left transition hover:border-[#b5caa0]/70 hover:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-default disabled:hover:border-base-content/5 disabled:hover:bg-base-100/50"
										aria-label="Copy your BGP IP"
									>
										<p class="font-sans text-[9px] font-semibold uppercase tracking-wide text-base-content/45">
											Your BGP IP
										</p>
										<code class="mt-1 block text-[11px] text-[#6f9052]">
											<Show
												when={remoteLinkLocal()}
												fallback={<span class="text-base-content/40">Enter ASN</span>}
											>
												{remoteLinkLocal()}
											</Show>
										</code>
										<p class="mt-1 font-sans text-[9px] text-base-content/45">
											{copiedAddress() === remoteLinkLocal() ? "Copied" : "Click to copy"}
										</p>
									</button>
									<button
										type="button"
										onClick={() => copyAddress(asnLinkLocal(LOCAL_ASN))}
										class="w-full rounded-lg border border-base-content/5 bg-base-100/50 px-2.5 py-2 text-left transition hover:border-[#b5caa0]/70 hover:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
										aria-label="Copy Nyaw BGP IP"
									>
										<p class="font-sans text-[9px] font-semibold uppercase tracking-wide text-base-content/45">
											Nyaw BGP IP
										</p>
										<code class="mt-1 block text-[11px] text-[#6f9052]">
											{asnLinkLocal(LOCAL_ASN)}
										</code>
										<p class="mt-1 font-sans text-[9px] text-base-content/45">
											{copiedAddress() === asnLinkLocal(LOCAL_ASN)
												? "Copied"
												: "Click to copy"}
										</p>
									</button>
								</div>
							<div
								id="link-local-address-help"
								role="tooltip"
								class="pointer-events-none mt-3 rounded-lg border border-base-content/20 bg-base-100 p-3 font-sans text-[10px] leading-relaxed text-base-content shadow-lg sm:absolute sm:left-0 sm:top-full sm:z-10 sm:mt-2 sm:w-full sm:translate-y-1 sm:opacity-0 sm:shadow-2xl sm:transition sm:duration-200 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus:translate-y-0 sm:group-focus:opacity-100"
							>
								Configure Your BGP IP on your WireGuard interface. Use Nyaw BGP IP
								as the BGP neighbor address. Both use fe80::(ASN &gt;&gt; 16):(ASN &amp;
								0xffff).
							</div>
						</div>
					</Show>
				</Show>
			</div>

			<Show when={mode() !== "delete"}>
				<div>
					<label class="block text-xs font-semibold text-base-content/70 uppercase tracking-wide">
						WireGuard Public Key
					</label>
					<input
						type="text"
						placeholder="Base64 encoded public key"
						class={inputClass}
						value={pubkey()}
						onInput={(e) => {
							setPubkey(e.currentTarget.value);
							invalidateChallenge();
						}}
					/>
				</div>
			</Show>

			<div class="mt-2 mb-6 p-4 bg-base-300/40 rounded-xl border border-base-content/5">
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
					<div>
						<p class="text-xs font-medium text-base-content/70">
							Get a single-use challenge, then run the generated command.
						</p>
						<Show when={nonce() && expiresAt()}>
							<p class="mt-1 text-[10px] text-base-content/50">
								Challenge expires at{" "}
								{new Date(expiresAt()! * 1000).toLocaleString()}.
							</p>
						</Show>
					</div>
					<div class="flex gap-1 p-0.5 bg-base-200/80 rounded-md border border-base-content/10">
						<button
							class={twMerge(
								"px-2.5 py-1 text-[10px] font-semibold rounded-sm transition-all uppercase tracking-wider",
								signMode() === "ssh"
									? "bg-[#b5caa0] shadow-sm text-base-content/80"
									: "text-base-content/50 hover:text-base-content/80",
							)}
							onClick={() => {
								setSignMode("ssh");
								setSignature("");
							}}
						>
							SSH
						</button>
						<button
							class={twMerge(
								"px-2.5 py-1 text-[10px] font-semibold rounded-sm transition-all uppercase tracking-wider",
								signMode() === "gpg"
									? "bg-[#b5caa0] shadow-sm text-base-content/80"
									: "text-base-content/50 hover:text-base-content/80",
							)}
							onClick={() => {
								setSignMode("gpg");
								setSignature("");
							}}
						>
							GPG
						</button>
					</div>
				</div>
				<button
					class={twMerge(
						btnClass,
						"mb-3 w-full bg-[#6f9052] text-white hover:opacity-90",
					)}
					onClick={getChallenge}
					disabled={
						challengeLoading() || loading() || !canGetChallenge()
					}
				>
					{challengeLoading()
						? "Getting Challenge..."
						: nonce()
							? "Replace Challenge"
							: "Get Challenge"}
				</button>
				<div class="relative w-full">
					<pre class="w-full border bg-[#faf9f5] px-4 py-2.5 overflow-auto scrollbar scrollbar-rounded text-[#393a34] rounded-lg text-xs font-mono whitespace-pre-wrap">
						{challengeCmd()}
					</pre>
				</div>
			</div>

			<div>
				<label
					class="flex justify-between w-full text-xs font-semibold text-base-content/70 uppercase tracking-wide cursor-help"
					title="Any auth public key listed in your DN42 registry mntner object"
				>
					<span>Challenge Auth (PGP/SSH Key)</span>
					<a
						href="https://explorer.dn42.dev/#/"
						target="_blank"
						rel="noreferrer"
						class="font-normal normal-case underline hover:text-base-content"
					>
						Search your mntner
					</a>
				</label>
				<textarea
					rows={3}
					placeholder={
						signMode() === "ssh"
							? "ssh-ed25519 AAAAC3..."
							: "-----BEGIN PGP PUBLIC KEY BLOCK-----\n..."
					}
					class={twMerge(inputClass, "resize-none")}
					value={auth()}
					onInput={(e) => {
						setAuth(e.currentTarget.value);
						setSignature("");
					}}
				></textarea>
			</div>

			<div>
				<label class="block text-xs font-semibold text-base-content/70 uppercase tracking-wide">
					Challenge Signature
				</label>
				<textarea
					rows={4}
					placeholder={
						signMode() === "ssh"
							? "-----BEGIN SSH SIGNATURE-----\n..."
							: "-----BEGIN PGP SIGNATURE-----\n..."
					}
					class={twMerge(inputClass, "resize-none")}
					value={signature()}
					onInput={(e) => setSignature(e.currentTarget.value)}
				></textarea>
			</div>

			<div class="flex mt-4">
				<button
					class={twMerge(
						btnClass,
						mode() === "post" &&
							"bg-[#6f9052] hover:opacity-90 text-white shadow-lg",
						mode() === "patch" &&
							"bg-[#6f9052] hover:opacity-90 text-white shadow-lg",
						mode() === "delete" &&
							"bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/30",
						"w-full sm:w-auto",
					)}
					onClick={() => request(mode())}
					disabled={loading() || !canSubmit()}
				>
					{loading()
						? "Processing..."
						: mode() === "post"
							? "Create Peer"
							: mode() === "patch"
								? "Update Peer"
								: "Delete Peer"}
				</button>
			</div>

			<Show when={errorMsg()}>
				<div class="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm font-medium">
					Error: {errorMsg()}
				</div>
			</Show>

			<Show when={result()}>
				<div class="mt-6 p-5 bg-base-300/50 rounded-xl border border-base-content/10">
					<h3 class="text-lg font-bold text-emerald-400 mb-2">
						{result()?.message || "Success!"}
					</h3>
					<p class="text-sm font-mono text-base-content/70">
						Peer: {result().peer_name} (ID {result().peer_id})
					</p>

					<Show when={result()?.wg_config}>
						<div class="mt-4 flex flex-col gap-4">
							<div class="p-4 bg-base-100/50 rounded-lg">
								<h4 class="text-xs font-bold text-base-content/60 uppercase mb-2">
									WireGuard Config
								</h4>
								<div class="text-sm font-mono space-y-1 overflow-x-auto pb-1">
									<p class="whitespace-nowrap">
										<span class="text-base-content/50">Endpoint:</span>{" "}
										{result().wg_config.my_endpoint}
									</p>
									<p class="whitespace-nowrap">
										<span class="text-base-content/50">AllowedIPs:</span>{" "}
										{result().wg_config.allowed_ips}
									</p>
									<p class="whitespace-nowrap">
										<span class="text-base-content/50">Your IP:</span>{" "}
										{result().wg_config.your_assigned_ip}
									</p>
									<p class="whitespace-nowrap">
										<span class="text-base-content/50">My PubKey:</span>{" "}
										<span class="select-all">
											{result().wg_config.my_pubkey}
										</span>
									</p>
								</div>
							</div>
							<Show when={result()?.bgp_config}>
								<div class="p-4 bg-base-100/50 rounded-lg">
									<h4 class="text-xs font-bold text-base-content/60 uppercase mb-2">
										BGP Config
									</h4>
									<div class="text-sm font-mono space-y-1 overflow-x-auto pb-1">
										<p class="whitespace-nowrap">
											<span class="text-base-content/50">My ASN:</span> AS
											{result().bgp_config.my_asn}
										</p>
										<p class="whitespace-nowrap">
											<span class="text-base-content/50">My IP:</span>{" "}
											{result().bgp_config.my_neighbor_ip}
										</p>
										<p class="whitespace-nowrap">
											<span class="text-base-content/50">Multiprotocol:</span>{" "}
											{result().bgp_config.multiprotocol ? "Yes" : "No"}
										</p>
									</div>
								</div>
							</Show>
						</div>
					</Show>
				</div>
			</Show>
		</div>
	);
}
