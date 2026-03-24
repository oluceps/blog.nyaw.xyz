import { createEffect, createSignal, Match, Show, Switch } from "solid-js";
import { Ok, Err, type Throwable } from '@typ3/throwable'
import cfg from "~/constant";
import useRust from 'minisign';
import { twMerge } from "tailwind-merge";
import Spinner from "~/components/Spinner";

type InputMode = 'file' | 'text';
type ErrorState = 'SignatureDecodeError' | { type: 'VerifyError', msg: string } | { type: 'Unknown', msg: string }

type Res = Throwable<'yes' | { res: 'no', msg: string } | undefined, ErrorState>

const Verify = () => {
  const { rust, error } = useRust();
  const [loading, setLoading] = createSignal(false);
  const [verifyRes, setVerifyRes] = createSignal<Res>(Ok(undefined));
  const [signatureFile, setSignatureFile] = createSignal<File>();
  const [signedDataFile, setSignedDataFile] = createSignal<File>();
  const [signatureText, setSignatureText] = createSignal("");
  const [signedDataText, setSignedDataText] = createSignal("");
  const [inputMode, setInputMode] = createSignal<InputMode>('file');

  const handleVerify = async () => {
    console.log("begin verification");
    setVerifyRes(Ok(undefined));
    setLoading(true);

    let error: ErrorState;

    try {
      const rustInstance = rust()!;
      let signatureContent = "";
      let signedContent = "";

      if (inputMode() === 'file') {
        if (!signatureFile()) throw new Error("选择签名文件");
        if (!signedDataFile()) throw new Error("选择待验证文件");

        [signatureContent, signedContent] = await Promise.all([
          readFile(signatureFile()!),
          readFile(signedDataFile()!),
        ]);
      } else {
        if (!signatureText()) throw new Error("输入签名内容");
        if (!signedDataText()) throw new Error("输入待验证内容");
        signatureContent = signatureText();
        signedContent = signedDataText();
      }

      rustInstance.setupLogging("debug");

      const appendNewlineForMinisignEncode = inputMode() === "text" ? "\n" : "";

      const publicKey = rustInstance.PublicKey.decode(cfg.minisign_pubkey);


      let signature;

      try {
        signature = rustInstance.Signature.decode(signatureContent + appendNewlineForMinisignEncode);
      } catch (e) {
        console.log(e)
        error = 'SignatureDecodeError'
        setVerifyRes(Err(error))
        return;
      }


      const signedData = new TextEncoder().encode(signedContent + appendNewlineForMinisignEncode);

      let isValid = false;
      try {
        isValid = publicKey.verify(signedData, signature!);
      } catch (e) {
        console.log(e)
        setVerifyRes(Ok({ res: 'no', msg: (e as Error).message }));
      }

      if (isValid) {
        setVerifyRes(Ok('yes'))
      }
    }
    catch (e) {
      const err = e as Error;
      console.error("验证出错:", err);
      setVerifyRes(Err({ type: 'Unknown', msg: err.message }));
    }
    finally { setLoading(false) }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result?.toString() || "");
      reader.onerror = () => reject(`无法读取文件: ${file.name}`);
      reader.readAsText(file);
    });
  };

  createEffect(async () => {
    if (inputMode() === 'file' && signatureFile() && signedDataFile()) {
      await handleVerify();
    }
  });

  const [finalResText, setFinalResText] = createSignal<string | undefined>();

  createEffect(() => {
    if (verifyRes().isError) {
      switch (verifyRes().error) {
        case 'SignatureDecodeError': { setFinalResText("签名解析失败"); break; }
      }
      return;
    }

    const r = verifyRes().unwrap();

    if ((typeof r === "object") && r.res === "no") {
      setFinalResText(`不是我说的, ${r.msg}`)
    }
    switch (r) {
      case "yes": { setFinalResText("验证完成，是我说的"); break; }
      case undefined: { setFinalResText("? this should not happen"); break; }
    }
  })

  return (
    <Show
      when={rust()}
      fallback={<div>{error() ? "加载失败" : "加载中"}</div>}
    >
      <div class="max-w-2xl mx-auto p-6 space-y-6 bg-gray-50 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-gray-800">Signature Verification</h1>

        <div class="flex gap-2 mb-4">
          <button
            classList={{
              "bg-ouchi-500 text-white": inputMode() === 'file',
              "bg-gray-200": inputMode() !== 'file'
            }}
            class="px-4 py-2 rounded-md"
            onClick={() => { setInputMode('file'); setVerifyRes(Ok(undefined)) }}
          >
            文件验证
          </button>
          <button
            classList={{
              "bg-ouchi-500 text-white": inputMode() === 'text',
              "bg-gray-200": inputMode() !== 'text'
            }}
            class="px-4 py-2 rounded-md"
            onClick={() => { setInputMode('text'); setVerifyRes(Ok(undefined)) }}
          >
            文本验证
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {inputMode() === 'file' ? "签名文件（*.minisig）" : "签名文本 / Signature"}
            </label>
            <Show
              when={inputMode() === 'file'}
              fallback={
                <textarea
                  value={signatureText()}
                  onInput={(e) => setSignatureText(e.currentTarget.value)}
                  class="w-full p-2 border rounded-md h-32 font-mono text-sm"
                  placeholder={"minisign 签名文本" + '\n' + "untrusted comment: ..."}
                />
              }
            >
              <input
                type="file"
                accept=".minisig"
                onChange={(e) => setSignatureFile(e.target.files?.[0])}
                class="w-full p-2 border rounded-md focus:ring-2 focus:ring-ouchi-500 focus:border-ouchi-500"
              />
            </Show>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {inputMode() === 'file' ? "待验证文件（*）" : "待验证文本 / Text Content"}
            </label>
            <Show
              when={inputMode() === 'file'}
              fallback={
                <textarea
                  value={signedDataText()}
                  onInput={(e) => setSignedDataText(e.currentTarget.value)}
                  class="w-full p-2 border rounded-md h-48 font-mono text-sm"
                  placeholder="原始文本"
                />
              }
            >
              <input
                type="file"
                onChange={(e) => setSignedDataFile(e.target.files?.[0])}
                class="w-full p-2 border rounded-md focus:ring-2 focus:ring-ouchi-500 focus:border-ouchi-500"
              />
            </Show>
          </div>
        </div>

        <Show when={inputMode() === "text"}>
          <button
            onClick={handleVerify}
            disabled={!signatureText() || !signedDataText()}
            class="w-full bg-ouchi-500 text-white py-2 rounded-md hover:bg-ouchi-600 disabled:bg-gray-400"
          >
            验证
          </button>
        </Show>


        <Show when={loading()}>
          <Spinner />
        </Show>
        <Show when={verifyRes().isError || verifyRes().value}>
          <div class={twMerge(`p-4 rounded-md`, verifyRes().pipe((i) => i == 'yes').value
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
          )}>
            {finalResText()}
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default Verify;
