import { createSignal, Show, For, type VoidComponent, createEffect } from 'solid-js';
import { Decrypter } from "age-encryption";
import cfg from "~/constant";
import "~/styles/otp.css";
import OtpField from '@corvu/otp-field';
import clsx from 'clsx';
import ky from 'ky';

// --- Slot Component for OTP Field ---
const Slot = (props: { index: number }) => {
  const context = OtpField.useContext();
  const char = () => context.value()[props.index];
  const showFakeCaret = () =>
    context.value().length === props.index && context.isInserting();

  return (
    <div
      class={clsx('slot', {
        'active_slot': context.activeSlots().includes(props.index),
      })}
    >
      {char()}
      <Show when={showFakeCaret()}>
        <div class="fake_caret_wrapper">
          <div class="fake_caret" />
        </div>
      </Show>
    </div>
  );
};

const RageD: VoidComponent = () => {
  const availableFiles = ['8deafb0f-60fe-4558-a1a2-ccec720adfc8.age'];

  const [selectedFile, setSelectedFile] = createSignal(availableFiles[0]);
  const [password, setPassword] = createSignal("");
  const [decryptedHtml, setDecryptedHtml] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [isLocked, setIsLocked] = createSignal(false);

  createEffect((prev: any) => {
    const pair = { s: selectedFile(), p: password() };
    if (prev.s != pair.s || prev.p.length != pair.p.length) {
      setDecryptedHtml("")
    }
    return pair
  }, { s: "", p: "" })


  const handleDecrypt = async (pwd: string) => {
    setIsLoading(true);
    setErrorMessage("");
    setDecryptedHtml("");
    setIsLocked(true);

    if (!pwd || pwd.length < 8) {
      setErrorMessage("Please enter a complete 9 alphabet/digit(s) passphrase.");
      setIsLoading(false);
      setIsLocked(false);
      return;
    }

    const formattedPassword = pwd.slice(0, 4) + '$' + pwd.slice(4);

    try {
      const response = await fetch(`${cfg.base_url}/${selectedFile()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const encryptedData = new Uint8Array(await response.arrayBuffer());

      const d = new Decrypter();
      d.addPassphrase(formattedPassword);
      const decryptedContent = await d.decrypt(encryptedData, "text");

      setDecryptedHtml(decryptedContent);

      await ky.get(`/api/reveal-alert`);
      console.log("notify about unlocking behavior sent.");
    } catch (error) {
      console.error("Decryption process failed:", error);
      setErrorMessage("Decryption failed. Please check the file and passphrase.");
      setIsLocked(false);
    } finally {
      setIsLocked(false);
      setIsLoading(false);
    }
  };

  return (
    <div class="text-slate-800 dark:text-slate-200 min-h-screen p-4 sm:p-8">
      <div class="max-w-4xl mx-auto">
        <details class="bg-white dark:bg-slate-800 rounded-md shadow-sm p-4 mb-8" open>
          <summary class="cursor-pointer font-semibold text-lg">Decryption Controls</summary>

          <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
            {/* File Selector */}
            <div>
              <label for="file-select" class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Select a file:
              </label>
              <select
                id="file-select"
                value={selectedFile()}
                onChange={(e) => setSelectedFile(e.currentTarget.value)}
                disabled={isLocked()}
                class="block w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm"
              >
                <For each={availableFiles}>
                  {(fileName) => <option value={fileName}>{fileName}</option>}
                </For>
              </select>
            </div>

            {/* Passphrase OTP Field */}
            <div class="flex flex-col">
              <label class="block text-md font-medium text-slate-600 dark:text-slate-300 mb-2">
                Enter passphrase:
              </label>
              <OtpField
                maxLength={8}
                value={password()}
                onValueChange={setPassword}
                onComplete={(val) => handleDecrypt(val)}
                class="mx-auto grow relative"
              >
                <OtpField.Input
                  aria-label="Verification Code"
                  disabled={isLocked()}
                  class="absolute inset-0 z-10 h-full w-full cursor-text bg-transparent text-transparent caret-transparent outline-none"
                />
                <div class="flex flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <div class="flex space-x-1">
                    <Slot index={0} />
                    <Slot index={1} />
                    <Slot index={2} />
                    <Slot index={3} />
                  </div>
                  <div class="slot text-slate-800 text-lg font-bold">$</div>
                  <div class="flex space-x-1">
                    <Slot index={4} />
                    <Slot index={5} />
                    <Slot index={6} />
                    <Slot index={7} />
                  </div>
                </div>
              </OtpField>
            </div>

            {/* 状态提示 */}
            <Show when={isLoading()}>
              <p class="text-sprout-400 font-medium">Decrypting...</p>
            </Show>
            <Show when={isLocked() && !isLoading()}>
              <p class="text-slate-500 italic">waiting for new input</p>
            </Show>
          </div>
        </details>

        <div class="space-y-6">
          {/* Error Message */}
          <Show when={errorMessage()}>
            <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-sm">
              <p class="text-sm font-medium text-red-800 dark:text-red-200">
                Error: {errorMessage()}
              </p>
            </div>
          </Show>

          {/* Decrypted Content */}
          <Show when={decryptedHtml()}>
            <article class="bg-white dark:bg-slate-800 rounded-sm shadow-lg p-6 sm:p-10">
              <div
                class="prose prose-slate dark:prose-invert max-w-none"
                innerHTML={decryptedHtml()}
              />
            </article>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default RageD;

