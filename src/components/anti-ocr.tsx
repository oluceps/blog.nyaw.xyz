import { Component, JSXElement, ParentComponent, Show } from "solid-js";

import { createSignal, onCleanup, onMount } from 'solid-js';

const AntiOCR = () => {
  let canvas: HTMLCanvasElement;
  let img: HTMLImageElement;

  const [txt, setTxt] = createSignal('這是一段測試文本～\n哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈\n喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵');
  const [fontSize, setFontSize] = createSignal(16);
  const [fontWeight, setFontWeight] = createSignal('normal');
  const [len, setLen] = createSignal(40);
  const [lineSize, setLineSize] = createSignal(1);
  const [pointSize, setPointSize] = createSignal(1);
  const [points, setPoints] = createSignal(1);
  const [fontColor, setFontColor] = createSignal('rgb(0,0,0)');
  const [backColor, setBackColor] = createSignal('rgb(255,255,255)');

  const random = (min: number, max: number) => {
    return Math.round(Math.random() * (max - min)) + min;
  };

  const textToImg = () => {
    let text = txt();
    let length = len();
    if (text === '') {
      alert('請輸入文字');
      return;
    }
    if (length > text.length) {
      length = text.length;
    }

    canvas.width = fontSize() * length + 20;
    canvas.height = fontSize() * 1.5 * Math.ceil(text.length / length) + text.split('\n').length * fontSize();

    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = backColor();
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = fontColor();
      context.strokeStyle = fontColor();

      const n = text.length / 5;
      const n2 = text.length * fontSize() * points();
      for (let i = 0; i < n2; i++) {
        const x = random(0, canvas.width);
        const y = random(0, canvas.height);
        context.lineWidth = pointSize();
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 1, y + 1);
        context.closePath();
        context.stroke();
      }

      for (let i = 0; i < n; i++) {
        const x = random(0, canvas.width);
        const y = random(0, canvas.height);
        context.lineWidth = lineSize();
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(
          x + random(-random(0, canvas.width / 2), random(0, canvas.width / 2)),
          y + random(-random(0, canvas.width / 2), random(0, canvas.width / 2))
        );
        context.closePath();
        context.stroke();
      }

      context.font = `${fontWeight()} ${fontSize()}px sans-serif`;
      context.textBaseline = 'top';

      const fillTxt = (text: string) => {
        let i = 0;
        while (text.length > length) {
          const txtLine = text.substring(0, length);
          text = text.substring(length);
          const r = random(-1, 1) / random(50, 100);
          context.rotate(r);
          context.fillText(txtLine, 10, 5 + fontSize() * 1.5 * i++, canvas.width);
          context.rotate(-r);
        }
        context.fillText(text, 0, fontSize() * 1.5 * i, canvas.width);
      };

      const txtArray = text.split('\n');
      txtArray.forEach((line, j) => {
        fillTxt(line);
        context.fillText('\n', 0, fontSize() * 1.5 * j++, canvas.width);
      });

      img.src = canvas.toDataURL('image/png');
    }
  };

  const changeColor = (name: string) => {
    const red = (document.getElementById(`${name}_red`) as HTMLInputElement).value;
    const green = (document.getElementById(`${name}_green`) as HTMLInputElement).value;
    const blue = (document.getElementById(`${name}_blue`) as HTMLInputElement).value;
    const color = `rgb(${red},${green},${blue})`;
    if (name === 'fontcolor') {
      setFontColor(color);
    } else {
      setBackColor(color);
    }
  };

  onMount(() => {
    changeColor('fontcolor');
    changeColor('backcolor');
  });

  return (
    <div class="flex flex-col items-center p-4 space-y-4">
      <div class="w-full max-w-2xl flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <textarea
          id="txt"
          class="textarea textarea-bordered w-full h-64 md:w-1/2"
          value={txt()}
          onInput={(e) => setTxt((e.target as HTMLTextAreaElement).value)}
        />
        <div class="w-full md:w-1/2 space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">字体大小</span>
            </label>
            <input
              type="number"
              id="fontSize"
              class="input input-bordered"
              value={fontSize()}
              onInput={(e) => setFontSize(parseInt((e.target as HTMLInputElement).value))}
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">字体精细</span>
            </label>
            <select
              id="fontWeight"
              class="select select-bordered"
              value={fontWeight()}
              onChange={(e) => setFontWeight((e.target as HTMLSelectElement).value)}
            >
              <option value="normal">正常</option>
              <option value="bold">粗</option>
            </select>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">每行显示</span>
            </label>
            <input
              type="number"
              id="len"
              class="input input-bordered"
              value={len()}
              onInput={(e) => setLen(parseInt((e.target as HTMLInputElement).value))}
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">線條粗細</span>
            </label>
            <input
              type="number"
              id="lineSize"
              class="input input-bordered"
              value={lineSize()}
              onInput={(e) => setLineSize(parseInt((e.target as HTMLInputElement).value))}
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">畫點大小</span>
            </label>
            <input
              type="number"
              id="pointSize"
              class="input input-bordered"
              value={pointSize()}
              onInput={(e) => setPointSize(parseInt((e.target as HTMLInputElement).value))}
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">畫點密度</span>
            </label>
            <input
              type="range"
              id="points"
              class="range range-primary"
              min="0"
              max="20"
              value={points()}
              onInput={(e) => setPoints(parseInt((e.target as HTMLInputElement).value))}
            />
          </div>
        </div>
      </div>

      <div class="flex flex-wrap justify-around w-full max-w-2xl">
        <div class="w-full md:w-1/2 space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">文字颜色: <span id="fontcolor">{fontColor()}</span></span>
            </label>
            <canvas id="fontcolor_c" width="20" height="20"></canvas>
            <label class="label">
              <span class="label-text">Red:</span>
            </label>
            <input
              type="range"
              id="fontcolor_red"
              class="range range-primary"
              min="0"
              max="255"
              value="0"
              onInput={() => changeColor('fontcolor')}
            />
            <label class="label">
              <span class="label-text">Green:</span>
            </label>
            <input
              type="range"
              id="fontcolor_green"
              class="range range-primary"
              min="0"
              max="255"
              value="0"
              onInput={() => changeColor('fontcolor')}
            />
            <label class="label">
              <span class="label-text">Blue:</span>
            </label>
            <input
              type="range"
              id="fontcolor_blue"
              class="range range-primary"
              min="0"
              max="255"
              value="0"
              onInput={() => changeColor('fontcolor')}
            />
          </div>
        </div>
        <div class="w-full md:w-1/2 space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">背景颜色: <span id="backcolor">{backColor()}</span></span>
            </label>
            <canvas id="backcolor_c" width="20" height="20"></canvas>
            <label class="label">
              <span class="label-text">Red:</span>
            </label>
            <input
              type="range"
              id="backcolor_red"
              class="range range-primary"
              min="0"
              max="255"
              value="255"
              onInput={() => changeColor('backcolor')}
            />
            <label class="label">
              <span class="label-text">Green:</span>
            </label>
            <input
              type="range"
              id="backcolor_green"
              class="range range-primary"
              min="0"
              max="255"
              value="255"
              onInput={() => changeColor('backcolor')}
            />
            <label class="label">
              <span class="label-text">Blue:</span>
            </label>
            <input
              type="range"
              id="backcolor_blue"
              class="range range-primary"
              min="0"
              max="255"
              value="255"
              onInput={() => changeColor('backcolor')}
            />
          </div>
        </div>
      </div>

      <button class="btn btn-primary" onClick={textToImg}>
        生成图片
      </button>
      <canvas ref={canvas!} class="hidden"></canvas>
      <div class="mt-4">
        <img ref={img!} class="border" />
      </div>
      <div class="mt-4">
        <a href="https://github.com/yuzu233/anti-ocr" class="link link-primary">
          Github
        </a>{' '}
        |{' '}
        <a href="https://twitter.com/yuzuqwq" class="link link-primary">
          Author's Twitter
        </a>
      </div>
    </div>
  );
};

export default AntiOCR;

