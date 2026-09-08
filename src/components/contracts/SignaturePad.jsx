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
 * Provides a responsive, high-DPI digital signature drawing canvas
 * with full mouse, touch, and pointer event support.
 * Prevents mobile touch scrolling while actively drawing.
 */
const SignaturePad = forwardRef(
  (
    {
      height = 200,
      strokeColor = "#14181C",
      strokeWidth = 2.5,
      backgroundColor = "#FFFFFF",
      onEnd,
      onClear,
      disabled = false,
      placeholderText = "Sign above this line",
    },
    ref
  ) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const pointsRef = useRef([]); // Points for current stroke
    const strokesRef = useRef([]); // History of all strokes for resize redraws
    const [hasDrawn, setHasDrawn] = useState(false);

    /**
     * Get bounding rect and scale factor
     */
    const getCanvasContext = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.getContext("2d");
    }, []);

    /**
     * Redraw all recorded strokes onto the canvas
     */
    const redrawAllStrokes = useCallback(
      (ctx, width, height) => {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // Draw guideline placeholder text if canvas is empty
        if (!hasDrawn && strokesRef.current.length === 0 && placeholderText) {
          ctx.save();
          ctx.font = "500 13px 'Inter', sans-serif";
          ctx.fillStyle = "#A0AEC0";
          ctx.textAlign = "center";
          ctx.fillText(placeholderText, width / 2, height / 2);
          ctx.restore();
        }

        // Draw each stroke
        strokesRef.current.forEach((stroke) => {
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
              // Midpoint quadratic curve for smoothness
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
      },
      [backgroundColor, strokeColor, strokeWidth, hasDrawn, placeholderText]
    );

    /**
     * Resize canvas properly handling Device Pixel Ratio
     */
    const resizeCanvas = useCallback(() => {
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

      redrawAllStrokes(ctx, cssWidth, cssHeight);
    }, [height, redrawAllStrokes]);

    // Initial setup and resize observer
    useEffect(() => {
      resizeCanvas();

      const container = containerRef.current;
      if (!container) return;

      let resizeTimer;
      const observer = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          resizeCanvas();
        }, 50);
      });
      observer.observe(container);

      return () => {
        observer.disconnect();
        clearTimeout(resizeTimer);
      };
    }, [resizeCanvas]);

    /**
     * Get canvas relative coordinates from pointer/touch/mouse event
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

    /**
     * Start drawing
     */
    const startDrawing = (e) => {
      if (disabled) return;
      if (e.cancelable && e.type.startsWith("touch")) {
        e.preventDefault();
      }

      isDrawingRef.current = true;
      const pos = getEventPos(e);
      pointsRef.current = [pos];

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ctx = getCanvasContext();
      if (!ctx) return;

      // Draw initial dot
      if (!hasDrawn) {
        setHasDrawn(true);
      }

      // Add to strokes
      strokesRef.current.push([...pointsRef.current]);
      redrawAllStrokes(ctx, rect.width, height);
    };

    /**
     * Continue drawing
     */
    const draw = (e) => {
      if (!isDrawingRef.current || disabled) return;
      if (e.cancelable) {
        e.preventDefault();
      }

      const pos = getEventPos(e);
      pointsRef.current.push(pos);

      // Update current active stroke in strokes array
      if (strokesRef.current.length > 0) {
        strokesRef.current[strokesRef.current.length - 1] = [...pointsRef.current];
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ctx = getCanvasContext();
      if (!ctx) return;

      redrawAllStrokes(ctx, rect.width, height);
    };

    /**
     * Stop drawing and export data
     */
    const stopDrawing = (e) => {
      if (!isDrawingRef.current) return;
      if (e && e.cancelable && e.type && e.type.startsWith("touch")) {
        e.preventDefault();
      }

      isDrawingRef.current = false;
      pointsRef.current = [];

      const isEmptySignature = strokesRef.current.length === 0;
      setHasDrawn(!isEmptySignature);

      if (onEnd) {
        const dataUrl = isEmptySignature ? "" : exportDataURL();
        onEnd({
          isEmpty: isEmptySignature,
          dataUrl,
        });
      }
    };

    /**
     * Clear all strokes
     */
    const clear = useCallback(() => {
      strokesRef.current = [];
      pointsRef.current = [];
      isDrawingRef.current = false;
      setHasDrawn(false);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ctx = getCanvasContext();
      if (ctx) {
        redrawAllStrokes(ctx, rect.width, height);
      }

      if (onClear) {
        onClear();
      }
      if (onEnd) {
        onEnd({ isEmpty: true, dataUrl: "" });
      }
    }, [getCanvasContext, height, onClear, onEnd, redrawAllStrokes]);

    /**
     * Export canvas as PNG Base64 string
     */
    const exportDataURL = useCallback(() => {
      if (strokesRef.current.length === 0) return "";
      const canvas = canvasRef.current;
      if (!canvas) return "";

      // Create a clean export canvas with pure white background and trimmed strokes
      const exportCanvas = document.createElement("canvas");
      const rect = canvas.getBoundingClientRect();
      const width = Math.floor(rect.width) || 400;
      const exportHeight = height;

      exportCanvas.width = width * 2; // 2x scale for crisp export
      exportCanvas.height = exportHeight * 2;
      const expCtx = exportCanvas.getContext("2d");
      expCtx.scale(2, 2);

      // White background
      expCtx.fillStyle = "#FFFFFF";
      expCtx.fillRect(0, 0, width, exportHeight);

      // Render only strokes (no guidelines)
      strokesRef.current.forEach((stroke) => {
        if (!stroke || stroke.length === 0) return;
        expCtx.save();
        expCtx.strokeStyle = strokeColor;
        expCtx.lineWidth = strokeWidth;
        expCtx.lineCap = "round";
        expCtx.lineJoin = "round";

        if (stroke.length === 1) {
          expCtx.beginPath();
          expCtx.arc(stroke[0].x, stroke[0].y, strokeWidth / 2, 0, Math.PI * 2);
          expCtx.fillStyle = strokeColor;
          expCtx.fill();
        } else {
          expCtx.beginPath();
          expCtx.moveTo(stroke[0].x, stroke[0].y);
          for (let i = 1; i < stroke.length; i++) {
            const prev = stroke[i - 1];
            const curr = stroke[i];
            const midX = (prev.x + curr.x) / 2;
            const midY = (prev.y + curr.y) / 2;
            expCtx.quadraticCurveTo(prev.x, prev.y, midX, midY);
          }
          const last = stroke[stroke.length - 1];
          expCtx.lineTo(last.x, last.y);
          expCtx.stroke();
        }
        expCtx.restore();
      });

      return exportCanvas.toDataURL("image/png");
    }, [height, strokeColor, strokeWidth]);

    const isEmpty = useCallback(() => {
      return strokesRef.current.length === 0;
    }, []);

    // Expose methods to parent via ref
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
          touchAction: "none",
        }}
      >
        <div
          className="stf-sig-pad-wrapper"
          style={{
            position: "relative",
            width: "100%",
            height: `${height}px`,
            border: "1.5px solid var(--nh-border, #E4E9E4)",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
            cursor: disabled ? "not-allowed" : "crosshair",
            opacity: disabled ? 0.7 : 1,
          }}
        >
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
              touchAction: "none",
            }}
          />

          {/* Reset / Clear Button */}
          {hasDrawn && !disabled && (
            <button
              type="button"
              onClick={clear}
              className="stf-sig-clear-btn"
              title="Clear signature"
              aria-label="Clear signature"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "#F5F8F5",
                color: "#5B6660",
                border: "1px solid #E4E9E4",
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
                e.currentTarget.style.backgroundColor = "#F5F8F5";
                e.currentTarget.style.color = "#5B6660";
                e.currentTarget.style.borderColor = "#E4E9E4";
              }}
            >
              <i className="fa-solid fa-rotate-right" style={{ fontSize: "11px" }} />
              Clear
            </button>
          )}
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";

SignaturePad.propTypes = {
  height: PropTypes.number,
  strokeColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  backgroundColor: PropTypes.string,
  onEnd: PropTypes.func,
  onClear: PropTypes.func,
  disabled: PropTypes.bool,
  placeholderText: PropTypes.string,
};

export default SignaturePad;
