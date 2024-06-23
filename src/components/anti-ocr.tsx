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
    <div>
      <div style="float: left">
        <textarea
          id="txt"
          style={{ width: '400px', height: '500px' }}
          value={txt()}
          onInput={(e) => setTxt((e.target as HTMLTextAreaElement).value)}
        />
      </div>
      <div>
        <label>字体大小:</label>
        <input size="4" id="fontSize" value={fontSize()} onInput={(e) => setFontSize(parseInt((e.target as HTMLInputElement).value))} />
        px
        <label>字体精细:</label>
        <select id="fontWeight" value={fontWeight()} onChange={(e) => setFontWeight((e.target as HTMLSelectElement).value)}>
          <option value="normal">正常</option>
          <option value="bold">粗</option>
        </select>
        <label>每行显示:</label>
        <input size="4" id="len" value={len()} onInput={(e) => setLen(parseInt((e.target as HTMLInputElement).value))} />
        个字
        <p>
          文字颜色:<span id="fontcolor">{fontColor()}</span>
          <canvas id="fontcolor_c" width="20" height="20"></canvas>
        </p>
        <p>
          Red：
          <input type="range" id="fontcolor_red" min="0" max="255" value="0" onInput={() => changeColor('fontcolor')} />
        </p>
        <p>
          Green：
          <input type="range" id="fontcolor_green" min="0" max="255" value="0" onInput={() => changeColor('fontcolor')} />
        </p>
        <p>
          Blue：
          <input type="range" id="fontcolor_blue" min="0" max="255" value="0" onInput={() => changeColor('fontcolor')} />
        </p>
        <p>
          背景颜色:<span id="backcolor">{backColor()}</span>
          <canvas id="backcolor_c" width="20" height="20"></canvas>
        </p>
        <p>
          Red：
          <input type="range" id="backcolor_red" min="0" max="255" value="255" onInput={() => changeColor('backcolor')} />
        </p>
        <p>
          Green：
          <input type="range" id="backcolor_green" min="0" max="255" value="255" onInput={() => changeColor('backcolor')} />
        </p>
        <p>
          Blue：
          <input type="range" id="backcolor_blue" min="0" max="255" value="255" onInput={() => changeColor('backcolor')} />
        </p>
        <label>線條粗細:</label>
        <input size="4" id="lineSize" value={lineSize()} onInput={(e) => setLineSize(parseInt((e.target as HTMLInputElement).value))} />
        <label>畫點大小:</label>
        <input size="4" id="pointSize" value={pointSize()} onInput={(e) => setPointSize(parseInt((e.target as HTMLInputElement).value))} />
        <label>畫點密度:</label>
        <input type="range" id="points" min="0" max="20" value={points()} onInput={(e) => setPoints(parseInt((e.target as HTMLInputElement).value))} />
        <button onClick={textToImg}>生成图片</button>
      </div>
      <canvas ref={canvas} style={{ display: 'block' }} width="0" height="0"></canvas>
      <div>
        <img ref={img} style={{ border: '1px solid' }} />
      </div>
      <a href="https://github.com/yuzu233/anti-ocr">Github</a> | <a href="https://twitter.com/yuzuqwq">Author's Twitter</a>
    </div>
  );
};

export default AntiOCR;

