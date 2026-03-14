function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return reject(new Error("Image source missing"));
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawContain(ctx, img, canvasW, canvasH) {
  const scale = Math.min(canvasW / img.width, canvasH / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (canvasW - w) / 2;
  const y = (canvasH - h) / 2;
  ctx.drawImage(img, x, y, w, h);
}

function drawTint(ctx, color, w, h) {
  if (!color) return;
  ctx.save();
  ctx.globalAlpha = 0.38;
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

async function drawLayerImage(ctx, layer, rect) {
  if (!layer?.imageUrl) return;
  const img = await loadImage(layer.imageUrl);

  const x = rect.x + (Number(layer.x || 0) / rect.baseW) * rect.w;
  const y = rect.y + (Number(layer.y || 0) / rect.baseH) * rect.h;
  const w = (Number(layer.w || 0) / rect.baseW) * rect.w;
  const h = (Number(layer.h || 0) / rect.baseH) * rect.h;
  const rotate = Number(layer.rotate || 0) * (Math.PI / 180);

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rotate);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawLayerText(ctx, layer, rect) {
  const text = String(layer?.text || "");
  if (!text) return;

  const x = rect.x + (Number(layer.x || 0) / rect.baseW) * rect.w;
  const y = rect.y + (Number(layer.y || 0) / rect.baseH) * rect.h;
  const w = (Number(layer.w || 0) / rect.baseW) * rect.w;
  const h = (Number(layer.h || 0) / rect.baseH) * rect.h;
  const rotate = Number(layer.rotate || 0) * (Math.PI / 180);
  const fs = Math.max(12, Math.round((Number(layer.fontSize || 32) / rect.baseH) * rect.h));

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rotate);
  const fontFamily = layer?.font || "sans-serif";
  const fontWeight = layer?.fontWeight || "700";
  ctx.fillStyle = layer?.color || "#111111";
  ctx.font = `${fontWeight} ${fs}px ${fontFamily}`;
  ctx.textBaseline = "top";
  ctx.textAlign = layer?.textAlign || "left";

  const lines = text.split("\n").slice(0, 3);
  const lineHeight = Math.round(fs * 1.1);
  const alignX =
    ctx.textAlign === "center" ? 0 : ctx.textAlign === "right" ? w / 2 : -w / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, alignX, -h / 2 + i * lineHeight, w);
  });
  ctx.restore();
}

export async function buildPreviewForSide({
  mockupSrc,
  tintHex,
  layers = [],
  side = "front",
  canvasW = 800,
  canvasH = 1000,
  printW = 280,
  printH = 330,
}) {
  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  if (mockupSrc) {
    try {
      const mockup = await loadImage(mockupSrc);
      drawContain(ctx, mockup, canvasW, canvasH);
    } catch {}
  }

  drawTint(ctx, tintHex, canvasW, canvasH);

  const areaW = canvasW * 0.78;
  const areaH = areaW * (printH / printW);
  const areaX = (canvasW - areaW) / 2;
  const areaY = canvasH * 0.22;
  const areaRect = { x: areaX, y: areaY, w: areaW, h: areaH, baseW: printW, baseH: printH };

  const sideLayers = (layers || []).filter((l) => l?.side === side);
  for (const layer of sideLayers) {
    if (layer?.kind === "image") {
      // eslint-disable-next-line no-await-in-loop
      await drawLayerImage(ctx, layer, areaRect);
    } else {
      drawLayerText(ctx, layer, areaRect);
    }
  }

  try {
    return canvas.toDataURL("image/jpeg", 0.8);
  } catch {
    return "";
  }
}
