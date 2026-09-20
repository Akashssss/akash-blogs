import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import { createPortal } from 'react-dom';
import { useBlockNoteEditor, useSelectedBlocks, useActiveStyles } from '@blocknote/react';
import { Drawer } from 'vaul';
import {
    Pilcrow,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    Code,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Plus,
    RotateCcw,
    RotateCw,
    ChevronDown,
    Check,
    X,
    ImagePlus,
    Table as TableIcon,
    Quote,
    Minus,
    ExternalLink,
    GitBranch,
    Palette,
    Video as VideoIcon,
    AlertCircle,
    Lightbulb,
    Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DIAGRAM_TEMPLATES } from './blocks/mermaid-block.jsx';

/* ------------------------------------------------------------------ *
 * Block type catalogue
 * ------------------------------------------------------------------ */

export const BLOCK_TYPE_OPTIONS = [
    { key: 'paragraph', type: 'paragraph', title: 'Paragraph', desc: 'Plain body text', icon: Pilcrow },
    { key: 'heading1', type: 'heading', props: { level: 1 }, title: 'Heading 1', desc: 'Largest section heading', icon: Heading1 },
    { key: 'heading2', type: 'heading', props: { level: 2 }, title: 'Heading 2', desc: 'Medium section heading', icon: Heading2 },
    { key: 'heading3', type: 'heading', props: { level: 3 }, title: 'Heading 3', desc: 'Small subsection heading', icon: Heading3 },
    { key: 'bulletList', type: 'bulletListItem', title: 'Bullet list', desc: 'Items with bullet points', icon: List },
    { key: 'numberedList', type: 'numberedListItem', title: 'Numbered list', desc: 'Items in a fixed order', icon: ListOrdered },
    { key: 'checkList', type: 'checkListItem', title: 'To-do list', desc: 'Checkboxes you can tick off', icon: CheckSquare },
    { key: 'codeBlock', type: 'codeBlock', title: 'Code block', desc: 'Monospaced, syntax coloured', icon: Code },
];

const TABLE_BLOCK = {
    type: 'table',
    content: {
        type: 'tableContent',
        columnWidths: [undefined, undefined],
        rows: [
            { cells: [['Header 1'], ['Header 2']] },
            { cells: [['Item 1'], ['Item 2']] }
        ]
    }
};

/**
 * Insert actions are declarative so they can be filtered against whatever the
 * editor schema actually supports. `requires` lists acceptable block type names
 * in order of preference — the first one present in the schema wins.
 */
export const INSERT_ACTIONS = [
    {
        key: 'image',
        title: 'Image',
        description: 'Upload a picture from this device',
        icon: ImagePlus,
        tone: 'purple',
        kind: 'file',
        requires: ['image']
    },
    {
        key: 'table',
        title: 'Table',
        description: 'Start a two column table',
        icon: TableIcon,
        tone: 'blue',
        requires: ['table'],
        build: () => TABLE_BLOCK,
        toast: 'Table added'
    },
    {
        key: 'code',
        title: 'Code block',
        description: 'Monospaced block for snippets',
        icon: Code,
        tone: 'emerald',
        requires: ['codeBlock'],
        build: (type) => ({ type }),
        toast: 'Code block added'
    },
    {
        key: 'quote',
        title: 'Quote',
        description: 'Pull out a line worth remembering',
        icon: Quote,
        tone: 'amber',
        requires: ['paragraph'],
        build: (type) => ({
            type,
            props: { textColor: 'gray' },
            content: [{ type: 'text', text: 'A line worth remembering…', styles: { italic: true } }]
        }),
        toast: 'Quote added'
    },
    {
        key: 'todo',
        title: 'To-do',
        description: 'A checkbox you can tick off',
        icon: CheckSquare,
        tone: 'violet',
        requires: ['checkListItem'],
        build: (type) => ({ type }),
        toast: 'To-do added'
    },
    {
        key: 'divider',
        title: 'Divider',
        description: 'Break the page into sections',
        icon: Minus,
        tone: 'muted',
        // BlockNote names this differently across versions; take whichever exists.
        requires: ['divider', 'horizontalRule', 'separator'],
        build: (type) => ({ type }),
        toast: 'Divider added'
    },
    {
        key: 'erDiagram',
        title: 'Entity (ER) Diagram',
        description: 'Database schemas, keys & tables',
        icon: Database,
        tone: 'purple',
        requires: ['mermaid'],
        build: () => ({ type: 'mermaid', props: { code: DIAGRAM_TEMPLATES.er.code, view: 'diagram' } }),
        toast: 'Entity ER diagram added'
    },
    {
        key: 'mermaid',
        title: 'Mermaid Diagram',
        description: 'Flowcharts, sequence, mindmaps & more',
        icon: GitBranch,
        tone: 'blue',
        requires: ['mermaid'],
        build: () => ({ type: 'mermaid', props: { code: DIAGRAM_TEMPLATES.flowchart.code, view: 'diagram' } }),
        toast: 'Mermaid diagram added'
    },
    {
        key: 'diagram',
        title: 'Excalidraw Canvas',
        description: 'Hand-drawn whiteboard & diagrams',
        icon: Palette,
        tone: 'amber',
        requires: ['diagram'],
        build: () => ({ type: 'diagram' }),
        toast: 'Excalidraw canvas added'
    },
    {
        key: 'video',
        title: 'Video Embed',
        description: 'YouTube, Vimeo or direct video link',
        icon: VideoIcon,
        tone: 'rose',
        requires: ['video'],
        build: () => ({ type: 'video' }),
        toast: 'Video block added'
    },
    {
        key: 'alert',
        title: 'Tip / Callout',
        description: 'Helpful tips, notes, warnings & cautions',
        icon: Lightbulb,
        tone: 'emerald',
        requires: ['alert'],
        build: () => ({ type: 'alert', props: { type: 'tip' }, content: [{ type: 'text', text: 'Tip: Add your note or suggestion here...' }] }),
        toast: 'Tip callout added'
    }
];

/* ------------------------------------------------------------------ *
 * Context
 * ------------------------------------------------------------------ */

export const MobileEditorContext = createContext(null);

// Fallback lookup for toolbars that BlockNote portals outside the provider tree.
const mobileEditorActions = new WeakMap();
let latestMobileEditorActions = null;

export function useMobileEditor() {
    return useContext(MobileEditorContext);
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function getBlockId(block) {
    return block?.id || null;
}

export function findBlockOption(block) {
    return (
        BLOCK_TYPE_OPTIONS.find((opt) => {
            if (opt.type !== block?.type) return false;
            if (opt.props?.level && block?.props?.level !== opt.props.level) return false;
            return true;
        }) || BLOCK_TYPE_OPTIONS[0]
    );
}

/** Names of every block type the current editor schema understands. */
function getSchemaBlockTypes(editor) {
    const schema = editor?.schema?.blockSchema || editor?.blockSchema;
    if (!schema) return null; // unknown — assume everything is allowed
    try {
        return new Set(Object.keys(schema));
    } catch {
        return null;
    }
}

/** First supported type name from `requires`, or null when none are available. */
function resolveBlockType(editor, requires) {
    const available = getSchemaBlockTypes(editor);
    const wanted = Array.isArray(requires) ? requires : [requires];
    if (!available) return wanted[0] ?? null;
    return wanted.find((name) => available.has(name)) ?? null;
}

/** Not every block accepts textAlignment — code blocks and tables do not. */
function supportsAlignment(editor, block) {
    if (!block?.type) return false;
    const schema = editor?.schema?.blockSchema || editor?.blockSchema;
    const spec = schema?.[block.type];
    if (!spec) return 'textAlignment' in (block.props || {});
    const propSchema = spec.propSchema || spec.config?.propSchema;
    if (!propSchema) return 'textAlignment' in (block.props || {});
    return Object.prototype.hasOwnProperty.call(propSchema, 'textAlignment');
}

/* ------------------------------------------------------------------ *
 * One-time stylesheet
 *
 * The reported "blank space under the list that you can scroll into" is caused
 * by vaul: for a bottom drawer it renders a `::after` pseudo element that is
 * 200% tall and sits directly below the sheet, so the sheet colour keeps going
 * during rubber-band over-drag. If `overflow-y-auto` is put on Drawer.Content
 * itself — as it was — that 200% block becomes scrollable content and every
 * drawer gains ~2 screens of empty scroll. The fix is to keep Drawer.Content
 * clipped and scroll an inner element instead; this stylesheet locks that in
 * so a stray utility class cannot reintroduce it.
 * ------------------------------------------------------------------ */

const DRAWER_STYLE_ID = 'mobile-editor-drawer-styles';
const DRAWER_STYLES = `
.mobile-editor-drawer { overflow: hidden !important; }
.mobile-editor-drawer::after { pointer-events: none; }
.mobile-editor-scroll { scrollbar-width: none; -ms-overflow-style: none; }
.mobile-editor-scroll::-webkit-scrollbar { width: 0; height: 0; display: none; }
@media (prefers-reduced-motion: reduce) {
  .mobile-editor-drawer,
  .mobile-editor-drawer * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`;

function useDrawerStyles() {
    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (document.getElementById(DRAWER_STYLE_ID)) return;
        const tag = document.createElement('style');
        tag.id = DRAWER_STYLE_ID;
        tag.textContent = DRAWER_STYLES;
        document.head.appendChild(tag);
    }, []);
}

/* ------------------------------------------------------------------ *
 * Bottom sheet shell
 * ------------------------------------------------------------------ */

export function MobileBottomSheet({ open, title, description, onOpenChange, children }) {
    useDrawerStyles();

    return (
        <Drawer.Root
            open={open}
            onOpenChange={onOpenChange}
            direction="bottom"
            modal
            dismissible
            shouldScaleBackground={false}
            repositionInputs={false}
        >
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[2px]" />

                <Drawer.Content
                    aria-label={title}
                    onOpenAutoFocus={(event) => event.preventDefault()}
                    className={[
                        'mobile-editor-drawer',
                        'fixed inset-x-0 bottom-0 z-[9999]',
                        'mx-auto flex w-full max-w-lg flex-col',
                        // h-auto + max-h keeps short sheets short; the inner region
                        // is the only thing that ever scrolls.
                        'h-auto max-h-[85dvh] min-h-0',
                        'rounded-t-[1.75rem] border-t border-border bg-background',
                        'shadow-[0_-16px_48px_rgba(0,0,0,0.28)] outline-none'
                    ].join(' ')}
                >
                    {/* Drag handle — generous hit area, small visual */}
                    <div className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing">
                        <div className="h-1.5 w-11 rounded-full bg-muted-foreground/25" />
                    </div>

                    {/* Header stays put while the list scrolls */}
                    <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-3">
                        <div className="min-w-0">
                            <Drawer.Title className="text-[0.9375rem] font-semibold leading-tight text-foreground">
                                {title}
                            </Drawer.Title>
                            <Drawer.Description className="mt-0.5 text-xs leading-snug text-muted-foreground">
                                {description}
                            </Drawer.Description>
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            aria-label={`Close ${title}`}
                            className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="h-px shrink-0 bg-border/70" />

                    {/* The ONLY scroll container in the sheet */}
                    <div className="mobile-editor-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
                        {children}
                    </div>

                    {/* Home-indicator clearance, no more */}
                    <div
                        className="shrink-0"
                        style={{ height: 'max(0.75rem, env(safe-area-inset-bottom))' }}
                    />
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}

/* ------------------------------------------------------------------ *
 * Drawer row
 * ------------------------------------------------------------------ */

const TONE_CLASSES = {
    purple: 'bg-purple/15 text-purple',
    blue: 'bg-blue-500/15 text-blue-500',
    emerald: 'bg-emerald-500/15 text-emerald-500',
    amber: 'bg-amber-500/15 text-amber-500',
    violet: 'bg-violet-500/15 text-violet-500',
    muted: 'bg-muted text-muted-foreground'
};

export function DrawerAction({ icon: Icon, title, description, tone = 'purple', onClick, disabled = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex w-full cursor-pointer items-center gap-3.5 rounded-2xl px-3 py-2.5 text-left text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple active:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[tone] || TONE_CLASSES.purple}`}>
                <Icon className="h-[1.125rem] w-[1.125rem]" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight">{title}</span>
                <span className="mt-0.5 block truncate text-xs leading-snug text-muted-foreground">{description}</span>
            </span>
        </button>
    );
}

/* ------------------------------------------------------------------ *
 * Shared drawers: transform block, insert element, link modal
 * ------------------------------------------------------------------ */

export function MobileEditorDrawers({
    editor,
    activeOption,
    isBlockDrawerOpen,
    setIsBlockDrawerOpen,
    isInsertDrawerOpen,
    setIsInsertDrawerOpen,
    isLinkModalOpen,
    setIsLinkModalOpen,
    linkUrl,
    setLinkUrl,
    onSelectBlockType,
    onInsertAction,
    onApplyLink,
    fileInputRef,
    onFileChange
}) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Hide anything this editor's schema cannot actually create, rather than
    // letting the click fail with "Failed to insert element".
    const insertActions = useMemo(
        () =>
            INSERT_ACTIONS.map((action) => ({
                ...action,
                resolvedType: resolveBlockType(editor, action.requires)
            })).filter((action) => action.kind === 'file' || action.resolvedType),
        [editor]
    );

    const blockOptions = useMemo(() => {
        const available = getSchemaBlockTypes(editor);
        if (!available) return BLOCK_TYPE_OPTIONS;
        return BLOCK_TYPE_OPTIONS.filter((opt) => available.has(opt.type));
    }, [editor]);

    if (!mounted || typeof document === 'undefined') return null;

    return (
        <>
            {/* Hidden image picker — lives here so it survives toolbar remounts */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
            />

            {/* Transform block */}
            <MobileBottomSheet
                open={isBlockDrawerOpen}
                title="Turn into"
                description="Change the style of the current block"
                onOpenChange={setIsBlockDrawerOpen}
            >
                <div role="listbox" aria-label="Block styles" className="flex flex-col gap-0.5 pb-1">
                    {blockOptions.map((opt) => {
                        const ItemIcon = opt.icon;
                        const isCurrent = opt.key === activeOption?.key;
                        return (
                            <button
                                key={opt.key}
                                type="button"
                                role="option"
                                aria-selected={isCurrent}
                                onClick={() => onSelectBlockType?.(opt)}
                                className={`flex w-full cursor-pointer items-center gap-3.5 rounded-2xl px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${
                                    isCurrent
                                        ? 'bg-purple/10 text-foreground'
                                        : 'text-foreground hover:bg-muted active:bg-muted'
                                }`}
                            >
                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                        isCurrent ? 'bg-purple text-white' : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <ItemIcon className="h-[1.125rem] w-[1.125rem]" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className={`block text-sm leading-tight ${isCurrent ? 'font-semibold text-purple' : 'font-semibold'}`}>
                                        {opt.title}
                                    </span>
                                    <span className="mt-0.5 block truncate text-xs leading-snug text-muted-foreground">
                                        {opt.desc}
                                    </span>
                                </span>
                                {isCurrent && <Check className="h-4 w-4 shrink-0 text-purple" />}
                            </button>
                        );
                    })}
                </div>
            </MobileBottomSheet>

            {/* Insert element */}
            <MobileBottomSheet
                open={isInsertDrawerOpen}
                title="Add block"
                description="Insert below the current block"
                onOpenChange={setIsInsertDrawerOpen}
            >
                <div className="flex flex-col gap-0.5 pb-1">
                    {insertActions.map((action) => (
                        <DrawerAction
                            key={action.key}
                            icon={action.icon}
                            title={action.title}
                            description={action.description}
                            tone={action.tone}
                            onClick={() => onInsertAction?.(action)}
                        />
                    ))}
                </div>
            </MobileBottomSheet>

            {/* Link modal */}
            {isLinkModalOpen &&
                createPortal(
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mobile-link-heading"
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setIsLinkModalOpen(false);
                        }}
                    >
                        <div className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-background p-5 shadow-2xl">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-start gap-2.5">
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple/15 text-purple">
                                        <ExternalLink className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <h3 id="mobile-link-heading" className="text-[0.9375rem] font-semibold leading-tight text-foreground">
                                            Add link
                                        </h3>
                                        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                                            Selected text becomes the link. With nothing selected, the address is inserted.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsLinkModalOpen(false)}
                                    aria-label="Close add link"
                                    className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={onApplyLink} className="space-y-3">
                                <div className="space-y-1.5">
                                    <label htmlFor="mobile-link-url" className="block text-xs font-semibold text-foreground">
                                        Address
                                    </label>
                                    <input
                                        id="mobile-link-url"
                                        type="url"
                                        inputMode="url"
                                        autoFocus
                                        autoComplete="off"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                        placeholder="https://example.com"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        className="w-full rounded-xl border border-input bg-muted/40 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-purple focus:ring-1 focus:ring-purple"
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsLinkModalOpen(false)}
                                        className="cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!linkUrl.trim()}
                                        className="cursor-pointer rounded-xl bg-purple px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-purple/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple disabled:pointer-events-none disabled:opacity-40"
                                    >
                                        Add link
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}

/* ------------------------------------------------------------------ *
 * Provider — owns drawer state and every editor mutation
 * ------------------------------------------------------------------ */

export function MobileEditorProvider({ editor, children }) {
    const [isBlockDrawerOpen, setIsBlockDrawerOpen] = useState(false);
    const [isInsertDrawerOpen, setIsInsertDrawerOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [activeTargetBlockId, setActiveTargetBlockId] = useState(null);
    // Bumped whenever the editor's content or selection changes, so the block
    // label in the toolbars re-renders instead of going stale.
    const [revision, setRevision] = useState(0);
    const fileInputRef = useRef(null);

    const getActiveBlock = useCallback(() => {
        if (!editor) return null;
        if (activeTargetBlockId) {
            try {
                const pinned = editor.getBlock?.(activeTargetBlockId);
                if (pinned) return pinned;
            } catch {
                /* block was removed — fall through to the cursor */
            }
        }
        try {
            return editor.getTextCursorPosition?.()?.block || editor.document?.[0] || null;
        } catch {
            return editor.document?.[0] || null;
        }
    }, [editor, activeTargetBlockId]);

    const closeDrawers = useCallback(() => {
        setIsBlockDrawerOpen(false);
        setIsInsertDrawerOpen(false);
        setIsLinkModalOpen(false);
        // Unpin, otherwise every later read keeps returning the block that was
        // active when the drawer first opened.
        setActiveTargetBlockId(null);
    }, []);

    // Escape closes whatever is open.
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') closeDrawers();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeDrawers]);

    // Keep the active block fresh as the caret moves.
    useEffect(() => {
        if (!editor) return undefined;
        const bump = () => setRevision((n) => n + 1);
        const unsubscribers = [];
        try {
            if (typeof editor.onChange === 'function') {
                const off = editor.onChange(bump);
                if (typeof off === 'function') unsubscribers.push(off);
            }
            if (typeof editor.onSelectionChange === 'function') {
                const off = editor.onSelectionChange(bump);
                if (typeof off === 'function') unsubscribers.push(off);
            }
        } catch {
            /* older editor builds expose neither — labels still update on open */
        }
        return () => unsubscribers.forEach((off) => off());
    }, [editor]);

    // Drop the pin as soon as everything is closed.
    useEffect(() => {
        if (!isBlockDrawerOpen && !isInsertDrawerOpen && !isLinkModalOpen && activeTargetBlockId) {
            setActiveTargetBlockId(null);
        }
    }, [isBlockDrawerOpen, isInsertDrawerOpen, isLinkModalOpen, activeTargetBlockId]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const currentBlock = useMemo(() => getActiveBlock(), [getActiveBlock, revision]);
    const activeOption = useMemo(() => findBlockOption(currentBlock), [currentBlock]);

    const openBlockDrawer = useCallback(
        (targetBlock = null) => {
            setIsInsertDrawerOpen(false);
            setIsLinkModalOpen(false);
            setActiveTargetBlockId(getBlockId(targetBlock || getActiveBlock()));
            setIsBlockDrawerOpen(true);
        },
        [getActiveBlock]
    );

    const openInsertDrawer = useCallback(
        (targetBlock = null) => {
            setIsBlockDrawerOpen(false);
            setIsLinkModalOpen(false);
            setActiveTargetBlockId(getBlockId(targetBlock || getActiveBlock()));
            setIsInsertDrawerOpen(true);
        },
        [getActiveBlock]
    );

    const openLinkModal = useCallback(() => {
        setIsBlockDrawerOpen(false);
        setIsInsertDrawerOpen(false);
        let currentUrl = '';
        try {
            currentUrl = editor?.getSelectedLinkUrl?.() || '';
        } catch {
            currentUrl = '';
        }
        setLinkUrl(currentUrl);
        setIsLinkModalOpen(true);
    }, [editor]);

    const handleSelectBlockType = useCallback(
        (option) => {
            const target = getActiveBlock();
            if (!target || !editor?.updateBlock) {
                toast.error('Put the caret in a block first');
                return;
            }
            try {
                editor.updateBlock(target, { type: option.type, props: option.props || {} });
                setIsBlockDrawerOpen(false);
                setActiveTargetBlockId(null);
                editor.focus?.();
                toast.success(`Turned into ${option.title.toLowerCase()}`);
            } catch (err) {
                console.error('Failed to update block type:', err);
                toast.error(`Cannot turn this block into ${option.title.toLowerCase()}`);
            }
        },
        [editor, getActiveBlock]
    );

    const handleInsertBlock = useCallback(
        (blockData, successMsg) => {
            const target = getActiveBlock() || editor?.document?.[(editor?.document?.length || 1) - 1];
            if (!blockData?.type || !target || !editor?.insertBlocks) {
                toast.error('Put the caret in a block first');
                return;
            }
            try {
                editor.insertBlocks([blockData], target, 'after');
                setIsInsertDrawerOpen(false);
                setActiveTargetBlockId(null);
                editor.focus?.();
                if (successMsg) toast.success(successMsg);
            } catch (err) {
                console.error('Failed to insert block:', err);
                toast.error('Could not add that block');
            }
        },
        [editor, getActiveBlock]
    );

    /** Routes a declarative INSERT_ACTIONS entry to the right handler. */
    const handleInsertAction = useCallback(
        (action) => {
            if (!action) return;
            if (action.kind === 'file') {
                fileInputRef.current?.click();
                return;
            }
            const type = action.resolvedType || resolveBlockType(editor, action.requires);
            if (!type) {
                toast.error(`${action.title} is not available in this editor`);
                return;
            }
            handleInsertBlock(action.build(type), action.toast);
        },
        [editor, handleInsertBlock]
    );

    const getBlockById = useCallback(
        (blockId) => {
            if (!blockId || !editor?.getBlock) return null;
            try {
                return editor.getBlock(blockId) || null;
            } catch {
                return null;
            }
        },
        [editor]
    );

    const handleApplyLink = useCallback(
        (e) => {
            e?.preventDefault();
            const url = linkUrl.trim();
            if (!url) {
                toast.error('Enter a web address');
                return;
            }
            if (!editor?.createLink) {
                toast.error('Links are not available in this editor');
                setIsLinkModalOpen(false);
                return;
            }
            try {
                // With no selection BlockNote has no text to wrap, so pass the
                // address itself as the link text instead of silently doing nothing.
                const hasSelection = Boolean(editor.getSelectedText?.()?.length);
                if (hasSelection) {
                    editor.createLink(url);
                } else {
                    editor.createLink(url, url);
                }
                setIsLinkModalOpen(false);
                setLinkUrl('');
                editor.focus?.();
                toast.success('Link added');
            } catch (err) {
                console.error('Failed to create link:', err);
                toast.error('Could not add that link');
            }
        },
        [editor, linkUrl]
    );

    const handleFileChange = useCallback(
        async (e) => {
            const file = e.target.files?.[0];
            const resetInput = () => {
                if (fileInputRef.current) fileInputRef.current.value = '';
            };
            if (!file) return;

            setIsInsertDrawerOpen(false);

            const target = getBlockById(activeTargetBlockId) || getActiveBlock();
            if (!target || !editor?.insertBlocks) {
                toast.error('Put the caret in a block first');
                resetInput();
                return;
            }
            if (!editor?.uploadFile) {
                toast.error('Image upload is not set up yet');
                resetInput();
                return;
            }

            const loadingToast = toast.loading(`Uploading ${file.name}…`);
            try {
                const url = await editor.uploadFile(file);
                toast.dismiss(loadingToast);
                if (!url) {
                    toast.error('Upload finished without a URL');
                    return;
                }
                editor.insertBlocks([{ type: 'image', props: { url, name: file.name } }], target, 'after');
                setActiveTargetBlockId(null);
                editor.focus?.();
                toast.success('Image added');
            } catch (err) {
                toast.dismiss(loadingToast);
                console.error('Failed to upload image:', err);
                toast.error(err?.message || 'Could not upload that image');
            } finally {
                resetInput();
            }
        },
        [editor, activeTargetBlockId, getActiveBlock, getBlockById]
    );

    const contextValue = useMemo(
        () => ({
            editor,
            activeBlock: currentBlock,
            activeOption,
            openBlockDrawer,
            openInsertDrawer,
            openLinkModal,
            closeDrawers,
            insertBlockAfter: handleInsertBlock,
            insertAction: handleInsertAction,
            fileInputRef
        }),
        [
            editor,
            currentBlock,
            activeOption,
            openBlockDrawer,
            openInsertDrawer,
            openLinkModal,
            closeDrawers,
            handleInsertBlock,
            handleInsertAction
        ]
    );

    // Registered for toolbars BlockNote portals outside this provider's tree.
    useEffect(() => {
        if (!editor) return undefined;
        mobileEditorActions.set(editor, contextValue);
        latestMobileEditorActions = contextValue;
        return () => {
            mobileEditorActions.delete(editor);
            if (latestMobileEditorActions === contextValue) latestMobileEditorActions = null;
        };
    }, [editor, contextValue]);

    return (
        <MobileEditorContext.Provider value={contextValue}>
            {children}
            <MobileEditorDrawers
                editor={editor}
                activeOption={activeOption}
                isBlockDrawerOpen={isBlockDrawerOpen}
                setIsBlockDrawerOpen={setIsBlockDrawerOpen}
                isInsertDrawerOpen={isInsertDrawerOpen}
                setIsInsertDrawerOpen={setIsInsertDrawerOpen}
                isLinkModalOpen={isLinkModalOpen}
                setIsLinkModalOpen={setIsLinkModalOpen}
                linkUrl={linkUrl}
                setLinkUrl={setLinkUrl}
                onSelectBlockType={handleSelectBlockType}
                onInsertAction={handleInsertAction}
                onApplyLink={handleApplyLink}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
            />
        </MobileEditorContext.Provider>
    );
}

/* ------------------------------------------------------------------ *
 * Small shared button primitives
 * ------------------------------------------------------------------ */

/** Icon-only tool button. `active` paints it with the accent. */
function ToolButton({ icon: Icon, label, onClick, active = false, disabled = false, id, variant = 'accent' }) {
    const activeClass =
        variant === 'accent'
            ? 'bg-purple text-white shadow-sm'
            : 'bg-muted font-semibold text-foreground';

    return (
        <button
            id={id}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            // preventDefault on pointer-down keeps the editor selection alive.
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={onClick}
            className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple disabled:pointer-events-none disabled:opacity-35 ${
                active ? activeClass : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
        >
            <Icon className="h-[0.9375rem] w-[0.9375rem]" />
        </button>
    );
}

function Divider() {
    return <span aria-hidden="true" className="mx-0.5 h-5 w-px shrink-0 bg-border/80" />;
}

/* ------------------------------------------------------------------ *
 * Selection toolbar — shown while text is selected
 * ------------------------------------------------------------------ */

export default function MobileFormattingToolbar() {
    const editor = useBlockNoteEditor();
    const selectedBlocks = useSelectedBlocks(editor);
    const activeStyles = useActiveStyles(editor) || {};
    const mobileCtx = useMobileEditor();
    const mobileActions = mobileCtx || mobileEditorActions.get(editor) || latestMobileEditorActions;

    let activeBlock = selectedBlocks?.[0] || mobileCtx?.activeBlock || null;
    if (!activeBlock) {
        try {
            activeBlock = editor?.getTextCursorPosition?.()?.block || editor?.document?.[0] || null;
        } catch {
            activeBlock = editor?.document?.[0] || null;
        }
    }

    const activeOption = findBlockOption(activeBlock);
    const ActiveIcon = activeOption.icon;
    const canAlign = supportsAlignment(editor, activeBlock);
    const alignment = activeBlock?.props?.textAlignment || 'left';

    const toggleStyle = (styleKey) => {
        try {
            editor.toggleStyles({ [styleKey]: true });
            editor.focus?.();
        } catch (err) {
            console.error(`Failed to toggle ${styleKey}:`, err);
        }
    };

    const setAlignment = (value) => {
        if (!activeBlock || !canAlign) return;
        try {
            editor.updateBlock(activeBlock, { props: { textAlignment: value } });
            editor.focus?.();
        } catch (err) {
            console.error('Failed to set alignment:', err);
        }
    };

    return (
        <div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="mx-auto flex w-full max-w-lg items-center gap-1.5 px-2 py-1.5">
                {/* Pinned: block type + insert. These must never scroll away. */}
                <div className="flex shrink-0 items-center gap-1.5">
                    <button
                        id="mobile-block-type-btn"
                        type="button"
                        title="Turn into"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            mobileActions?.openBlockDrawer?.(activeBlock);
                        }}
                        className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-muted/80 px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
                    >
                        <ActiveIcon className="h-[0.9375rem] w-[0.9375rem] shrink-0 text-purple" />
                        <span className="max-w-[5.25rem] truncate">{activeOption.title}</span>
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    </button>

                    <button
                        id="mobile-insert-btn"
                        type="button"
                        title="Add block"
                        aria-label="Add block"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            mobileActions?.openInsertDrawer?.(activeBlock);
                        }}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-purple/30 bg-purple/15 text-purple transition-colors hover:bg-purple/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
                    >
                        <Plus className="h-[0.9375rem] w-[0.9375rem]" />
                    </button>

                    <Divider />
                </div>

                {/* Scrollable: everything else */}
                <div className="mobile-editor-scroll flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overscroll-x-contain">
                    <ToolButton id="mobile-undo-btn" icon={RotateCcw} label="Undo" onClick={() => { editor.undo(); editor.focus?.(); }} />
                    <ToolButton id="mobile-redo-btn" icon={RotateCw} label="Redo" onClick={() => { editor.redo(); editor.focus?.(); }} />

                    <Divider />

                    <ToolButton icon={Bold} label="Bold" active={!!activeStyles.bold} onClick={() => toggleStyle('bold')} />
                    <ToolButton icon={Italic} label="Italic" active={!!activeStyles.italic} onClick={() => toggleStyle('italic')} />
                    <ToolButton icon={Underline} label="Underline" active={!!activeStyles.underline} onClick={() => toggleStyle('underline')} />
                    <ToolButton icon={Strikethrough} label="Strikethrough" active={!!activeStyles.strike} onClick={() => toggleStyle('strike')} />
                    <ToolButton icon={Code} label="Inline code" active={!!activeStyles.code} onClick={() => toggleStyle('code')} />

                    <Divider />

                    <ToolButton
                        icon={AlignLeft}
                        label="Align left"
                        variant="neutral"
                        disabled={!canAlign}
                        active={canAlign && alignment === 'left'}
                        onClick={() => setAlignment('left')}
                    />
                    <ToolButton
                        icon={AlignCenter}
                        label="Align centre"
                        variant="neutral"
                        disabled={!canAlign}
                        active={canAlign && alignment === 'center'}
                        onClick={() => setAlignment('center')}
                    />
                    <ToolButton
                        icon={AlignRight}
                        label="Align right"
                        variant="neutral"
                        disabled={!canAlign}
                        active={canAlign && alignment === 'right'}
                        onClick={() => setAlignment('right')}
                    />

                    <Divider />

                    <ToolButton
                        icon={LinkIcon}
                        label="Add link"
                        onClick={(e) => {
                            e?.stopPropagation?.();
                            mobileActions?.openLinkModal?.();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ *
 * Persistent quick bar — shown when nothing is selected
 * ------------------------------------------------------------------ */

export function MobileQuickBar({ editor }) {
    // No hooks here, so the early return is safe.
    if (!editor) return null;
    return <MobileQuickBarInner editor={editor} />;
}

function MobileQuickBarInner({ editor }) {
    const mobileCtx = useMobileEditor();
    useSelectedBlocks(editor);

    let hasSelection = false;
    try {
        hasSelection = Boolean(editor.getSelection?.());
    } catch {
        hasSelection = false;
    }
    if (hasSelection) return null;

    let activeBlock = mobileCtx?.activeBlock || null;
    if (!activeBlock) {
        try {
            activeBlock = editor.getTextCursorPosition?.()?.block || editor.document?.[0] || null;
        } catch {
            activeBlock = editor.document?.[0] || null;
        }
    }

    const activeOption = findBlockOption(activeBlock);
    const ActiveIcon = activeOption.icon;

    const tableAction = INSERT_ACTIONS.find((a) => a.key === 'table');
    const tableType = resolveBlockType(editor, tableAction?.requires);

    const insertTable = () => {
        if (!tableAction || !tableType) {
            toast.error('Tables are not available in this editor');
            return;
        }
        if (mobileCtx?.insertAction) {
            mobileCtx.insertAction({ ...tableAction, resolvedType: tableType });
            return;
        }
        // Fallback for a quick bar rendered outside the provider.
        const target = (() => {
            try {
                return editor.getTextCursorPosition?.()?.block || editor.document?.[editor.document.length - 1];
            } catch {
                return editor.document?.[editor.document.length - 1];
            }
        })();
        if (!target) return;
        try {
            editor.insertBlocks([tableAction.build(tableType)], target, 'after');
            editor.focus?.();
            toast.success('Table added');
        } catch {
            toast.error('Could not add that table');
        }
    };

    return (
        <div
            className="sticky bottom-3 z-30 mx-auto mt-4 w-full max-w-sm px-3 md:hidden"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex items-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl backdrop-blur-md">
                <button
                    id="mobile-quickbar-block-btn"
                    type="button"
                    title="Turn into"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        mobileCtx?.openBlockDrawer?.(activeBlock);
                    }}
                    className="flex h-9 min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-xl border border-border/60 bg-muted/70 px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
                >
                    <ActiveIcon className="h-[0.9375rem] w-[0.9375rem] shrink-0 text-purple" />
                    <span className="truncate">{activeOption.title}</span>
                    <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 opacity-60" />
                </button>

                <button
                    id="mobile-quickbar-insert-btn"
                    type="button"
                    title="Add block"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        mobileCtx?.openInsertDrawer?.(activeBlock);
                    }}
                    className="flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-xl bg-purple px-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-purple/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
                >
                    <Plus className="h-[0.9375rem] w-[0.9375rem]" />
                    <span>Add</span>
                </button>

                <Divider />

                <ToolButton id="mobile-quickbar-table-btn" icon={TableIcon} label="Add table" onClick={insertTable} />
                <ToolButton
                    id="mobile-quickbar-image-btn"
                    icon={ImagePlus}
                    label="Add image"
                    onClick={() => mobileCtx?.fileInputRef?.current?.click()}
                />
                <ToolButton
                    id="mobile-quickbar-undo-btn"
                    icon={RotateCcw}
                    label="Undo"
                    onClick={() => {
                        editor.undo();
                        editor.focus?.();
                    }}
                />
                <ToolButton
                    id="mobile-quickbar-redo-btn"
                    icon={RotateCw}
                    label="Redo"
                    onClick={() => {
                        editor.redo();
                        editor.focus?.();
                    }}
                />
            </div>
        </div>
    );
}
