import type { APIEvent } from "@solidjs/start/server";

export function GET(_event: APIEvent) {
  const k = Buffer.from("dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXkgNzRCMkFGNDUzNzc0NEI5ClJXUzVSSGRUOUNwTEIzN2tRZE0rdEh3Vzh4d09Td3NBM3hFeHQ2UFV0MVgzVlIwdzNlN0RSRTkvCg==", "base64").toString();
  return new Response(k, {
    headers: { "content-type": "text/plain" },
  });
}
