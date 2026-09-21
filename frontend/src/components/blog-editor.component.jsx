import React, { useContext, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { uploadImage } from '../utils/imageUploadUtils';
import lightLogo from '../imgs/logo-light.png';
import darkLogo from '../imgs/logo-dark.png';
import lightBanner from '../imgs/blog banner light.png';
import darkBanner from '../imgs/blog banner dark.png';
import AnimationWrapper from '../common/page-animation';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { EditorContext } from '../pages/editor.pages';
import axios from 'axios';
import { ThemeContext, UserContext } from '../App';
import { Button } from '@/components/ui/button';
import {
    ImagePlus, Send, FileCheck, Sparkles, Clock,
    RotateCcw, RotateCw, FileDown, ChevronDown, CheckCircle2,
    Sun, Moon, X, Package
} from 'lucide-react';
import { saveLocalDraft, clearLocalDraft, hasMeaningfulDraft } from '../utils/draftManager';
import { DIAGRAM_TEMPLATES } from './blocks/mermaid-block.jsx';

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
import {
    useCreateBlockNote,
    FormattingToolbarController,
    SuggestionMenuController,
    getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import {
    editorJsToBlockNote,
    hasMeaningfulContent,
    calculateDocumentStats
} from '../utils/editorAdapter';
import MobileFormattingToolbar, { MobileEditorProvider } from './mobile-formatting-toolbar.component';
import { blockSchema } from '../utils/blockSchema';
import { getOfflineSuggestion, fetchOnlineSuggestion } from '../utils/writingSuggestions';

// ── Group slash menu items contiguously to prevent duplicate group keys ──
function groupItemsContiguously(items) {
    const groups = new Map();
    for (const item of items) {
        const group = item.group || "Basic Blocks";
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group).push(item);
    }
    const result = [];
    for (const groupItems of groups.values()) {
        result.push(...groupItems);
    }
    return result;
}

// ── Custom slash menu items for new blocks ────────────────────
function getCustomSlashMenuItems(editor) {
    // Filter out default video item so our rich VideoBlock doesn't collide
    const defaultItems = getDefaultReactSlashMenuItems(editor).filter(
        (item) => item.key !== "video" && item.title !== "Video"
    );

    const customItems = [
        {
            title: "Entity (ER) Diagram",
            onItemClick: () => {
                editor.insertBlocks(
                    [{ type: "mermaid", props: { code: DIAGRAM_TEMPLATES.er.code, view: "diagram" } }],
                    editor.getTextCursorPosition().block,
                    "after"
                );
            },
            aliases: ["er", "erd", "entity", "schema", "database", "relational", "sql", "tables"],
            group: "Diagrams",
            icon: "🗄️",
            hint: "Database schemas, tables, keys & relations",
        },
        {
            title: "Mermaid Diagram",
            onItemClick: () => {
                editor.insertBlocks(
                    [{ type: "mermaid", props: { code: DIAGRAM_TEMPLATES.flowchart.code, view: "diagram" } }],
                    editor.getTextCursorPosition().block,
                    "after"
                );
            },
            aliases: ["mermaid", "diagram", "chart", "flow", "flowchart", "sequence"],
            group: "Diagrams",
            icon: "📊",
            hint: "Flowcharts, sequence diagrams & mindmaps",
        },
        {
            title: "Excalidraw Drawing",
            onItemClick: () => {
                editor.insertBlocks(
                    [{ type: "diagram", props: {} }],
                    editor.getTextCursorPosition().block,
                    "after"
                );
            },
            aliases: ["excalidraw", "draw", "sketch", "whiteboard", "wireframe"],
            group: "Diagrams",
            icon: "✏️",
            hint: "Open Excalidraw to draw diagrams and wireframes",
        },
        {
            title: "Video Embed",
            onItemClick: () => {
                editor.insertBlocks(
                    [{ type: "video", props: {} }],
                    editor.getTextCursorPosition().block,
                    "after"
                );
            },
            aliases: ["video", "youtube", "vimeo", "embed", "media"],
            group: "Embeds",
            icon: "🎬",
            hint: "Embed YouTube, Vimeo, or upload a video",
        },
        {
            title: "Tip / Callout",
            onItemClick: () => {
                editor.insertBlocks(
                    [{ type: "alert", props: { type: "tip" }, content: [{ type: "text", text: "Tip: Add your note or suggestion here..." }] }],
                    editor.getTextCursorPosition().block,
                    "after"
                );
            },
            aliases: ["tip", "alert", "callout", "note", "warning", "info"],
            group: "Callouts",
            icon: "💡",
            hint: "Insert a tip, info note, warning, or danger callout",
        },
        {
            title: "NPM Package Card",
            onItemClick: () => {
                const pkgName = window.prompt("Enter NPM package name (e.g. react, axios, express, zustand):");
                if (!pkgName || !pkgName.trim()) return;
                const clean = pkgName.trim();
                editor.insertBlocks(
                    [{
                        type: "codeBlock",
                        props: { language: "bash" },
                        content: [{ type: "text", text: `npm install ${clean}\n# or\npnpm add ${clean}\n# or\nyarn add ${clean}` }]
                    }],
                    editor.getTextCursorPosition().block,
                    "after"
                );
            },
            aliases: ["npm", "package", "library", "install", "dependency", "pkg"],
            group: "Developer Tools",
            icon: "📦",
            hint: "Insert an NPM install snippet for any package",
        },
    ];

    return groupItemsContiguously([...defaultItems, ...customItems]);
}

// ── Import Markdown helper ────────────────────────────────────
async function importMarkdownToEditor(editor, file) {
    const text = await file.text();
    try {
        const blocks = await editor.tryParseMarkdownToBlocks(text);
        if (blocks && blocks.length > 0) {
            // Auto-detect and convert mermaid codeblocks to our custom mermaid block
            const convertMermaidBlocks = (blocksList) => {
                return blocksList.map(block => {
                    if (block.type === "codeBlock" && block.props?.language === "mermaid") {
                        let codeStr = "";
                        if (Array.isArray(block.content)) {
                            codeStr = block.content.map(c => c.text || "").join("");
                        } else if (typeof block.content === "string") {
                            codeStr = block.content;
                        }
                        return {
                            ...block,
                            type: "mermaid",
                            props: {
                                code: codeStr,
                                view: "diagram",
                                theme: "vibrant"
                            }
                        };
                    }
                    if (block.children && block.children.length > 0) {
                        block.children = convertMermaidBlocks(block.children);
                    }
                    return block;
                });
            };
            
            const convertedBlocks = convertMermaidBlocks(blocks);
            editor.replaceBlocks(editor.document, convertedBlocks);
            return { success: true, count: convertedBlocks.length };
        }
        return { success: false, error: "No content parsed from file" };
    } catch (err) {
        return { success: false, error: err.message || "Failed to parse markdown" };
    }
}

// ── Main Editor Component ─────────────────────────────────────
export default function BlogEditor() {
    const {
        blog,
        blog: { title, banner, content, tags, des } = {},
        setBlog,
        setEditorState,
        isRestoredDraft,
        discardDraft
    } = useContext(EditorContext);
    const { blog_id } = useParams();
    const [bannerImage, setBannerImage] = useState(banner);
    const [oldPublicId, setOldPublicId] = useState(null);
    const { userAuth: { access_token } } = useContext(UserContext);
    const { theme, setTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const titleRef = useRef(null);
    const mdInputRef = useRef(null);

    const changeTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [docStats, setDocStats] = useState({ words: 0, readTime: 1 });
    const [isSaving, setIsSaving] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving' | 'saved'
    const autoSaveTimerRef = useRef(null);

    // Prepare initial blocks
    const initialBlocks = useMemo(() => editorJsToBlockNote(content), [content]);

    // Initialize BlockNote with custom schema + Sharp image upload
    const editor = useCreateBlockNote({
        schema: blockSchema,
        initialContent: initialBlocks,
        uploadFile: async (file) => {
            const loadingToast = toast.loading(`Uploading ${file.name}...`);
            try {
                const response = await uploadImage(file);
                toast.dismiss(loadingToast);
                if (response.success && response.file?.url) {
                    toast.success("Image embedded 👍");
                    return response.file.url;
                }
                throw new Error(response.error || "Failed to upload image");
            } catch (err) {
                toast.dismiss(loadingToast);
                toast.error(err.message || "Failed to upload image");
                throw err;
            }
        }
    });

    // Smart text & NPM package writing suggestions
    const [smartSuggestion, setSmartSuggestion] = useState(null);
    const [suggestionCoords, setSuggestionCoords] = useState(null);
    const [enableSuggestions, setEnableSuggestions] = useState(true);

    const getCaretCoordinates = useCallback(() => {
        let activeEl = null;
        let coords = null;

        try {
            if (editor?.prosemirrorView) {
                const { from } = editor.prosemirrorView.state.selection;
                const pmCoords = editor.prosemirrorView.coordsAtPos(from);
                if (pmCoords && pmCoords.top > 0) {
                    coords = {
                        top: pmCoords.top,
                        bottom: pmCoords.bottom,
                        left: pmCoords.left,
                        height: Math.max(20, pmCoords.bottom - pmCoords.top)
                    };
                }
                const domNode = editor.prosemirrorView.domAtPos(from)?.node;
                activeEl = domNode?.nodeType === Node.ELEMENT_NODE ? domNode : domNode?.parentElement;
            }
        } catch (e) {}

        if (!coords) {
            try {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0).cloneRange();
                    if (!activeEl) {
                        activeEl = sel.anchorNode?.nodeType === Node.ELEMENT_NODE
                            ? sel.anchorNode
                            : sel.anchorNode?.parentElement;
                    }
                    const rects = range.getClientRects();
                    if (rects.length > 0 && rects[0].top > 0) {
                        coords = {
                            top: rects[0].top,
                            bottom: rects[0].bottom,
                            left: rects[0].right,
                            height: Math.max(20, rects[0].height)
                        };
                    } else {
                        const rect = range.getBoundingClientRect();
                        if (rect && rect.top > 0) {
                            coords = {
                                top: rect.top,
                                bottom: rect.bottom,
                                left: rect.right,
                                height: Math.max(20, rect.height)
                            };
                        }
                    }
                }
            } catch (e) {}
        }

        if (!coords) return null;

        // Extract typographic styles of current writing context (heading vs paragraph vs callout)
        let fontSize = '18px';
        let fontWeight = '400';
        let fontFamily = 'inherit';
        let lineHeight = `${coords.height}px`;
        let letterSpacing = 'normal';

        if (activeEl) {
            try {
                const computed = window.getComputedStyle(activeEl);
                if (computed) {
                    fontSize = computed.fontSize || fontSize;
                    fontWeight = computed.fontWeight || fontWeight;
                    fontFamily = computed.fontFamily || fontFamily;
                    if (computed.lineHeight && computed.lineHeight !== 'normal') {
                        lineHeight = computed.lineHeight;
                    }
                    letterSpacing = computed.letterSpacing || letterSpacing;
                }
            } catch (e) {}
        }

        return {
            ...coords,
            fontSize,
            fontWeight,
            fontFamily,
            lineHeight,
            letterSpacing
        };
    }, [editor]);

    const handleAcceptSuggestion = useCallback((e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!smartSuggestion) return;
        try {
            if (editor?._tiptapEditor?.commands?.insertContent) {
                editor._tiptapEditor.commands.insertContent(smartSuggestion.completion + " ");
            } else {
                document.execCommand("insertText", false, smartSuggestion.completion + " ");
            }
            setSmartSuggestion(null);
            setSuggestionCoords(null);
        } catch (err) {
            setSmartSuggestion(null);
            setSuggestionCoords(null);
        }
    }, [smartSuggestion, editor]);

    const handleEditorKeyUp = useCallback((e) => {
        if (!enableSuggestions) return;
        if (["Tab", "Escape", "ArrowUp", "ArrowDown", "Shift", "Control", "Alt", "Meta"].includes(e.key)) return;

        try {
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;
            const textBeforeCursor = selection.anchorNode?.textContent?.slice(0, selection.anchorOffset) || "";
            const match = textBeforeCursor.match(/([a-zA-Z0-9@_/-]+)$/);
            const currentWord = match ? match[1] : "";

            if (currentWord && currentWord.length >= 2) {
                // 1. Check offline first (0ms, no network): in-document words + local tech dictionary + cached terms
                const offlineMatch = getOfflineSuggestion(currentWord, editor?.document);
                if (offlineMatch) {
                    const coords = getCaretCoordinates();
                    if (coords) setSuggestionCoords(coords);
                    setSmartSuggestion(offlineMatch);
                    return; // Found offline! No network call needed.
                }

                // 2. Only if NOT found offline, efficiently go online (debounced + aborted + cached)
                fetchOnlineSuggestion(currentWord, (onlineMatch) => {
                    if (onlineMatch) {
                        const coords = getCaretCoordinates();
                        if (coords) setSuggestionCoords(coords);
                        setSmartSuggestion(onlineMatch);
                    }
                });
                return;
            }
            setSmartSuggestion(null);
            setSuggestionCoords(null);
        } catch (err) {
            setSmartSuggestion(null);
            setSuggestionCoords(null);
        }
    }, [enableSuggestions, editor, getCaretCoordinates]);

    const handleEditorKeyDown = useCallback((e) => {
        if (smartSuggestion && e.key === "Tab") {
            handleAcceptSuggestion(e);
        } else if (smartSuggestion && (e.key === "Escape" || e.key === "Backspace" || e.key === "Delete" || e.key.startsWith("Arrow") || e.key === "Enter")) {
            // Instantly clear auto-suggest on editing or moving out of word
            setSmartSuggestion(null);
            setSuggestionCoords(null);
        }
    }, [smartSuggestion, handleAcceptSuggestion]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Instantly dismiss auto-suggest when clicking elsewhere in the document
    useEffect(() => {
        if (!smartSuggestion) return;
        const handleDismissOnClick = (e) => {
            // If clicking the ghost text itself, let click handler run
            if (e.target?.closest('.ghost-suggestion-pill')) return;
            setSmartSuggestion(null);
            setSuggestionCoords(null);
        };
        window.addEventListener('mousedown', handleDismissOnClick, true);
        return () => window.removeEventListener('mousedown', handleDismissOnClick, true);
    }, [smartSuggestion]);

    // Keep suggestion position locked to caret on scroll or window resize
    useEffect(() => {
        if (!smartSuggestion) return;
        const handleReposition = () => {
            const coords = getCaretCoordinates();
            if (coords) setSuggestionCoords(coords);
            else {
                setSmartSuggestion(null);
                setSuggestionCoords(null);
            }
        };
        window.addEventListener('scroll', handleReposition, true);
        window.addEventListener('resize', handleReposition);
        return () => {
            window.removeEventListener('scroll', handleReposition, true);
            window.removeEventListener('resize', handleReposition);
        };
    }, [smartSuggestion, getCaretCoordinates]);

    // Keep bannerImage synchronized when blog.banner updates
    useEffect(() => { setBannerImage(banner); }, [banner]);

    // Auto-adjust title textarea height
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.style.height = 'auto';
            titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
        }
    }, [title]);

    // Auto-save logic
    const performAutoSave = useCallback(() => {
        if (!editor) return;
        const blocks = editor.document;
        const currentDraft = {
            title,
            banner,
            banner_public_id: blog?.banner_public_id || oldPublicId,
            des,
            tags,
            content: { blocks, format: 'blocknote', version: '1.0' },
        };
        if (hasMeaningfulDraft(currentDraft)) {
            saveLocalDraft(blog_id, currentDraft);
            setAutoSaveStatus('saved');
        }
    }, [editor, title, banner, blog?.banner_public_id, oldPublicId, des, tags, blog_id]);

    // Live word count + onChange auto-save
    useEffect(() => {
        if (!editor) return;
        const updateStatsAndDraft = () => {
            setDocStats(calculateDocumentStats(editor.document));
            setAutoSaveStatus('saving');
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = setTimeout(() => {
                performAutoSave();
            }, 800);
        };
        updateStatsAndDraft();
        const unsubscribe = editor.onChange(updateStatsAndDraft);
        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [editor, performAutoSave]);

    // Auto-save when title/banner/tags/des change
    useEffect(() => {
        if (!editor) return;
        setAutoSaveStatus('saving');
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => {
            performAutoSave();
        }, 800);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [title, banner, des, tags, performAutoSave, editor]);

    // Immediate save on beforeunload (browser reload, tab closing)
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (editor) {
                const blocks = editor.document;
                const currentDraft = {
                    title,
                    banner,
                    banner_public_id: blog?.banner_public_id || oldPublicId,
                    des,
                    tags,
                    content: { blocks, format: 'blocknote', version: '1.0' },
                };
                if (hasMeaningfulDraft(currentDraft)) {
                    saveLocalDraft(blog_id, currentDraft);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [editor, title, banner, blog?.banner_public_id, oldPublicId, des, tags, blog_id]);

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const loadingToast = toast.loading("Optimizing & uploading cover...");
        try {
            const response = await uploadImage(file, oldPublicId);
            if (response.success) {
                setBannerImage(response.file.url);
                setBlog({ ...blog, banner: response.file.url, banner_public_id: response.file.publicId });
                setOldPublicId(response.file.publicId);
                toast.dismiss(loadingToast);
                const savedMsg = response.file.stats?.percentageSaved
                    ? `Saved ${response.file.stats.percentageSaved} space (${response.file.stats.optimizedSize}) 👍`
                    : 'Banner uploaded successfully 👍';
                toast.success(savedMsg);
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.message || 'Error uploading image');
        }
        // Reset file input for re-selection
        e.target.value = '';
    };

    const handleMarkdownImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
            toast.error("Please select a .md or .txt Markdown file");
            return;
        }
        const loadingToast = toast.loading("Importing markdown...");
        const result = await importMarkdownToEditor(editor, file);
        toast.dismiss(loadingToast);
        if (result.success) {
            toast.success(`Imported ${result.count} blocks from ${file.name} 🎉`);
        } else {
            toast.error(result.error || "Failed to import markdown");
        }
        e.target.value = '';
    };

    const handleTitleKeyDown = (e) => { if (e.keyCode === 13) e.preventDefault(); };

    const handleTitleChange = (e) => {
        const input = e.target;
        input.style.height = 'auto';
        input.style.height = `${input.scrollHeight}px`;
        setBlog({ ...blog, title: input.value });
    };

    const handleError = (e) => { e.target.src = theme === 'light' ? lightBanner : darkBanner; };

    const handlePublishEvent = () => {
        if (!banner?.length) return toast.error("Please upload a story cover banner first.");
        if (!title?.trim()?.length) return toast.error("Story title is required to publish.");
        const blocks = editor.document;
        if (!hasMeaningfulContent(blocks)) return toast.error("Write something in your story before publishing.");
        setBlog({
            ...blog,
            content: { blocks, format: 'blocknote', version: '1.0' }
        });
        setEditorState("publish");
    };

    const handleSaveDraft = async (e) => {
        if (isSaving) return;
        if (!title || !title.trim().length) return toast.error('Please enter a story title before saving as draft.');
        setIsSaving(true);
        const loadingToast = toast.loading("Saving draft...");
        const blocks = editor.document;
        const blogObj = {
            title, banner, des,
            content: { blocks, format: 'blocknote', version: '1.0' },
            tags, draft: true
        };
        try {
            await axios.post(
                `${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`,
                { ...blogObj, id: blog_id },
                { headers: { 'Authorization': `Bearer ${access_token}` } }
            );
            toast.dismiss(loadingToast);
            clearLocalDraft(blog_id);
            toast.success('Draft saved! 👍');
            setTimeout(() => navigate("/dashboard/blogs?tab=draft"), 500);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.error || 'Failed to save draft.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            {/* ── Editor Navbar ── */}
            <nav className='navbar z-40 sticky top-0 border-b border-border bg-background/95 backdrop-blur-md'>
                <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between h-full gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Link to='/' className='flex-none w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:opacity-90 duration-150'>
                            <img src={theme === 'light' ? darkLogo : lightLogo} alt="Logo" className='w-9 h-9 sm:w-10 sm:h-10 object-contain' />
                        </Link>

                        {/* Undo / Redo */}
                        <div className="flex items-center gap-0.5 shrink-0">
                            <button type="button" onClick={() => { editor?.undo(); editor?.focus(); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                                title="Undo (Ctrl+Z)">
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => { editor?.redo(); editor?.focus(); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                                title="Redo (Ctrl+Y)">
                                <RotateCw className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Word count */}
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/60 text-[11px] font-medium text-muted-foreground shrink-0">
                            <Clock className="w-3 h-3 text-purple" />
                            <span>{docStats.words} words • {docStats.readTime} min read</span>
                        </div>

                        {/* Autosave Status / Draft Restored badge */}
                        {isRestoredDraft ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-medium text-amber-600 dark:text-amber-400 shrink-0">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span>Draft restored</span>
                                <button
                                    type="button"
                                    onClick={discardDraft}
                                    className="underline hover:text-foreground ml-1 cursor-pointer font-semibold"
                                    title="Discard local draft and start fresh"
                                >
                                    Discard
                                </button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-muted-foreground shrink-0">
                                <CheckCircle2 className={`w-3 h-3 ${autoSaveStatus === 'saved' ? 'text-emerald-500' : 'text-muted-foreground animate-pulse'}`} />
                                <span>{autoSaveStatus === 'saved' ? 'Autosaved' : 'Saving...'}</span>
                            </div>
                        )}

                        {/* Title preview */}
                        <p className='max-lg:hidden text-sm font-medium text-muted-foreground line-clamp-1 flex-1'>
                            {title?.length ? title : "Untitled Story"}
                        </p>
                    </div>

                    <div className='flex items-center gap-2 shrink-0'>
                        {/* Theme Toggle */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={changeTheme}
                            className="rounded-full w-8 h-8 sm:w-9 sm:h-9 hover:bg-muted text-muted-foreground hover:text-foreground"
                            aria-label="Toggle theme"
                            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        >
                            {theme === 'light' ? (
                                <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
                            ) : (
                                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
                            )}
                        </Button>

                        {/* Import Markdown */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => mdInputRef.current?.click()}
                            className="rounded-xl text-xs font-semibold gap-1.5 px-2 sm:px-2.5 h-8 sm:h-9 text-muted-foreground hover:text-foreground"
                            title="Import Markdown file"
                        >
                            <FileDown className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Import .md</span>
                        </Button>
                        <input ref={mdInputRef} type="file" accept=".md,.txt" hidden onChange={handleMarkdownImport} />

                        {/* Smart Suggestion Toggle */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setEnableSuggestions(!enableSuggestions);
                                toast.success(!enableSuggestions ? "Smart suggestions active (Tab to accept)" : "Smart suggestions paused");
                            }}
                            className={`rounded-xl text-xs font-semibold gap-1.5 px-2 sm:px-2.5 h-8 sm:h-9 cursor-pointer transition-colors ${
                                enableSuggestions ? "text-purple bg-purple/10 border border-purple/20" : "text-muted-foreground hover:text-foreground"
                            }`}
                            title={enableSuggestions ? "Smart suggestions active (Press Tab to complete)" : "Enable smart suggestions"}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-purple" />
                            <span className="hidden md:inline">Suggestions</span>
                        </Button>

                        {/* Save Draft */}
                        <Button
                            onClick={handleSaveDraft}
                            variant="outline"
                            size="sm"
                            disabled={isSaving}
                            className="rounded-xl border-border text-xs font-semibold gap-1.5 px-2.5 sm:px-3 h-8 sm:h-9"
                        >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">{isSaving ? 'Saving...' : 'Save Draft'}</span>
                            <span className="xs:hidden">{isSaving ? '...' : 'Draft'}</span>
                        </Button>

                        {/* Publish */}
                        <Button
                            onClick={handlePublishEvent}
                            size="sm"
                            className="rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-semibold gap-1.5 shadow-md px-2.5 sm:px-3 h-8 sm:h-9"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>Publish</span>
                        </Button>
                    </div>
                </div>
            </nav>

            <Toaster />

            <AnimationWrapper>
                <MobileEditorProvider editor={editor}>
                    <section className="py-4 sm:py-8">
                        <div className='mx-auto max-w-212.5 w-full px-3 sm:px-4'>
                            {/* Cover Banner Upload */}
                            <div className="relative aspect-21/9 sm:aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900/60 border-2 border-dashed border-slate-300 dark:border-slate-700/80 hover:border-purple dark:hover:border-purple transition-all group cursor-pointer shadow-sm">
                                <label htmlFor='uploadBanner' className="w-full h-full block cursor-pointer">
                                    {bannerImage ? (
                                        <>
                                            <img
                                                src={bannerImage}
                                                alt="Blog Banner"
                                                className='w-full h-full object-cover transition-transform group-hover:scale-[1.01] duration-300'
                                                onError={handleError}
                                            />
                                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 gap-2">
                                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow">
                                                    <ImagePlus className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-xs font-semibold tracking-wide">
                                                    Change Cover Banner
                                                </span>
                                                <span className="text-[10px] text-white/80">WebP optimized via Sharp</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-b from-slate-100/90 to-slate-200/70 dark:from-slate-900/60 dark:to-slate-950/80 hover:from-slate-200/80 hover:to-slate-200 dark:hover:from-slate-900/80 dark:hover:to-slate-900 transition-colors">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple/10 dark:bg-purple/20 text-purple flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 group-hover:bg-purple group-hover:text-white transition-all duration-200">
                                                <ImagePlus className="w-6 h-6 sm:w-7 sm:h-7" />
                                            </div>
                                            <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                                                Upload Cover Banner
                                            </p>
                                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-sm font-medium">
                                                Drag and drop or click to browse • Recommended 16:9 ratio
                                            </p>
                                            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-300 dark:border-slate-700">
                                                <span>WebP optimized via Sharp</span>
                                            </div>
                                        </div>
                                    )}
                                    <input id='uploadBanner' type="file" accept=".png,.jpg,.jpeg,.webp" hidden onChange={handleBannerUpload} aria-label="Upload story cover banner" />
                                </label>
                                {bannerImage && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setBannerImage("");
                                            setBlog((prev) => ({ ...prev, banner: "", banner_public_id: null }));
                                            toast.success("Cover banner removed");
                                        }}
                                        className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-red text-white text-xs font-medium backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow"
                                        title="Remove banner"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            {/* Title */}
                            <textarea
                                ref={titleRef}
                                value={title || ''}
                                placeholder='Story Title...'
                                className='bg-transparent text-2xl sm:text-4xl md:text-5xl font-bold font-inter text-foreground w-full outline-none resize-none mt-6 sm:mt-8 leading-tight placeholder:opacity-30 wrap-break-word'
                                onChange={handleTitleChange}
                                onKeyDown={handleTitleKeyDown}
                                rows={1}
                            />

                            {/* Hint Bar */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground my-3 sm:my-4 pb-2 border-b border-border/60">
                                <Sparkles className="w-3.5 h-3.5 text-purple shrink-0" />
                                <span>
                                    Type <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border">/</kbd> for blocks:
                                    headings, checklists, code, callouts, tables, <strong className="text-foreground">mermaid</strong>, <strong className="text-foreground">excalidraw</strong>, <strong className="text-foreground">video</strong>, alerts.
                                </span>
                                <span className="ml-auto text-muted-foreground/60 hidden sm:inline">
                                    Or use <kbd className="font-mono bg-muted px-1 py-0.5 rounded border border-border text-[10px]">Import .md</kbd> above
                                </span>
                            </div>

                            {/* BlockNote Editor */}
                            <div
                                className="blocknote-editor-wrapper w-full min-h-112.5"
                                onKeyUp={handleEditorKeyUp}
                                onKeyDownCapture={handleEditorKeyDown}
                            >
                                <BlockNoteView
                                    editor={editor}
                                    theme={theme === 'dark' ? 'dark' : 'light'}
                                    formattingToolbar={false}
                                    sideMenu={!isMobile}
                                    slashMenu={false}
                                >
                                    {/* Custom slash menu with new block types */}
                                    <SuggestionMenuController
                                        triggerCharacter="/"
                                        getItems={async (query) => {
                                            const all = getCustomSlashMenuItems(editor);
                                            const q = (query || "").toLowerCase();
                                            const filtered = q
                                                ? all.filter(
                                                    (item) =>
                                                        item.title.toLowerCase().includes(q) ||
                                                        item.aliases?.some((a) => a.toLowerCase().includes(q))
                                                )
                                                : all;
                                            return groupItemsContiguously(filtered);
                                        }}
                                    />

                                    {isMobile ? (
                                        <MobileFormattingToolbar />
                                    ) : (
                                        <FormattingToolbarController />
                                    )}
                                </BlockNoteView>

                                {/* Seamless Inline Ghost Text Completion (matches heading/paragraph font size, weight & baseline) */}
                                {smartSuggestion && enableSuggestions && suggestionCoords && (
                                    <span
                                        onClick={handleAcceptSuggestion}
                                        onTouchEnd={handleAcceptSuggestion}
                                        style={{
                                            position: 'fixed',
                                            top: `${suggestionCoords.top}px`,
                                            left: `${suggestionCoords.left}px`,
                                            height: `${suggestionCoords.height}px`,
                                            lineHeight: suggestionCoords.lineHeight || `${suggestionCoords.height}px`,
                                            fontSize: suggestionCoords.fontSize,
                                            fontWeight: suggestionCoords.fontWeight,
                                            fontFamily: suggestionCoords.fontFamily,
                                            letterSpacing: suggestionCoords.letterSpacing,
                                            color: 'currentColor',
                                            opacity: 0.38,
                                        }}
                                        className="ghost-suggestion-pill select-none z-50 whitespace-nowrap pointer-events-auto cursor-pointer hover:opacity-70 transition-opacity inline-block font-inherit"
                                        title="Click, tap, or press Tab to complete"
                                    >
                                        {smartSuggestion.completion}
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>
                </MobileEditorProvider>
            </AnimationWrapper>
        </>
    );
}
