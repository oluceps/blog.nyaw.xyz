import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { BrowserProvider, parseEther } from 'ethers';
import onboard from './onboard';

const PRESETS = ["0.001", "0.005", "0.01"];
const RECIPIENT = "0xEE8EFFBD1Aafd2166561eF77afb43bC89E860475";
const BASE_CHAIN_ID = '0x2105'; // Base Mainnet

export default function DonationCard() {
  const [wallet, setWallet] = createSignal(null);
  // Use string type for easier input logic
  const [amount, setAmount] = createSignal("0.001");
  const [ethPrice, setEthPrice] = createSignal(0);
  const [loading, setLoading] = createSignal(false);
  const [status, setStatus] = createSignal("");

  onMount(async () => {
    // Fetch ETH price
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await res.json();
      setEthPrice(data.ethereum?.usd || 0);
    } catch (e) {
      console.warn("Price fetch failed");
    }

    const walletsSub = onboard.state.select('wallets').subscribe(wallets => {
      if (wallets && wallets.length > 0) setWallet(wallets[0]);
      else setWallet(null);
    });

    onCleanup(() => walletsSub.unsubscribe());
  });

  const handleInput = (e: any) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setAmount(val);
    }
  };

  const handleAction = async () => {
    let currentWallet = wallet();

    // 1. Logic: If not connected, connect and RETURN. Do not pay immediately.
    if (!currentWallet) {
      try {
        setLoading(true);
        await onboard.connectWallet();

        setLoading(false);
        // Stop execution here. The user must click again to donate.
        return;

      } catch (e) {
        setLoading(false);
        return;
      }
    }

    // 2. Logic: Validate input amount (only proceeds if connected)
    if (!amount() || Number.parseFloat(amount()) <= 0) {
      setStatus("Please enter a valid amount");
      return;
    }

    // 3. Logic: Check Base chain
    if (currentWallet.chains?.[0]?.id !== BASE_CHAIN_ID) {
      try {
        const success = await onboard.setChain({ chainId: BASE_CHAIN_ID });
        if (!success) {
          setLoading(false);
          return;
        }
        // Refresh wallet state after chain switch
        currentWallet = onboard.state.get().wallets[0];
      } catch (e) {
        setStatus("Network switch failed");
        setLoading(false);
        return;
      }
    }

    // 4. Logic: Send transaction
    try {
      setLoading(true);
      setStatus("Please confirm in wallet...");

      const ethersProvider = new BrowserProvider(currentWallet.provider);
      const signer = await ethersProvider.getSigner();

      const tx = await signer.sendTransaction({
        to: RECIPIENT,
        value: parseEther(amount())
      });

      setStatus("Sending...");
      await tx.wait();
      setStatus("Success! ❤");
      setTimeout(() => setStatus(""), 4000);
      setAmount(""); // Reset after success

    } catch (err) {
      console.error(err);
      const errorCode = err.code ?? err?.info?.error?.code;
      const errorMsg = err.message?.toLowerCase() ?? '';

      if (errorCode === 4001 || errorCode === 'ACTION_REJECTED') {
        setStatus("User rejected");
      } else if (
        errorCode === -32003 ||
        errorCode === -32000 ||
        errorCode === 'INSUFFICIENT_FUNDS' ||
        errorMsg.includes('insufficient funds')
      ) {
        setStatus("Insufficient funds");
      } else if (
        errorCode === 4900 ||
        errorCode === 4100 ||
        errorMsg.includes('not authorized')
      ) {
        setStatus("Wallet not authorized");
      } else if (
        errorCode === -32002 ||
        errorMsg.includes('resource unavailable')
      ) {
        setStatus("Request unavailable");
      } else if (
        errorMsg.includes('nonce') &&
        (errorMsg.includes('expired') || errorMsg.includes('too low'))
      ) {
        setStatus("Transaction pending, try again");
      } else if (
        errorMsg.includes('gas') &&
        (errorMsg.includes('limit') || errorMsg.includes('underpriced'))
      ) {
        setStatus("Gas estimate failed");
      } else {
        setStatus("Transaction failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate USD, handle null or invalid input
  const getUsd = () => {
    const val = Number.parseFloat(amount());
    if (isNaN(val)) return "0.00";
    return (val * ethPrice()).toFixed(2);
  };

  // --- Neumorphism Styles ---
  const outShadow = "bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]";
  const inShadow = "bg-[#e0e0e0] shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff]";

  const cardStyle = `
    w-[380px] p-8 rounded-[50px] bg-[#e0e0e0]
    shadow-[20px_20px_58px_#bebebe,-20px_-20px_58px_#ffffff]
    flex flex-col items-center gap-6 text-gray-600 font-sans select-none
  `;

  const isError = () => {
    const s = status();
    return s && !s.includes('Success') && !s.includes('Processing') && !s.includes('Please');
  };

  return (
    <div class="flex items-center justify-center min-h-80dvh">
      <div class={cardStyle}>

        <div class="text-center">
          <h2 class="text-2xl font-bold tracking-wider text-gray-700">Support Me</h2>

          <div class="text-xs font-mono mt-2 h-4 text-gray-500 flex items-center justify-center gap-2">

            <span class={`w-2 h-2 rounded-full inline-block transition-colors duration-300 
              ${wallet() ? 'bg-green-500' : 'bg-gray-400'}`}>
            </span>

            <span>
              {wallet()
                ? `${wallet()?.accounts?.[0]?.address?.slice(0, 6)}...${wallet()?.accounts?.[0]?.address?.slice(-4)}`
                : 'Not Connected'}
            </span>

          </div>
        </div>
        {/* Amount Presets */}
        <div class="w-full flex justify-between gap-4">
          {PRESETS.map((val) => (
            <button
              type="button"
              onClick={() => setAmount(val)}
              class={`
                flex-1 py-3 rounded-[20px] text-sm font-semibold transition-all duration-200
                ${amount() === val
                  ? inShadow + " text-sprout-600 translate-y-[1px]" // Selected: inner shadow + color
                  : outShadow + " hover:-translate-y-[2px]"       // Unselected: outer shadow + lift
                }
              `}
            >
              {val}
            </button>
          ))}
        </div>

        {/* Custom Input Field */}
        <div class={`w-full h-20 rounded-[25px] ${inShadow} flex items-center justify-center relative px-6`}>

          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount()}
            onInput={handleInput}
            class="w-full bg-transparent text-center text-3xl font-bold text-gray-700 outline-none border-none placeholder-gray-300"
          />

          {/* Unit suffix */}
          <span class="absolute right-6 text-lg font-normal text-gray-400 pointer-events-none">
            ETH
          </span>

          {/* USD hint */}
          <div class="absolute bottom-2 text-xs text-gray-400 pointer-events-none">
            ≈ ${getUsd()} USD
          </div>
        </div>

        {/* Status Text */}
        <div class={`h-6 text-sm font-medium animate-pulse text-center ${isError() ? 'text-cerise-400' : 'text-sprout-500'}`}>
          {status()}
        </div>

        {/* Main Action Button */}
        <button
          type="button"
          onClick={handleAction}
          disabled={loading()}
          class={`
            w-full py-4 rounded-[50px] font-bold text-lg tracking-wide transition-all
            text-gray-700
            ${loading()
              ? 'opacity-60 cursor-not-allowed ' + inShadow
              : 'cursor-pointer hover:text-sprout-600 active:scale-[0.98] ' + outShadow
            }
          `}
        >
          {wallet() ? (loading() ? 'Processing...' : 'Donate') : 'Connect Wallet'}
        </button>

      </div>
    </div>
  );
}
