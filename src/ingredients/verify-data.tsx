import { createEffect, createResource, createSignal, lazy, onMount, Suspense } from "solid-js";
import cfg from "../constant"




const Verify = () => {

  const [verifyRes, setVerifyRes] = createSignal("");
  const [signatureFile, setSignatureFile] = createSignal<File>();
  const [signedDataFile, setSignedDataFile] = createSignal<File>();


  const handleVerify = async () => {
    console.log("开始验证流程...");
    setVerifyRes("");

    try {
      // 前置检查
      if (!signatureFile()) throw new Error("请选择签名文件");
      if (!signedDataFile()) throw new Error("请选择待验证文件");

      console.log("开始读取文件...");
      const [signatureText, signedDataText] = await Promise.all([
        readFile(signatureFile()!),
        readFile(signedDataFile()!),
      ]);

      console.log("文件读取完成，开始解析签名...");
      const minisignVerify = await import('@threema/wasm-minisign-verify');
      const [isValid, setIsValid] = createSignal()
      const [isErr, setIsErr] = createSignal()

      minisignVerify.setupLogging("debug");

      const publickey = (minisignVerify.PublicKey.decode(
        cfg.minisign_pubkey
      ));
      const signature = minisignVerify.Signature.decode(signatureText);

      console.log("准备验证数据...");
      const signedData = new TextEncoder().encode(signedDataText);
      try {
        setIsValid(publickey.verify(signedData, signature));
      } catch (e) {
        setIsErr(`${e}`)
      }


      console.log("执行验证...");

      setVerifyRes(isErr() ? "❌  错误" : isValid() ? "✅ 验证成功" : "❌ 签名不匹配");
      console.log("验证结果:", isValid());
    } catch (e) {
      const error = e as Error;
      console.error("验证出错:", error);
      setVerifyRes(`❌ 验证失败: ${error.message}`);
    } finally {
      console.log("验证流程结束");
    }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log(`开始读取文件: ${file.name}`);
      const reader = new FileReader();

      reader.onload = (e) => {
        console.log(`文件 ${file.name} 读取完成`);
        const result = e.target?.result?.toString();
        result ? resolve(result) : reject("文件内容为空");
      };

      reader.onerror = () => {
        console.error(`文件 ${file.name} 读取失败`);
        reject(`无法读取文件: ${file.name}`);
      };

      reader.readAsText(file);
    });
  };

  createEffect(async () => {
    if (signatureFile() && signedDataFile()) {
      console.log("true")
      await handleVerify()
    }
  })

  return (
    <div class="max-w-2xl mx-auto p-6 space-y-6 bg-gray-50 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-gray-800">签名验证</h1>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            签名文件（.minisig）
          </label>
          <input
            type="file"
            accept=".minisig"
            onChange={(e) => setSignatureFile(e.target.files?.[0])}
            class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            待验证文件
          </label>
          <input
            type="file"
            onChange={(e) => setSignedDataFile(e.target.files?.[0])}
            class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>


      {verifyRes() && (
        <div class={`p-4 rounded-md ${verifyRes().startsWith("✅")
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
          }`}>
          {verifyRes()}
        </div>
      )}
    </div>
  );
};

export default Verify;
