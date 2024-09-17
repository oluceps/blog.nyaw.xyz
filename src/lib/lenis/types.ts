import type Lenis from 'lenis';
import type { LenisOptions, ScrollCallback } from 'lenis';
import type { JSX } from 'solid-js';

export type LenisContextValue = {
  lenis: Lenis;
  addCallback: (callback: ScrollCallback, priority: number) => void;
  removeCallback: (callback: ScrollCallback) => void;
};

export type LenisProps = {
  /**
   * Setup a global instance of Lenis
   * @default false
   */
  root?: boolean;
  /**
   * Lenis options
   */
  options?: LenisOptions;
  /**
   * Auto-setup requestAnimationFrame
   * @default true
   */
  autoRaf?: boolean;
  /**
   * RequestAnimationFrame priority
   * @default 0
   */
  rafPriority?: number;
  /**
   * Children
   */
  children?: JSX.Element;
  /**
   * Class name for the wrapper div
   *
   * When `root` is `false`, this will be applied to the wrapper div
   */
  className?: string;
  /**
   * Additional props for the wrapper div
   *
   * When `root` is `false`, this will be applied to the wrapper div
   */
  props?: Omit<JSX.IntrinsicElements['div'], 'children' | 'className'>;
};

export type LenisRef = {
  /**
   * The wrapper div element
   *
   * Will only be defined if `root` is `false`
   */
  wrapper: HTMLDivElement | null;
  /**
   * The content div element
   *
   * Will only be defined if `root` is `false`
   */
  content: HTMLDivElement | null;
  /**
   * The lenis instance
   */
  lenis?: Lenis;
};

