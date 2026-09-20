import { createReactBlockSpec } from "@blocknote/react";
import { useState, useRef } from "react";
import { Video, Link2, X, Upload, Play, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadVideo } from "../../utils/imageUploadUtils";

const YoutubeIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// ── URL Helpers ─────────────────────────────────────────────
function parseVideoUrl(url) {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return { type: "youtube", id: ytMatch[1], embed: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1` };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { type: "vimeo", id: vimeoMatch[1], embed: `https://player.vimeo.com/video/${vimeoMatch[1]}?byline=0&portrait=0` };
  }

  // Direct video file
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return { type: "file", src: url };
  }

  return null;
}

// ── URL Input Component ──────────────────────────────────────
function VideoUrlInput({ onSubmit, onCancel }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    const parsed = parseVideoUrl(url.trim());
    if (!parsed) {
      toast.error("Enter a valid YouTube, Vimeo, or direct video URL");
      return;
    }
    onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
        <Link2 className="w-4 h-4 text-primary" />
        Embed Video URL
      </div>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=... or Vimeo / direct link"
          className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-muted-foreground/50"
          autoFocus
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Embed
        </button>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><YoutubeIcon className="w-3.5 h-3.5 text-red-500" /> YouTube</span>
        <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5 text-blue-400" /> Vimeo</span>
        <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5 text-green-500" /> Direct MP4</span>
      </div>
    </form>
  );
}

// ── Video Block Spec ──────────────────────────────────────────
export const VideoBlock = createReactBlockSpec(
  {
    type: "video",
    propSchema: {
      url: { default: "" },
      caption: { default: "" },
      width: { default: "100%" },
      aspectRatio: { default: "16/9", values: ["16/9", "4/3", "1/1", "9/16"] },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isUrlMode, setIsUrlMode] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isUploading, setIsUploading] = useState(false);
      const fileInputRef = useRef(null);

      const isEditable = editor.isEditable;
      const { url, caption, aspectRatio } = block.props;
      const parsed = parseVideoUrl(url);

      const handleUrlSubmit = (newUrl) => {
        editor.updateBlock(block, { props: { ...block.props, url: newUrl } });
        setIsUrlMode(false);
      };

      const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("video/")) {
          toast.error("Please select a video file (.mp4, .webm, .mov)");
          return;
        }
        if (file.size > 100 * 1024 * 1024) {
          toast.error("Video file must be under 100MB");
          return;
        }

        const loadingToast = toast.loading(`Uploading ${file.name}...`);
        setIsUploading(true);
        try {
          const response = await uploadVideo(file);
          if (response.success && response.file?.url) {
            editor.updateBlock(block, { props: { ...block.props, url: response.file.url } });
            toast.dismiss(loadingToast);
            toast.success("Video uploaded!");
          } else {
            throw new Error(response.error || "Upload failed");
          }
        } catch (err) {
          toast.dismiss(loadingToast);
          toast.error(err.message || "Upload failed");
        } finally {
          setIsUploading(false);
        }
      };

      const aspectPaddingMap = {
        "16/9": "56.25%",
        "4/3": "75%",
        "1/1": "100%",
        "9/16": "177.78%",
      };

      return (
        <div className="video-block-container group relative w-full my-4" contentEditable={false}>
          {/* Floating Controls (editable mode) */}
          {isEditable && parsed && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all z-20 flex items-center gap-1 bg-background/95 border border-border rounded-xl p-1.5 shadow-md backdrop-blur-sm print:hidden">
              <button
                onClick={() => setIsUrlMode(true)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Change video"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => editor.removeBlocks([block])}
                className="p-1.5 rounded-lg hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Empty state */}
          {!parsed && !isUrlMode && (
            <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-border/60 rounded-2xl bg-muted/5 hover:bg-muted/10 transition-colors">
              <Video className="w-10 h-10 text-muted-foreground/40 mb-4" />
              <p className="text-sm font-semibold text-muted-foreground mb-1">Embed a video</p>
              <p className="text-xs text-muted-foreground/70 mb-5">YouTube, Vimeo, or direct video file</p>
              {isEditable && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsUrlMode(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
                  >
                    <Link2 className="w-4 h-4" />
                    Paste URL
                  </button>
                  <span className="text-xs text-muted-foreground/50">or</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-60"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? "Uploading..." : "Upload File"}
                  </button>
                  <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={handleFileUpload} />
                </div>
              )}
            </div>
          )}

          {/* URL Input Form */}
          {isUrlMode && (
            <div className="border border-border rounded-2xl overflow-hidden bg-background shadow-sm">
              <VideoUrlInput onSubmit={handleUrlSubmit} onCancel={() => setIsUrlMode(false)} />
              <div className="px-4 pb-4">
                <button onClick={() => setIsUrlMode(false)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* Video Player */}
          {parsed && !isUrlMode && (
            <div className="rounded-2xl overflow-hidden shadow-lg border border-border/50">
              <div className="relative" style={{ paddingBottom: aspectPaddingMap[aspectRatio] || "56.25%", height: 0 }}>
                {(parsed.type === "youtube" || parsed.type === "vimeo") ? (
                  <iframe
                    src={parsed.embed}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    title="Embedded video"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={parsed.src || url}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                )}
              </div>
            </div>
          )}

          {/* Caption */}
          {(caption || isEditable) && parsed && (
            <div className="mt-2 px-1">
              <input
                type="text"
                value={caption}
                onChange={(e) => editor.updateBlock(block, { props: { ...block.props, caption: e.target.value } })}
                disabled={!isEditable}
                placeholder={isEditable ? "Add video caption..." : ""}
                className="w-full bg-transparent border-none outline-none text-xs text-center text-muted-foreground placeholder:text-muted-foreground/40 py-1 hover:bg-muted/20 focus:bg-muted/20 rounded-lg transition-colors"
              />
            </div>
          )}
        </div>
      );
    },
  }
);
