/* tslint:disable */
/* eslint-disable */
/**
 * Initialize the minisign-verify library.
 *
 * If the `log_level` argument is supplied, the console logger is
 * initialized. Valid log levels: `trace`, `debug`, `info`, `warn` or
 * `error`.
 */
export function setupLogging(log_level?: string | null): void;
export class PublicKey {
  private constructor();
  free(): void;
  /**
   * Create a Minisign public key from a string, as in the `minisign.pub` file
   */
  static decode(lines_str: string): PublicKey;
  /**
   * Verify that `signature` is a valid signature for `bin` using this
   * public key.
   *
   * If the verification succeeds, this function returns `true`. If the
   * verification fails, an exception is thrown.
   */
  verify(bin: Uint8Array, signature: Signature): boolean;
}
export class Signature {
  private constructor();
  free(): void;
  /**
   * Create a Minisign signature from a string
   */
  static decode(lines_str: string): Signature;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly setupLogging: (a: number, b: number) => void;
  readonly __wbg_publickey_free: (a: number, b: number) => void;
  readonly publickey_decode: (a: number, b: number) => number;
  readonly publickey_verify: (a: number, b: number, c: number, d: number) => number;
  readonly __wbg_signature_free: (a: number, b: number) => void;
  readonly signature_decode: (a: number, b: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
