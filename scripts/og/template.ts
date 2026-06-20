
export const SPROUT = {
  50: "#f3f6ef",
  100: "#e4ecdb",
  200: "#ccdabc",
  300: "#b5caa0",
  400: "#8dab70",
  500: "#6f9052",
  600: "#55713f",
  700: "#435833",
  800: "#39472d",
  900: "#313e29",
  950: "#182013",
};

export function getHtml(title: string, date: string, entropy: number[]) {
  const escapedTitle = title.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m] || m);
  
  const escapedDate = date.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m] || m);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @font-face {
      font-family: 'Geist Mono';
      src: url('/fonts/GeistMono-Bold.woff2') format('woff2');
      font-weight: bold;
    }
    body {
      margin: 0;
      padding: 0;
      width: 1200px;
      height: 630px;
      background-color: ${SPROUT[50]};
      font-family: serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    #canvas-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }
    .content {
      position: relative;
      z-index: 10;
      width: 1000px;
      padding: 60px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .date {
      font-family: 'Geist Mono', monospace;
      font-size: 20px;
      color: ${SPROUT[500]};
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-weight: bold;
      text-shadow: 0 0 15px ${SPROUT[50]}, 0 0 5px ${SPROUT[50]};
    }
    .title {
      font-size: 92px;
      font-weight: 600;
      color: ${SPROUT[900]};
      line-height: 1.1;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
      text-shadow: 0 0 25px ${SPROUT[50]}, 0 0 10px ${SPROUT[50]};
    }
    .footer {
      margin-top: 32px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .line {
      width: 80px;
      height: 6px;
      background-color: ${SPROUT[300]};
      border-radius: 3px;
    }
    .url {
      font-family: 'Geist Mono', monospace;
      font-size: 24px;
      color: ${SPROUT[600]};
      letter-spacing: 0.25em;
      font-weight: bold;
      text-shadow: 0 0 15px ${SPROUT[50]}, 0 0 5px ${SPROUT[50]};
    }
  </style>
</head>
<body>
  <div id="canvas-container">
    <svg id="pattern" width="1200" height="630" viewBox="-1200 -630 2400 1260" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bordergradient-radial" cy="42%" fx="45%" fy="20%" r="57%">
            <stop offset="61%" stop-color="${SPROUT[300]}" />
            <stop offset="100%" stop-color="${SPROUT[100]}" />
        </radialGradient>
      </defs>
      <rect x="-2000" y="-2000" width="4000" height="4000" fill="${SPROUT[50]}" />
      <!-- Rotate 90deg CW to put gravity on the right -->
      <g id="shapes" transform="rotate(90)"></g>
    </svg>
  </div>
  <div class="content">
    <div class="date">${escapedDate}</div>
    <h1 class="title">${escapedTitle}</h1>
    <div class="footer">
      <div class="line"></div>
      <div class="url">BLOG.NYAW.XYZ</div>
    </div>
  </div>

  <script>
    const entropy = ${JSON.stringify(entropy)};
    const SPROUT = ${JSON.stringify(SPROUT)};
    
    function drawpolarcircle(opt) {
        let points = [];
        for (let itr = 0; itr < 360; itr += opt.step || 1) {
            const theta_rad = itr / 360 * Math.PI * 2;
            let vertexDistance = opt.func(theta_rad);
            if (isNaN(vertexDistance)) vertexDistance = 0;
            const x1 = Math.round(100 * vertexDistance * Math.sin(theta_rad)) / 100;
            const y1 = Math.round(100 * vertexDistance * Math.cos(theta_rad)) / 100;
            points.push(\`\${x1},\${y1}\`);
        }
        
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        for (const [key, value] of Object.entries(opt.attrs || {})) {
            polygon.setAttribute(key, value);
        }
        polygon.setAttribute("points", points.join(" "));
        return polygon;
    }

    const shapesContainer = document.getElementById("shapes");
    
    // Ordered from lightest (for outer/first drawn) to darkest (for inner/last drawn)
    const fillKeys = [100, 200, 300, 400, 500, 600, 700, 800, 900];

    for (let itr = 16; itr > 1; itr--) {
        let myfunc_rosemain = function (theta_rad) {
            const theta_rad_new = theta_rad + entropy[(99 - itr) % entropy.length] * 2 * Math.PI;
            let k1 = 0;
            for (let jjj = 1; jjj < 22; jjj++) {
                let multiplier = Math.round(2.0 + 16 * entropy[(15 + 22 * itr + jjj) % entropy.length]);
                let high_freq_penalty = Math.pow(1.0 - (multiplier / 23), 1.1);
                k1 += (high_freq_penalty * entropy[(10 * itr + jjj) % entropy.length] * 0.5 + 0.5) * Math.sin(multiplier * (theta_rad_new + 0.2 * entropy[itr % entropy.length]));
            }
            let basic_r = 150 + k1 * (1.5 + 0.25 * itr) * 0.8;
            basic_r += itr * 30;
            basic_r *= 1 + 0.04 * itr;
            return basic_r;
        }

        const uv_to_polarity = (uv) => uv * 2 - 1;
        let scale_x = 1.0 + 0.1 * uv_to_polarity(entropy[(15 + itr) % entropy.length]);
        let scale_y = 1.02 + 0.1 * uv_to_polarity(entropy[(77 - (itr % 77)) % entropy.length]);
        
        let tr_x = (itr + 11) * 0.5 * uv_to_polarity(entropy[(120 + itr) % entropy.length]);
        let tr_y = -600 + itr * 20 + (itr + 11) * 0.5 * uv_to_polarity(entropy[(155 + 2 * itr) % entropy.length]);
        
        // Calculate fill color based on iteration. itr=16 is outer (lightest), itr=2 is inner (darkest).
        const colorIndex = Math.floor(((16 - itr) / 14) * (fillKeys.length - 1));
        const fillColor = SPROUT[fillKeys[colorIndex]];

        // Enhance opacity slightly to emphasize the varied contrast
        const opacity = 0.01 + Math.pow((16 - itr) / 18, 1.5) * 0.6;
        // Vary stroke width for organic depth
        const strokeWidth = 8 + entropy[(itr * 7) % entropy.length] * 8; // 8 to 16
        
        const polygon = drawpolarcircle({
            step: itr > 7 ? 1 : 2,
            attrs: {
                transform: \`scale(\${scale_x},\${scale_y}) translate(\${tr_x},\${tr_y})\`,
                fill: fillColor,
                opacity: opacity,
                stroke: 'url(#bordergradient-radial)',
                'stroke-width': strokeWidth + 'px',
                'stroke-linejoin': 'round',
            },
            func: myfunc_rosemain
        });
        shapesContainer.appendChild(polygon);
    }
  </script>
</body>
</html>
  `;
}
