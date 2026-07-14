import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Crop as CropIcon, RotateCcw, X } from "lucide-react";

interface ImageEditorProps {
  /** Object URL or data URL of the image to edit (must be same-origin / blob). */
  src: string;
  /** Original file name to preserve on the exported file. */
  fileName: string;
  /** Original mime type; output keeps it when it's a supported raster type. */
  fileType?: string;
  onCancel: () => void;
  onSave: (file: File, previewUrl: string) => void;
}

type Rect = { x: number; y: number; w: number; h: number };
type Corner = "nw" | "ne" | "sw" | "se";
type DragMode = "move" | Corner;

const STAGE_MAX_W = 680;
const STAGE_MAX_H = 470;
const MIN_CROP = 40;

// The output-resize presets are hidden for now but kept intact for future reuse.
// Flip this to `true` to expose the "Resize output" controls again.
const SHOW_RESIZE_OUTPUT = false;

/**
 * Mobile display requirements — derived from the app feed (clinic-topics-app
 * `src/screens/Main/Home/Home.tsx`).
 *
 * Topic images render in a fixed-aspect card and are cover-cropped to fill it
 * (no letterboxing): a topic with no description uses 4:5 (`image_full`), and one
 * with a description shows its image area in 4:3.7 (`image_text`). Because the app
 * cover-crops, the stored image must already match the card ratio — anything that
 * doesn't gets trimmed on screen.
 *
 * Every topic created here requires a description, so it always renders as
 * `image_text`. We therefore lock the crop to 4:3.7 (the image_text ratio): the
 * editor exports exactly 4:3.7, the card displays 4:3.7, so the app's cover-crop
 * trims nothing. Backend should store topic images at this ratio (4:3.7 → 1080×999)
 * so they stay sharp full-width.
 */
export const TARGET_ASPECT = 4 / 3.7;
export const TARGET_ASPECT_LABEL = "4:3.7";
export const MIN_OUTPUT_W = 40;
export const MIN_OUTPUT_H = 37;

const OUTPUT_SIZES: { key: string; label: string; max: number | null }[] = [
  { key: "original", label: "Original size", max: null },
  { key: "large", label: "Large · 1280px", max: 1280 },
  { key: "medium", label: "Medium · 800px", max: 800 },
  { key: "small", label: "Small · 480px", max: 480 },
];

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

// Keep the original raster type when it's web-safe, otherwise fall back to PNG.
const resolveOutputType = (fileType?: string): string => {
  if (fileType === "image/jpeg" || fileType === "image/webp" || fileType === "image/png") {
    return fileType;
  }
  return "image/png";
};

export default function ImageEditor({
  src,
  fileName,
  fileType,
  onCancel,
  onSave,
}: ImageEditorProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const stageWrapRef = useRef<HTMLDivElement>(null);

  // Natural (intrinsic) and on-screen display dimensions of the image.
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [display, setDisplay] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  // Width actually available to the crop stage (measured from its container).
  const [availW, setAvailW] = useState(STAGE_MAX_W);
  const prevDisplayRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const [crop, setCrop] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  // The crop aspect is locked to the app's topic-card ratio (4:3.7, image_text) so
  // the exported image already matches the card and the app's cover-crop trims
  // nothing.
  const aspect = TARGET_ASPECT;
  const [outputMax, setOutputMax] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Live during a pointer drag — closed over by the window listeners.
  const dragRef = useRef<{ mode: DragMode; startX: number; startY: number; startCrop: Rect } | null>(null);

  // Build a crop rectangle that fits inside the display area for the given aspect.
  const fitCrop = useCallback((dispW: number, dispH: number, ratio: number | null): Rect => {
    if (!ratio) {
      return { x: 0, y: 0, w: dispW, h: dispH };
    }
    let w = dispW;
    let h = w / ratio;
    if (h > dispH) {
      h = dispH;
      w = h * ratio;
    }
    return { x: (dispW - w) / 2, y: (dispH - h) / 2, w, h };
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    setNatural({ w: el.naturalWidth, h: el.naturalHeight });
  };

  // Track the width available to the stage so the displayed image (and therefore
  // the crop coordinate space) always fits exactly without being shrunk by CSS.
  useLayoutEffect(() => {
    const el = stageWrapRef.current;
    if (!el) return;
    const measure = () => setAvailW(el.clientWidth || STAGE_MAX_W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute the on-screen image size from the natural size and available width.
  // When it changes, initialise (or proportionally rescale) the crop selection.
  useLayoutEffect(() => {
    if (!natural) return;
    const maxW = Math.min(STAGE_MAX_W, availW);
    const scale = Math.min(maxW / natural.w, STAGE_MAX_H / natural.h, 1);
    const dispW = Math.round(natural.w * scale);
    const dispH = Math.round(natural.h * scale);
    const prev = prevDisplayRef.current;
    if (prev.w === dispW && prev.h === dispH) return;
    if (prev.w > 0 && prev.h > 0) {
      const rx = dispW / prev.w;
      const ry = dispH / prev.h;
      setCrop((c) => ({ x: c.x * rx, y: c.y * ry, w: c.w * rx, h: c.h * ry }));
    } else {
      setCrop(fitCrop(dispW, dispH, aspect));
    }
    prevDisplayRef.current = { w: dispW, h: dispH };
    setDisplay({ w: dispW, h: dispH });
  }, [natural, availW, aspect, fitCrop]);

  const resetCrop = () => {
    if (display.w && display.h) setCrop(fitCrop(display.w, display.h, aspect));
  };

  const onPointerMove = useCallback((e: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const { mode, startX, startY, startCrop } = drag;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const dispW = display.w;
    const dispH = display.h;

    if (mode === "move") {
      setCrop({
        ...startCrop,
        x: clamp(startCrop.x + dx, 0, dispW - startCrop.w),
        y: clamp(startCrop.y + dy, 0, dispH - startCrop.h),
      });
      return;
    }

    // Corner resize: the diagonally opposite corner stays anchored.
    const right = startCrop.x + startCrop.w;
    const bottom = startCrop.y + startCrop.h;
    let x = startCrop.x;
    let y = startCrop.y;
    let w = startCrop.w;
    let h = startCrop.h;

    if (mode === "se") {
      w = clamp(startCrop.w + dx, MIN_CROP, dispW - startCrop.x);
      h = clamp(startCrop.h + dy, MIN_CROP, dispH - startCrop.y);
    } else if (mode === "ne") {
      w = clamp(startCrop.w + dx, MIN_CROP, dispW - startCrop.x);
      y = clamp(startCrop.y + dy, 0, bottom - MIN_CROP);
      h = bottom - y;
    } else if (mode === "sw") {
      x = clamp(startCrop.x + dx, 0, right - MIN_CROP);
      w = right - x;
      h = clamp(startCrop.h + dy, MIN_CROP, dispH - startCrop.y);
    } else {
      // nw
      x = clamp(startCrop.x + dx, 0, right - MIN_CROP);
      w = right - x;
      y = clamp(startCrop.y + dy, 0, bottom - MIN_CROP);
      h = bottom - y;
    }

    // Enforce the locked aspect ratio off the new width, anchored to the moving corner.
    if (aspect) {
      h = w / aspect;
      if (h < MIN_CROP) {
        h = MIN_CROP;
        w = h * aspect;
      }
      // Keep within bounds vertically; shrink uniformly if it overflows.
      const top = mode === "ne" || mode === "nw";
      const maxH = top ? bottom : dispH - y;
      if (h > maxH) {
        h = maxH;
        w = h * aspect;
      }
      // Keep within bounds horizontally.
      const left = mode === "nw" || mode === "sw";
      const maxW = left ? right : dispW - x;
      if (w > maxW) {
        w = maxW;
        h = w / aspect;
      }
      if (top) y = bottom - h;
      if (left) x = right - w;
    }

    setCrop({ x, y, w, h });
  }, [aspect, display.w, display.h]);

  // Stable window listeners (so add/remove pair up), backed by refs that always
  // point at the latest handler implementations — captures current aspect/size.
  const moveRef = useRef<(e: PointerEvent) => void>(() => {});
  const upRef = useRef<() => void>(() => {});

  const handleWindowMove = useCallback((e: PointerEvent) => moveRef.current(e), []);
  const handleWindowUp = useCallback(() => upRef.current(), []);

  const endDrag = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("pointermove", handleWindowMove);
    window.removeEventListener("pointerup", handleWindowUp);
  }, [handleWindowMove, handleWindowUp]);

  useLayoutEffect(() => {
    moveRef.current = onPointerMove;
  }, [onPointerMove]);

  useLayoutEffect(() => {
    upRef.current = endDrag;
  }, [endDrag]);

  const startDrag = (mode: DragMode) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, startCrop: crop };
    window.addEventListener("pointermove", handleWindowMove);
    window.addEventListener("pointerup", handleWindowUp);
  };

  // Clean up listeners if the editor unmounts mid-drag.
  useEffect(() => endDrag, [endDrag]);

  // Map a display-space crop to natural-pixel source coordinates.
  const getSourceRect = useCallback((): Rect | null => {
    if (!natural || !display.w || !display.h) return null;
    const sx = natural.w / display.w;
    const sy = natural.h / display.h;
    return {
      x: crop.x * sx,
      y: crop.y * sy,
      w: crop.w * sx,
      h: crop.h * sy,
    };
  }, [crop, natural, display.w, display.h]);

  // Final output dimensions after applying the chosen max-size cap.
  const getOutputSize = useCallback((source: Rect): { w: number; h: number } => {
    let w = Math.round(source.w);
    let h = Math.round(source.h);
    if (outputMax && (w > outputMax || h > outputMax)) {
      const scale = outputMax / Math.max(w, h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    // Safety net: never export below the mobile app's minimum. Scale up uniformly
    // (the locked aspect is preserved) only when the cropped area is genuinely too
    // small — normally the upload check + crop floor keep us above this already.
    if (w < MIN_OUTPUT_W || h < MIN_OUTPUT_H) {
      const scale = Math.max(MIN_OUTPUT_W / w, MIN_OUTPUT_H / h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    return { w: Math.max(1, w), h: Math.max(1, h) };
  }, [outputMax]);

  // Keep the live preview canvas in sync with the current crop/output settings.
  useLayoutEffect(() => {
    const canvas = previewCanvasRef.current;
    const img = imgRef.current;
    const source = getSourceRect();
    if (!canvas || !img || !source) return;
    const out = getOutputSize(source);
    canvas.width = out.w;
    canvas.height = out.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, out.w, out.h);
    ctx.drawImage(img, source.x, source.y, source.w, source.h, 0, 0, out.w, out.h);
  }, [getSourceRect, getOutputSize]);

  const handleSave = () => {
    const img = imgRef.current;
    const source = getSourceRect();
    if (!img || !source) return;
    setIsExporting(true);
    const out = getOutputSize(source);
    const canvas = document.createElement("canvas");
    canvas.width = out.w;
    canvas.height = out.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsExporting(false);
      return;
    }
    ctx.drawImage(img, source.x, source.y, source.w, source.h, 0, 0, out.w, out.h);
    const outputType = resolveOutputType(fileType);
    const quality = outputType === "image/png" ? undefined : 0.92;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsExporting(false);
          return;
        }
        const file = new File([blob], fileName, { type: blob.type || outputType });
        const previewUrl = URL.createObjectURL(blob);
        setIsExporting(false);
        onSave(file, previewUrl);
      },
      outputType,
      quality
    );
  };

  const source = getSourceRect();
  const outSize = source ? getOutputSize(source) : null;
  // Raw cropped resolution (before the upscale safety net). When it is under the
  // mobile minimum we warn the admin that the export will be upscaled and may look
  // soft, so they can pick a larger crop or a higher-resolution source.
  const rawCropW = source ? Math.round(source.w) : 0;
  const rawCropH = source ? Math.round(source.h) : 0;
  const belowMin = !!source && (rawCropW < MIN_OUTPUT_W || rawCropH < MIN_OUTPUT_H);

  const handleStyle: React.CSSProperties = {
    position: "absolute",
    width: 14,
    height: 14,
    background: "#ffffff",
    border: "2px solid #6b96ff",
    borderRadius: 4,
    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onCancel} />

      <div
        className="relative bg-white rounded-[18px] w-full max-w-4xl max-h-[92vh] flex flex-col z-10"
        style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.10)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <CropIcon className="w-5 h-5" style={{ color: "#6b96ff" }} />
            <h2 className="text-lg font-semibold text-gray-900">Edit Image</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
            style={{
              background: "#f8f9fb",
              boxShadow: "2px 2px 4px rgba(0,0,0,0.06), -2px -2px 4px rgba(255,255,255,0.6)",
            }}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Crop stage */}
            <div ref={stageWrapRef} className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Drag inside the box to reposition, or drag a corner to resize the crop area.
              </p>
              <div
                className="relative mx-auto select-none"
                style={{
                  width: display.w || STAGE_MAX_W,
                  height: display.h || STAGE_MAX_H,
                  maxWidth: "100%",
                  background: "#eef1f5",
                  borderRadius: 12,
                  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.5)",
                }}
              >
                <img
                  ref={imgRef}
                  src={src}
                  alt="Editing"
                  onLoad={handleImageLoad}
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  style={{ borderRadius: 12 }}
                />

                {natural && crop.w > 0 && (
                  <>
                    {/* Dim everything outside the crop with a clip-path overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "rgba(17,24,39,0.45)",
                        borderRadius: 12,
                        clipPath: `polygon(
                          0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                          ${crop.x}px ${crop.y}px,
                          ${crop.x}px ${crop.y + crop.h}px,
                          ${crop.x + crop.w}px ${crop.y + crop.h}px,
                          ${crop.x + crop.w}px ${crop.y}px,
                          ${crop.x}px ${crop.y}px
                        )`,
                      }}
                    />

                    {/* Crop selection */}
                    <div
                      onPointerDown={startDrag("move")}
                      className="absolute cursor-move"
                      style={{
                        left: crop.x,
                        top: crop.y,
                        width: crop.w,
                        height: crop.h,
                        border: "1.5px solid #6b96ff",
                        boxShadow: "0 0 0 1px rgba(107,150,255,0.4)",
                      }}
                    >
                      {/* Rule-of-thirds guides */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div style={{ position: "absolute", left: "33.33%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.4)" }} />
                        <div style={{ position: "absolute", left: "66.66%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.4)" }} />
                        <div style={{ position: "absolute", top: "33.33%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.4)" }} />
                        <div style={{ position: "absolute", top: "66.66%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.4)" }} />
                      </div>

                      {/* Corner handles */}
                      <div onPointerDown={startDrag("nw")} style={{ ...handleStyle, left: -7, top: -7, cursor: "nwse-resize" }} />
                      <div onPointerDown={startDrag("ne")} style={{ ...handleStyle, right: -7, top: -7, cursor: "nesw-resize" }} />
                      <div onPointerDown={startDrag("sw")} style={{ ...handleStyle, left: -7, bottom: -7, cursor: "nesw-resize" }} />
                      <div onPointerDown={startDrag("se")} style={{ ...handleStyle, right: -7, bottom: -7, cursor: "nwse-resize" }} />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Controls + preview */}
            <div className="lg:w-60 shrink-0 space-y-5">
              {/* Aspect ratio — locked to the app's topic-card (image_text) ratio */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Aspect ratio</p>
                <div
                  className="px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(107,150,255,0.10)",
                    boxShadow: "inset 1px 1px 3px rgba(107,150,255,0.15), inset -1px -1px 3px rgba(255,255,255,0.5)",
                  }}
                >
                  <p className="text-xs font-semibold" style={{ color: "#1f2937" }}>
                    {TARGET_ASPECT_LABEL} · Landscape
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Locked to match the app's topic card.
                  </p>
                </div>
              </div>

              {/* Output size (resize) — hidden by default, kept for future reuse */}
              {SHOW_RESIZE_OUTPUT && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Resize output</p>
                <div className="space-y-1.5">
                  {OUTPUT_SIZES.map((o) => {
                    const active = outputMax === o.max;
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setOutputMax(o.max)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all"
                        style={{
                          color: active ? "#1f2937" : "#6b7280",
                          background: active ? "rgba(107,150,255,0.12)" : "#eff1f5",
                          boxShadow: active
                            ? "inset 0 0 0 1px #6b96ff"
                            : "inset 1px 1px 3px rgba(0,0,0,0.05), inset -1px -1px 3px rgba(255,255,255,0.5)",
                        }}
                      >
                        <span>{o.label}</span>
                        {active && <Check className="w-3.5 h-3.5" style={{ color: "#6b96ff" }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Live preview */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Preview</p>
                <div
                  className="rounded-xl p-3 flex items-center justify-center"
                  style={{
                    background: "#eff1f5",
                    boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.5)",
                    minHeight: 96,
                  }}
                >
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full rounded-lg"
                    style={{ maxHeight: 140, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}
                  />
                </div>
                {outSize && (
                  <p className="text-[11px] text-gray-500 mt-1.5 text-center">
                    Output: {outSize.w} × {outSize.h}px
                  </p>
                )}
                {belowMin && (
                  <p
                    className="text-[11px] mt-1 text-center"
                    style={{ color: "#b45309" }}
                  >
                    Crop is below {MIN_OUTPUT_W}×{MIN_OUTPUT_H}px — it will be
                    upscaled and may look soft. Select a larger area or use a
                    higher-resolution image for best quality.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={resetCrop}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all"
                style={{
                  color: "#6b7280",
                  background: "#eff1f5",
                  boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.06), inset -1px -1px 3px rgba(255,255,255,0.5)",
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset crop
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 shrink-0"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isExporting}
            className="clay-btn disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: "13px", padding: "6px 16px" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isExporting || !natural}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#1f2937", boxShadow: "4px 4px 8px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.04)" }}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Applying…</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
