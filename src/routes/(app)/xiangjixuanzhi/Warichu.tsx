import {
  createMemo,
  createSignal,
  onMount,
  onCleanup,
  type Component,
  Show,
} from "solid-js";

export const Warichu: Component<{ content: string }> = (props) => {
  const [halfContent, setHalfContent] = createSignal("");
  let phStartEl: HTMLElement | undefined;
  let phEndEl: HTMLElement | undefined;
  let wrapperEl: HTMLElement | undefined;

  const [beginTop, setBeginTop] = createSignal(0);
  const [endBottom, setEndBottom] = createSignal(0);
  const [lineHeight, setLineHeight] = createSignal(0);
  const [fontSize, setFontSize] = createSignal(0);
  const [rows, setRows] = createSignal(0);

  const lineMargin = createMemo(() => lineHeight() / 2 - (2 * fontSize()) / 3);

  const polygon = createMemo(() => {
    let offset = 0;
    const tempPath = [];
    for (let i = 0; i < rows() - 1; i++) {
      tempPath.push(
        `${offset}px 0`,
        `${offset}px 100%`,
        `${offset + lineMargin() * 2}px 100%`,
        `${offset + lineMargin() * 2}px 0`
      );
      offset += lineHeight();
    }
    if (rows() > 1) offset -= lineHeight();
    tempPath.push(
      `${offset}px 0`,
      `${offset}px ${beginTop()}px`,
      `100% ${beginTop()}px`,
      `100% 0`
    );
    return "polygon(" + tempPath.join(", ") + ")";
  });

  // 将 DOM 操作移到 onMount 中确保只在客户端执行
  onMount(() => {
    // 计算 halfContent
    const calculateHalfContent = () => {
      const content = props.content;
      const midIndex = Math.ceil(content.length / 2);
      const str1 = content.slice(0, midIndex);
      const str2 = content.slice(midIndex);
      
      const div = document.createElement("div");
      div.classList.add("test-line-wrapper");
      
      const p1 = document.createElement("p");
      const p2 = document.createElement("p");
      p1.textContent = str1;
      p2.textContent = str2;
      div.append(p1, p2);
      
      document.body.appendChild(div);
      const { width: w1 } = p1.getBoundingClientRect();
      const { width: w2 } = p2.getBoundingClientRect();
      div.remove();
      
      setHalfContent(w1 > w2 ? str1 : str2);
    };

    const resetStyle = () => {
      if (!phStartEl || !phEndEl || !wrapperEl) return;

      const { top: phStartTop, left: phStartLeft } =
        phStartEl.getBoundingClientRect();
      const { top: wrapperTop, bottom: wrapperBottom } =
        wrapperEl.getBoundingClientRect();
      const { bottom: phEndBottom, left: phEndLeft } =
        phEndEl.getBoundingClientRect();

      const computedStyle = window.getComputedStyle(phStartEl);
      const lh = Number.parseFloat(computedStyle.lineHeight);
      const fs = Number.parseFloat(computedStyle.fontSize);
      const r = Math.round((phStartLeft - phEndLeft) / lh + 1);

      setBeginTop(phStartTop - wrapperTop);
      setEndBottom(wrapperBottom - phEndBottom - fs / 3);
      setRows(r);
      setFontSize(fs);
      setLineHeight(lh);
    };

    // 初始化计算
    calculateHalfContent();
    resetStyle();

    // 事件监听
    window.addEventListener("resize", resetStyle);
    document.fonts.ready.then(resetStyle);
    onCleanup(() => window.removeEventListener("resize", resetStyle));
  });

  return (
    <span class="warichu">
      <span
        class="warichu-wrapper"
        ref={wrapperEl}
        style={{
          "--polygon": polygon(),
          "--big-line-height": `${lineHeight()}px`,
          "--end-bottom": `${endBottom()}px`,
          "--before-height": rows() === 1 ? `${beginTop()}px` : "100%",
          width: `${rows() * lineHeight()}px`,
          "text-align": rows() === 1 ? "start" : "justify",
        }}
      >
        <span class="warichu-text">{props.content}</span>
      </span>
      <i ref={phStartEl} class="warichu-ph-start" />
      {/* 只在客户端渲染占位符 */}
      <Show when={halfContent()}>
        <span class="warichu-placeholder">{halfContent()}</span>
      </Show>
      <i ref={phEndEl} class="warichu-ph-end" />
    </span>
  );
};
