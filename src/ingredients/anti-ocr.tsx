import {
	Component,
	JSXElement,
	ParentComponent,
	Show,
	createEffect,
} from "solid-js";

import { createSignal, onCleanup, onMount } from "solid-js";

const AntiOCR = () => {
	let canvas: HTMLCanvasElement;
	let img: HTMLImageElement;

	const componentToHex = (c: number) => {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	};
	const rgbToHex = (rgbString: string) => {
		const parts = rgbString.slice(4, -1).split(",");
		const r = Number.parseInt(parts[0] || "0");
		const g = Number.parseInt(parts[1] || "0");
		const b = Number.parseInt(parts[2] || "0");
		const rt = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
		console.log(rt);
		return rt;
	};

	const [txt, setTxt] = createSignal(
		"這是一段測試文本～\n喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵喵?",
	);
	const [fontSize, setFontSize] = createSignal(16);
	const [fontWeight, setFontWeight] = createSignal("normal");
	const [len, setLen] = createSignal(40);
	const [lineSize, setLineSize] = createSignal(1);
	const [pointSize, setPointSize] = createSignal(1);
	const [points, setPoints] = createSignal(1);
	const [fontColor, setFontColor] = createSignal("rgb(0,0,0)");
	const [backColor, setBackColor] = createSignal("rgb(255,255,255)");
	const [fontColorHex, setFontColorHex] = createSignal("");
	const [backColorHex, setBackColorHex] = createSignal("");

	const [element, setElement] = createSignal<HTMLDivElement>();

	createEffect(() => {
		if (element()) setFontColorHex(rgbToHex(fontColor()));
	});
	createEffect(() => {
		if (element()) setBackColorHex(rgbToHex(backColor()));
	});
	const random = (min: number, max: number) => {
		return Math.round(Math.random() * (max - min)) + min;
	};

	const textToImg = () => {
		const text = txt();
		const fontSizeValue = fontSize();
		const padding = 10;
		const lineHeight = fontSizeValue * 1.5; // 行间距
		const maxWidth = len() * fontSizeValue; // 每行的最大宽度限制，基于字体大小和字符数
		const canvasEl = document.createElement("canvas");
		const context = canvasEl.getContext("2d");

		if (!context) return;

		if (text === "") {
			alert("請輸入文字");
			return;
		}

		// 设置字体，便于测量文本宽度
		context.font = `${fontWeight()} ${fontSizeValue}px sans-serif`;
		context.textBaseline = "top";

		// 拆分文本，并确保每行文字不会超过画布宽度
		const lines = [];
		const words = text.split(" "); // 按空格拆分单词
		let currentLine = "";

		words.forEach((word) => {
			const testLine = currentLine + word + " ";
			const testWidth = context.measureText(testLine).width;

			if (testWidth > maxWidth) {
				// 如果当前行的长度超过最大宽度，推送当前行到行数组，并重新开始新行
				lines.push(currentLine.trim());
				currentLine = word + " ";
			} else {
				currentLine = testLine; // 否则继续拼接单词到当前行
			}
		});

		// 添加最后一行
		lines.push(currentLine.trim());

		// 动态调整 Canvas 宽高
		const canvasWidth = Math.min(maxWidth + padding * 2, canvasEl.width);
		const canvasHeight = lines.length * lineHeight + padding * 2;
		canvasEl.width = canvasWidth;
		canvasEl.height = canvasHeight;

		// 填充背景
		context.fillStyle = backColor();
		context.fillRect(0, 0, canvasEl.width, canvasEl.height);

		// 设置文本颜色
		context.fillStyle = fontColor();

		// 绘制随机点
		const numPoints = text.length * fontSizeValue * points();
		for (let i = 0; i < numPoints; i++) {
			const x = random(0, canvasEl.width);
			const y = random(0, canvasEl.height);
			context.lineWidth = pointSize();
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(x + 1, y + 1);
			context.closePath();
			context.stroke();
		}

		// 绘制随机线条
		const numLines = text.length / 5;
		for (let i = 0; i < numLines; i++) {
			const x = random(0, canvasEl.width);
			const y = random(0, canvasEl.height);
			context.lineWidth = lineSize();
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(
				x +
					random(-random(0, canvasEl.width / 2), random(0, canvasEl.width / 2)),
				y +
					random(
						-random(0, canvasEl.height / 2),
						random(0, canvasEl.height / 2),
					),
			);
			context.closePath();
			context.stroke();
		}

		// 绘制文本
		let yPosition = padding;
		lines.forEach((line) => {
			context.fillText(line, padding, yPosition); // 绘制每一行文本
			yPosition += lineHeight; // 增加 y 坐标以换行
		});

		// 将生成的 Canvas 转为图片
		const img = document.createElement("img");
		img.src = canvasEl.toDataURL("image/png");
		document.body.appendChild(img); // 将图片添加到页面显示
	};

	const changeColor = (name: string) => {
		const red = (document.getElementById(`${name}_red`) as HTMLInputElement)
			.value;
		const green = (document.getElementById(`${name}_green`) as HTMLInputElement)
			.value;
		const blue = (document.getElementById(`${name}_blue`) as HTMLInputElement)
			.value;
		const color = `rgb(${red},${green},${blue})`;
		if (name === "fontcolor") {
			setFontColor(color);
		} else {
			setBackColor(color);
		}
	};

	return (
		<div class="flex flex-col w-full justify-center items-center">
			<div class="grid md:grid-cols-2 w-full gap-3">
				<div class="w-full h-full">
					<textarea
						class="textarea textarea-bordered w-full h-full p-2"
						placeholder="在这儿输入文字"
						id="txt"
						value={txt()}
						onInput={(e) =>
							setTxt((e.target as unknown as HTMLTextAreaElement).value)
						}
					/>
				</div>

				<div class="w-full h-full flex flex-col" ref={setElement}>
					<label class="label">
						<span class="label-text">字体大小</span>
					</label>
					<input
						type="number"
						id="fontSize"
						class="input input-bordered"
						value={fontSize()}
						onInput={(e) =>
							setFontSize(Number.parseInt((e.target as HTMLInputElement).value))
						}
					/>

					<label class="label">
						<span class="label-text">字体精细</span>
					</label>
					<select
						id="fontWeight"
						class="select select-bordered"
						value={fontWeight()}
						onChange={(e) =>
							setFontWeight((e.target as HTMLSelectElement).value)
						}
					>
						<option value="normal">正常</option>
						<option value="bold">粗</option>
					</select>

					<label class="label">
						<span class="label-text">每行显示</span>
					</label>
					<input
						type="number"
						id="len"
						class="input input-bordered"
						value={len()}
						onInput={(e) =>
							setLen(Number.parseInt((e.target as HTMLInputElement).value))
						}
					/>

					<label class="label">
						<span class="label-text">線條粗細</span>
					</label>
					<input
						type="number"
						id="lineSize"
						class="input input-bordered"
						value={lineSize()}
						onInput={(e) =>
							setLineSize(Number.parseInt((e.target as HTMLInputElement).value))
						}
					/>

					<label class="label">
						<span class="label-text">畫點大小</span>
					</label>
					<input
						type="number"
						id="pointSize"
						class="input input-bordered"
						value={pointSize()}
						onInput={(e) =>
							setPointSize(
								Number.parseInt((e.target as HTMLInputElement).value),
							)
						}
					/>

					<label class="label">
						<span class="label-text">畫點密度</span>
					</label>
					<input
						type="range"
						id="points"
						class="range"
						min="0"
						max="20"
						value={points()}
						onInput={(e) =>
							setPoints(Number.parseInt((e.target as HTMLInputElement).value))
						}
					/>
				</div>
			</div>

			<div class="grid md:grid-cols-2 w-full gap-3">
				<div class="w-full py-2 flex flex-col">
					<div
						class={`px-1.5 flex items-center justify-center font-bold text-[${fontColorHex()}]`}
					>
						文字颜色: {fontColorHex()}
					</div>
					<canvas id="fontcolor_c" class="hidden"></canvas>
					<label class="label">
						<span class="label-text">Red:</span>
					</label>
					<input
						type="range"
						id="fontcolor_red"
						class="range"
						min="0"
						max="255"
						value="0"
						onInput={() => changeColor("fontcolor")}
					/>

					<label class="label">
						<span class="label-text">Green:</span>
					</label>
					<input
						type="range"
						id="fontcolor_green"
						class="range"
						min="0"
						max="255"
						value="0"
						onInput={() => changeColor("fontcolor")}
					/>

					<label class="label">
						<span class="label-text">Blue:</span>
					</label>
					<input
						type="range"
						id="fontcolor_blue"
						class="range"
						min="0"
						max="255"
						value="0"
						onInput={() => changeColor("fontcolor")}
					/>
				</div>
				<div class="w-full py-2 flex flex-col">
					<canvas id="backcolor_c" class="hidden"></canvas>
					<div
						class={`px-1.5 flex items-center justify-center font-bold text-[${backColorHex()}]`}
					>
						背景颜色: {backColorHex()}
					</div>
					<label class="label">
						<span class="label-text">Red:</span>
					</label>
					<input
						type="range"
						id="backcolor_red"
						class="range"
						min="0"
						max="255"
						value="255"
						onInput={() => changeColor("backcolor")}
					/>

					<label class="label">
						<span class="label-text">Green:</span>
					</label>
					<input
						type="range"
						id="backcolor_green"
						class="range"
						min="0"
						max="255"
						value="255"
						onInput={() => changeColor("backcolor")}
					/>

					<label class="label">
						<span class="label-text">Blue:</span>
					</label>
					<input
						type="range"
						id="backcolor_blue"
						class="range"
						min="0"
						max="255"
						value="255"
						onInput={() => changeColor("backcolor")}
					/>
				</div>
			</div>

			<button class="btn" onClick={textToImg}>
				生成图片
			</button>
			<canvas ref={canvas!} class="hidden"></canvas>
		</div>
	);
};

export default AntiOCR;
