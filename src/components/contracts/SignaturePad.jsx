import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from "react";
import PropTypes from "prop-types";

/**
 * SignaturePad Component
 *
 * Supports both manual signature drawing (mouse, touch, stylus)
 * and name-based automatic signature generation.
 * High-DPI responsive canvas with clean 2x export.
 */
const SignaturePad = forwardRef(
  (
    {
      mode = "draw", // "draw" | "auto"
      name = "",
      height = 200,
      strokeColor = "#14181C",
      strokeWidth = 2.5,
      backgroundColor = "#FFFFFF",
      onChange,
      onEnd,
      disabled = false,
      placeholderText = "Draw your signature here",
    },
    ref
  ) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const pointsRef = useRef([]);
    const strokesRef = useRef([]);
    const manualClearedRef = useRef(false);
    const [hasContent, setHasContent] = useState(false);

    // Reset manualCleared whenever name changes or mode changes
    useEffect(() => {
      manualClearedRef.current = false;
    }, [name, mode]);

    /**
     * Render all content (auto signature text or drawing strokes) onto a 2D canvas context
     */
    const renderContent = useCallback(
      (ctx, width, canvasHeight, isExport = false) => {
        if (!ctx) return;

        // Solid clean background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, canvasHeight);

        const autoText =
          mode === "auto" && !manualClearedRef.current ? (name || "").trim() : "";
        const strokes = mode === "draw" ? strokesRef.current : [];
        const isEmpty = !autoText && strokes.length === 0;

        // 1. Clean placeholder text if no content exists (NO cross, NO dotted line)
        if (isEmpty) {
          if (!isExport && placeholderText) {
            ctx.save();
            ctx.font = "500 14px 'Inter', sans-serif";
            ctx.fillStyle = "#94A3B8";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(placeholderText, width / 2, canvasHeight / 2);
            ctx.restore();
          }
          return;
        }

        // 2. Render Auto-Generated Cursive Signature
        if (autoText) {
          ctx.save();

          // Dynamic font size calculation based on text length
          let targetFontSize = 48;
          ctx.font = `600 ${targetFontSize}px 'Dancing Script', 'Great Vibes', 'Caveat', 'Brush Script MT', 'Segoe Script', cursive`;
          let measuredWidth = ctx.measureText(autoText).width;
          const maxAllowedWidth = width * 0.82;

          if (measuredWidth > maxAllowedWidth && measuredWidth > 0) {
            const scaledSize = Math.floor(targetFontSize * (maxAllowedWidth / measuredWidth));
            targetFontSize = Math.max(24, scaledSize);
            ctx.font = `600 ${targetFontSize}px 'Dancing Script', 'Great Vibes', 'Caveat', 'Brush Script MT', 'Segoe Script', cursive`;
          }

          ctx.fillStyle = strokeColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(autoText, width / 2, canvasHeight / 2);

          ctx.restore();
        }

        // 3. Render Manual Drawn Strokes
        if (strokes.length > 0) {
          strokes.forEach((stroke) => {
            if (!stroke || stroke.length === 0) return;
            ctx.save();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            if (stroke.length === 1) {
              ctx.beginPath();
              ctx.arc(stroke[0].x, stroke[0].y, strokeWidth / 2, 0, Math.PI * 2);
              ctx.fillStyle = strokeColor;
              ctx.fill();
            } else {
              ctx.beginPath();
              ctx.moveTo(stroke[0].x, stroke[0].y);
              for (let i = 1; i < stroke.length; i++) {
                const prev = stroke[i - 1];
                const curr = stroke[i];
                const midX = (prev.x + curr.x) / 2;
                const midY = (prev.y + curr.y) / 2;
                ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
              }
              const last = stroke[stroke.length - 1];
              ctx.lineTo(last.x, last.y);
              ctx.stroke();
            }
            ctx.restore();
          });
        }
      },
      [backgroundColor, mode, name, placeholderText, strokeColor, strokeWidth]
    );

    /**
     * Export canvas as 2x crisp PNG Base64 Data URL
     */
    const exportDataURL = useCallback(() => {
      const autoText =
        mode === "auto" && !manualClearedRef.current ? (name || "").trim() : "";
      const strokes = mode === "draw" ? strokesRef.current : [];
      if (!autoText && strokes.length === 0) return "";

      const canvas = canvasRef.current;
      if (!canvas) return "";

      const rect = canvas.getBoundingClientRect();
      const cssWidth = Math.floor(rect.width) || 400;
      const cssHeight = height;

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = cssWidth * 2;
      exportCanvas.height = cssHeight * 2;

      const expCtx = exportCanvas.getContext("2d");
      expCtx.scale(2, 2);

      renderContent(expCtx, cssWidth, cssHeight, true);
      return exportCanvas.toDataURL("image/png");
    }, [height, mode, name, renderContent]);

    /**
     * Redraw the visible screen canvas
     */
    const redrawVisibleCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const cssWidth = Math.floor(rect.width) || 300;
      const cssHeight = height;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);

      renderContent(ctx, cssWidth, cssHeight, false);

      const autoText =
        mode === "auto" && !manualClearedRef.current ? (name || "").trim() : "";
      const hasValidContent = Boolean(autoText || (mode === "draw" && strokesRef.current.length > 0));
      setHasContent(hasValidContent);

      const dataUrl = hasValidContent ? exportDataURL() : "";
      if (onChange) {
        onChange({ isEmpty: !hasValidContent, dataUrl });
      }
      if (onEnd) {
        onEnd({ isEmpty: !hasValidContent, dataUrl });
      }
    }, [exportDataURL, height, mode, name, onChange, onEnd, renderContent]);

    // Redraw on prop updates
    useEffect(() => {
      redrawVisibleCanvas();
    }, [mode, name, redrawVisibleCanvas]);

    // Redraw once Google Web Fonts are ready
    useEffect(() => {
      if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          redrawVisibleCanvas();
        });
      }
    }, [redrawVisibleCanvas]);

    // Resize observer
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let resizeTimer;
      const observer = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          redrawVisibleCanvas();
        }, 50);
      });
      observer.observe(container);

      return () => {
        observer.disconnect();
        clearTimeout(resizeTimer);
      };
    }, [redrawVisibleCanvas]);

    /**
     * Manual Drawing Event Handlers
     */
    const getEventPos = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();

      let clientX, clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      if (disabled || mode === "auto") return;
      if (e.cancelable && e.type.startsWith("touch")) {
        e.preventDefault();
      }

      isDrawingRef.current = true;
      const pos = getEventPos(e);
      pointsRef.current = [pos];
      strokesRef.current.push([...pointsRef.current]);

      redrawVisibleCanvas();
    };

    const draw = (e) => {
      if (!isDrawingRef.current || disabled || mode === "auto") return;
      if (e.cancelable) {
        e.preventDefault();
      }

      const pos = getEventPos(e);
      pointsRef.current.push(pos);

      if (strokesRef.current.length > 0) {
        strokesRef.current[strokesRef.current.length - 1] = [...pointsRef.current];
      }

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const cssWidth = Math.floor(rect.width) || 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        renderContent(ctx, cssWidth, height, false);
      }
    };

    const stopDrawing = (e) => {
      if (!isDrawingRef.current) return;
      if (e && e.cancelable && e.type && e.type.startsWith("touch")) {
        e.preventDefault();
      }

      isDrawingRef.current = false;
      pointsRef.current = [];

      redrawVisibleCanvas();
    };

    /**
     * Clear signature pad - safe and non-recursive
     */
    const clear = useCallback(() => {
      strokesRef.current = [];
      pointsRef.current = [];
      isDrawingRef.current = false;
      manualClearedRef.current = true;
      setHasContent(false);

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const rect = container.getBoundingClientRect();
        const cssWidth = Math.floor(rect.width) || 300;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, cssWidth, height);

          if (placeholderText) {
            ctx.save();
            ctx.font = "500 14px 'Inter', sans-serif";
            ctx.fillStyle = "#94A3B8";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(placeholderText, cssWidth / 2, height / 2);
            ctx.restore();
          }
        }
      }

      if (onChange) {
        onChange({ isEmpty: true, dataUrl: "" });
      }
      if (onEnd) {
        onEnd({ isEmpty: true, dataUrl: "" });
      }
    }, [backgroundColor, height, onChange, onEnd, placeholderText]);

    const isEmpty = useCallback(() => {
      const autoText =
        mode === "auto" && !manualClearedRef.current ? (name || "").trim() : "";
      return !autoText && strokesRef.current.length === 0;
    }, [mode, name]);

    // Expose methods to parent ref
    useImperativeHandle(ref, () => ({
      clear,
      isEmpty,
      toDataURL: exportDataURL,
    }));

    return (
      <div
        ref={containerRef}
        className="stf-sig-pad-container"
        style={{
          width: "100%",
          position: "relative",
          userSelect: "none",
          touchAction: mode === "draw" ? "none" : "auto",
        }}
      >
        <div
          className="stf-sig-pad-wrapper"
          style={{
            position: "relative",
            width: "100%",
            height: `${height}px`,
            border: hasContent
              ? "1.5px solid var(--nh-green, #0A7C6E)"
              : "1.5px solid var(--nh-border, #E4E9E4)",
            borderRadius: "10px",
            backgroundColor: backgroundColor,
            overflow: "hidden",
            boxShadow: hasContent
              ? "0 2px 8px rgba(10, 124, 110, 0.08)"
              : "inset 0 1px 3px rgba(0,0,0,0.03)",
            cursor: disabled
              ? "not-allowed"
              : mode === "draw"
              ? "crosshair"
              : "default",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            opacity: disabled ? 0.7 : 1,
          }}
        >
          {/* Clear Button in Top Right of Pad (Shown when signature content exists) */}
          {hasContent && !disabled && (
            <button
              type="button"
              onClick={clear}
              className="stf-sig-clear-btn"
              title="Clear signature"
              aria-label="Clear signature"
              style={{
                position: "absolute",
                top: "10px",
                right: "12px",
                backgroundColor: "#F8FAFC",
                color: "#5B6660",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FEE2E2";
                e.currentTarget.style.color = "#DC2626";
                e.currentTarget.style.borderColor = "#FCA5A5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F8FAFC";
                e.currentTarget.style.color = "#5B6660";
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
            >
              <i className="fa-solid fa-rotate-right" style={{ fontSize: "11px" }} />
              Clear
            </button>
          )}

          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              touchAction: mode === "draw" ? "none" : "auto",
            }}
          />
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";

SignaturePad.propTypes = {
  mode: PropTypes.oneOf(["draw", "auto"]),
  name: PropTypes.string,
  height: PropTypes.number,
  strokeColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  backgroundColor: PropTypes.string,
  onChange: PropTypes.func,
  onEnd: PropTypes.func,
  disabled: PropTypes.bool,
  placeholderText: PropTypes.string,
};

export default SignaturePad;
