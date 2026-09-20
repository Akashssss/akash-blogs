import { createReactBlockSpec } from "@blocknote/react";
import { useState, useRef, useCallback } from "react";
import '@excalidraw/excalidraw/index.css';
import { Frame, Edit2, Loader2, AlignLeft, AlignCenter, AlignRight, Trash2, X, Maximize2 } from "lucide-react";
import { toast } from "react-hot-toast";

// ── Excalidraw Modal (lazy-loaded) ────────────────────────────
function ExcalidrawModal({ isOpen, onClose, onSave, initialData }) {
  const [Excalidraw, setExcalidraw] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const excalidrawApiRef = useRef(null);

  // Lazy-load Excalidraw on first open
  useState(() => {
    if (isOpen && !Excalidraw) {
      import("@excalidraw/excalidraw").then((mod) => {
        setExcalidraw(() => mod.Excalidraw);
      }).catch(() => {
        toast.error("Failed to load Excalidraw editor");
        onClose();
      });
    }
  });

  const handleSave = async () => {
    if (!excalidrawApiRef.current) return;
    setIsSaving(true);
    try {
      const elements = excalidrawApiRef.current.getSceneElements();
      const appState = excalidrawApiRef.current.getAppState();
      const files = excalidrawApiRef.current.getFiles();

      const { exportToSvg } = await import("@excalidraw/excalidraw");
      const svg = await exportToSvg({
        elements,
        appState: { ...appState, exportBackground: true },
        files,
      });

      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.style.maxWidth = "100%";
      svg.style.maxHeight = "460px";
      svg.style.width = "auto";
      svg.style.height = "auto";

      await onSave(elements, appState, files, svg.outerHTML);
      onClose();
    } catch (err) {
      toast.error("Failed to save diagram: " + (err?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-background" style={{ contain: "layout" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <Frame className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Excalidraw Editor</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">Draw, annotate, diagram</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !Excalidraw}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {Excalidraw ? (
          <Excalidraw
            excalidrawAPI={(api) => { excalidrawApiRef.current = api; }}
            initialData={initialData}
            UIOptions={{
              canvasActions: { export: false, loadScene: true, saveToActiveFile: false },
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading Excalidraw editor...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Diagram (Excalidraw) Block Spec ──────────────────────────
export const ExcalidrawBlock = createReactBlockSpec(
  {
    type: "diagram",
    propSchema: {
      data: { default: "{}" },
      svg: { default: "" },
      textAlignment: { default: "center", values: ["left", "center", "right"] },
      width: { default: "100%" },
      title: { default: "" },
      description: { default: "" },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isEditing, setIsEditing] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isSaving, setIsSaving] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [dragWidth, setDragWidth] = useState(null);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const containerRef = useRef(null);

      const isEditable = editor.isEditable;
      const dataStr = block.props.data;
      const rawSvg = block.props.svg;
      const svgHTML = typeof rawSvg === "string" ? rawSvg.replace(/height\s*=\s*['"]auto['"]/gi, "") : rawSvg;

      let initialData = { elements: [], appState: {}, files: {} };
      try {
        if (dataStr && dataStr !== "{}") {
          const parsed = JSON.parse(dataStr);
          initialData = {
            elements: parsed.elements || [],
            appState: { viewBackgroundColor: parsed.appState?.viewBackgroundColor || "#ffffff" },
            files: parsed.files || {},
          };
        }
      } catch { }

      const handleSave = useCallback(async (elements, appState, files, svgString) => {
        setIsSaving(true);
        try {
          const serializableAppState = { viewBackgroundColor: appState.viewBackgroundColor || "#ffffff" };
          const newData = JSON.stringify({ elements, appState: serializableAppState, files });
          editor.updateBlock(block, { props: { ...block.props, data: newData, svg: svgString } });
          toast.success("Diagram saved!");
        } finally {
          setIsSaving(false);
        }
      }, [block, editor]);

      const alignment = block.props.textAlignment;
      const currentWidth = dragWidth !== null ? `${dragWidth}%` : block.props.width;
      const alignClass = alignment === "left" ? "justify-start" : alignment === "right" ? "justify-end" : "justify-center";

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const handlePointerDown = useCallback((e) => {
        e.preventDefault(); e.stopPropagation();
        const parent = containerRef.current?.parentElement;
        if (!parent) return;
        const parentRect = parent.getBoundingClientRect();
        const calcPct = (clientX) => {
          let pct = 100;
          if (alignment === "center") { const dist = Math.abs(clientX - (parentRect.left + parentRect.width / 2)); pct = (dist * 2 / parentRect.width) * 100; }
          else if (alignment === "right") { pct = ((parentRect.right - clientX) / parentRect.width) * 100; }
          else { pct = ((clientX - parentRect.left) / parentRect.width) * 100; }
          return Math.max(10, Math.min(100, pct));
        };
        const onMove = (mv) => setDragWidth(calcPct(mv.clientX));
        const onUp = (up) => {
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onUp);
          editor.updateBlock(block, { props: { ...block.props, width: `${calcPct(up.clientX)}%` } });
          setDragWidth(null);
        };
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
      }, [alignment, block, editor]);

      return (
        <div
          className="diagram-block-container diagram-block-wrapper group relative w-full flex flex-col items-center my-2"
          contentEditable={false}
          onDoubleClick={() => isEditable && !isEditing && !isSaving && setIsEditing(true)}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
            .diagram-block-container { max-width: 100% !important; }
            .diagram-block-preview {
              max-height: 460px !important;
              max-width: 100% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              overflow: hidden !important;
            }
            .diagram-block-preview svg,
            .diagram-block-container svg {
              max-width: 100% !important;
              max-height: 450px !important;
              width: auto !important;
              height: auto !important;
              object-fit: contain !important;
              margin: 0 auto !important;
            }
            .ProseMirror-selectednode:has(.diagram-block-wrapper) { outline: none !important; box-shadow: none !important; }
            @media print {
              .diagram-block-container { width: 100% !important; max-width: 100% !important; page-break-inside: avoid !important; break-inside: avoid !important; overflow: visible !important; margin: 1.5rem 0 !important; }
              .diagram-block-preview { max-height: none !important; overflow: visible !important; }
              .diagram-block-preview svg,
              .diagram-block-container svg { max-width: 100% !important; width: auto !important; height: auto !important; max-height: none !important; }
            }
          `}} />

          <div className={`w-full flex ${alignClass} relative print:!justify-center`}>
            {/* Floating toolbar */}
            {isEditable && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all z-20 flex items-center gap-1 bg-background/95 border border-border shadow-md rounded-xl p-1.5 backdrop-blur-sm print:hidden">
                {[
                  { v: "left", Icon: AlignLeft, label: "Left" },
                  { v: "center", Icon: AlignCenter, label: "Center" },
                  { v: "right", Icon: AlignRight, label: "Right" },
                ].map(({ v, Icon, label }) => (
                  <button
                    key={v}
                    onClick={(e) => { e.stopPropagation(); editor.updateBlock(block, { props: { ...block.props, textAlignment: v } }); }}
                    className={`p-1.5 rounded-lg hover:bg-muted transition-colors ${alignment === v ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
                    title={`Align ${label}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
                <div className="w-px h-4 bg-border mx-0.5" />
                <button
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-lg hover:bg-muted transition-colors disabled:opacity-50 text-foreground"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit2 className="w-3.5 h-3.5" />}
                  {isSaving ? "Saving..." : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); editor.removeBlocks([block]); }}
                  className="p-1.5 rounded-lg hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Preview */}
            <div
              ref={containerRef}
              className="min-h-[100px] flex items-center justify-center relative transition-none print:!w-full rounded-xl overflow-hidden"
              style={{ width: currentWidth }}
            >
              {svgHTML ? (
                <div className="diagram-block-preview w-full flex items-center justify-center pointer-events-none" dangerouslySetInnerHTML={{ __html: svgHTML }} />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground/60 border-2 border-dashed border-border/60 rounded-xl w-full h-full py-14 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer">
                  <Frame className="w-8 h-8 mb-3 opacity-40" />
                  <span className="text-sm font-semibold">Click to open Excalidraw</span>
                  <span className="text-xs mt-1 opacity-60">Draw, annotate, wireframe</span>
                  {isEditable && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                      className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Open Editor
                    </button>
                  )}
                </div>
              )}

              {/* Resize handle */}
              {isEditable && (
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-2 h-10 bg-border hover:bg-primary rounded-full cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-sm print:hidden ${alignment === "right" ? "-left-1" : "-right-1"}`}
                  onPointerDown={handlePointerDown}
                  title="Drag to resize"
                />
              )}
              {isEditable && alignment === "center" && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-10 bg-border hover:bg-primary rounded-full cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-sm -left-1 print:hidden"
                  onPointerDown={handlePointerDown}
                  title="Drag to resize"
                />
              )}
            </div>
          </div>

          {/* Caption */}
          <div className="flex flex-col mt-3 gap-1 px-4 w-full max-w-lg mx-auto print:hidden">
            {isEditable && (
              <input
                type="text"
                placeholder="Diagram title..."
                value={block.props.title}
                onChange={(e) => editor.updateBlock(block, { props: { ...block.props, title: e.target.value } })}
                className="w-full bg-transparent border-none outline-none font-semibold text-center text-foreground placeholder:text-muted-foreground/40 hover:bg-muted/20 focus:bg-muted/20 rounded-lg py-1 text-sm transition-colors"
              />
            )}
            {isEditable && (
              <input
                type="text"
                placeholder="Add a description (optional)..."
                value={block.props.description}
                onChange={(e) => editor.updateBlock(block, { props: { ...block.props, description: e.target.value } })}
                className="w-full bg-transparent border-none outline-none text-xs text-center text-muted-foreground placeholder:text-muted-foreground/35 hover:bg-muted/20 focus:bg-muted/20 rounded-lg py-1 transition-colors"
              />
            )}
          </div>

          {/* Print-only caption */}
          {block.props.title && <div className="hidden print:block text-center font-bold text-slate-900 text-sm mt-3">{block.props.title}</div>}
          {block.props.description && <div className="hidden print:block text-center text-slate-500 text-xs mt-1">{block.props.description}</div>}

          {/* Modal */}
          {isEditing && (
            <ExcalidrawModal
              isOpen={isEditing}
              onClose={() => setIsEditing(false)}
              onSave={handleSave}
              initialData={initialData}
            />
          )}
        </div>
      );
    },
  }
);
