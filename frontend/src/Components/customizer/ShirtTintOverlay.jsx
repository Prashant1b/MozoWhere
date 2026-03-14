import { useEffect, useState } from "react";

/**
 * Realistic T-shirt color tinting using canvas multiply blend.
 * Works perfectly with transparent-background PNG mockups.
 *
 * How it works:
 * 1. Draws the mockup on an off-screen canvas
 * 2. Applies multiply-blend with the chosen color
 * 3. Clips to original alpha (transparent bg stays transparent)
 * Result: only the T-shirt fabric gets colored, background untouched.
 */

export default function ShirtTintOverlay({
  hex,
  imageUrl,
  imgClass = "",
  alt = "Tshirt",
}) {
  const [tintedSrc, setTintedSrc] = useState(null);
  const [fallback, setFallback] = useState(false);

  const isWhite =
    !hex ||
    hex.toLowerCase() === "#fff" ||
    hex.toLowerCase() === "#ffffff";

  useEffect(() => {
    if (isWhite || !imageUrl) {
      setTintedSrc(null);
      return;
    }

    if (fallback) return;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled) return;

      const w = img.naturalWidth;
      const h = img.naturalHeight;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");

      try {
        // 1. Draw original image
        ctx.drawImage(img, 0, 0);

        // 2. Multiply blend the selected color over the entire canvas
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = hex;
        ctx.fillRect(0, 0, w, h);

        // 3. Clip result to original image's alpha channel
        //    This keeps transparent areas transparent — only the
        //    T-shirt (opaque pixels) gets the color applied
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(img, 0, 0);

        if (!cancelled) setTintedSrc(canvas.toDataURL("image/png"));
      } catch {
        if (!cancelled) setFallback(true);
      }
    };

    img.onerror = () => {
      if (!cancelled) setFallback(true);
    };

    img.src = imageUrl;
    return () => { cancelled = true; };
  }, [hex, imageUrl, isWhite, fallback]);

  if (!imageUrl) return null;

  // No color / white → plain image
  if (isWhite || (!tintedSrc && !fallback)) {
    return <img src={imageUrl} alt={alt} className={imgClass} draggable={false} />;
  }

  // Canvas tint ready
  if (tintedSrc) {
    return <img src={tintedSrc} alt={alt} className={imgClass} draggable={false} />;
  }

  // CSS fallback (CORS blocked)
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ backgroundColor: hex }}
    >
      <img
        src={imageUrl}
        alt={alt}
        className={imgClass}
        draggable={false}
        style={{ mixBlendMode: "multiply" }}
      />
    </div>
  );
}
