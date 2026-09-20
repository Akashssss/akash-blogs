import React, { useState, useRef, useEffect } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import {
  Info,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  Check,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Alert type configs ────────────────────────────────────────
const ALERT_CONFIG = {
  tip: {
    label: "Tip",
    fullLabel: "Tip / Suggestion",
    icon: Lightbulb,
    badgeText: "TIP",
    badgeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    indicator: "bg-emerald-500",
    container: "border-emerald-500/25 bg-emerald-50/70 dark:bg-emerald-950/25 dark:border-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    textColor: "text-emerald-950 dark:text-emerald-100",
  },
  info: {
    label: "Note",
    fullLabel: "Information / Note",
    icon: Info,
    badgeText: "NOTE",
    badgeBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    indicator: "bg-blue-500",
    container: "border-blue-500/25 bg-blue-50/70 dark:bg-blue-950/25 dark:border-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    textColor: "text-blue-950 dark:text-blue-100",
  },
  warning: {
    label: "Warning",
    fullLabel: "Warning / Caution",
    icon: AlertTriangle,
    badgeText: "WARNING",
    badgeBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    indicator: "bg-amber-500",
    container: "border-amber-500/25 bg-amber-50/70 dark:bg-amber-950/25 dark:border-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    textColor: "text-amber-950 dark:text-amber-100",
  },
  danger: {
    label: "Danger",
    fullLabel: "Danger / Critical",
    icon: AlertCircle,
    badgeText: "DANGER",
    badgeBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    indicator: "bg-rose-500",
    container: "border-rose-500/25 bg-rose-50/70 dark:bg-rose-950/25 dark:border-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
    textColor: "text-rose-950 dark:text-rose-100",
  },
};

// Aliases for backwards compatibility
ALERT_CONFIG.success = ALERT_CONFIG.tip;

function AlertBlockComponent({ block, editor, contentRef }) {
  const isEditable = editor.isEditable;
  const rawType = block.props.type || "tip";
  const type = ALERT_CONFIG[rawType] ? rawType : "tip";
  const config = ALERT_CONFIG[type] || ALERT_CONFIG.tip;
  const Icon = config.icon;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  const handleTypeChange = (newType) => {
    editor.updateBlock(block, {
      type: "alert",
      props: { ...block.props, type: newType },
    });
    setMenuOpen(false);
  };

  return (
    <div
      className={cn(
        "alert-block w-full min-w-full group relative my-3 flex items-start gap-3.5 rounded-xl border p-4 shadow-sm transition-all",
        config.container
      )}
      data-alert-type={type}
    >
      {/* Accent left indicator pill (smooth, no border glitch) */}
      <div
        className={cn(
          "w-1 self-stretch rounded-full shrink-0 transition-colors opacity-90",
          config.indicator
        )}
      />

      {/* Semantic Icon & Type Switcher */}
      <div className="relative shrink-0 select-none pt-0.5" ref={menuRef}>
        <button
          type="button"
          onClick={() => isEditable && setMenuOpen((o) => !o)}
          disabled={!isEditable}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 text-xs font-semibold tracking-wide transition-all",
            isEditable
              ? "cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
              : "cursor-default"
          )}
          title={isEditable ? `Change alert style (current: ${config.label})` : config.label}
        >
          <Icon className={cn("h-4 w-4 shrink-0 transition-colors", config.iconColor)} />
          <span className={cn("text-[11px] font-bold uppercase tracking-wider", config.iconColor)}>
            {config.label}
          </span>
          {isEditable && (
            <ChevronDown
              className={cn(
                "h-3 w-3 opacity-50 group-hover:opacity-80 transition-opacity",
                config.iconColor
              )}
            />
          )}
        </button>

        {/* Style Dropdown Menu */}
        {menuOpen && (
          <div className="absolute left-0 top-full z-50 mt-1.5 w-48 rounded-2xl border border-border bg-card/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
            <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Alert Style
            </p>
            {["tip", "info", "warning", "danger"].map((t) => {
              const itemConf = ALERT_CONFIG[t];
              const ItemIcon = itemConf.icon;
              const isSelected = type === t || (t === "tip" && type === "success");
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors text-left cursor-pointer",
                    isSelected
                      ? "bg-purple/10 text-purple font-semibold"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ItemIcon
                      className={cn(
                        "h-3.5 w-3.5",
                        t === "tip" && "text-emerald-500",
                        t === "info" && "text-blue-500",
                        t === "warning" && "text-amber-500",
                        t === "danger" && "text-rose-500"
                      )}
                    />
                    <span>{itemConf.fullLabel}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-purple" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Inline Editable Text Content */}
      <div
        ref={contentRef}
        className={cn(
          "flex-1 min-w-0 text-sm leading-relaxed outline-none font-medium py-0.5",
          config.textColor
        )}
      />

      {/* Delete button (editor only, visible on hover) */}
      {isEditable && (
        <button
          type="button"
          onClick={() => editor.removeBlocks([block])}
          className="shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/15 hover:text-destructive text-muted-foreground/60 transition-all cursor-pointer"
          title="Delete callout"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export const AlertBlock = createReactBlockSpec(
  {
    type: "alert",
    propSchema: {
      type: {
        default: "tip",
        values: ["tip", "info", "warning", "danger", "success"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => <AlertBlockComponent {...props} />,
  }
);

export default AlertBlock;
