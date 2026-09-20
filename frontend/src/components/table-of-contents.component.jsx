import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
    ListTree,
    ChevronUp,
    ArrowUp,
    Check,
    X,
    Share2,
    Clock,
    Hash,
    Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * Finds the DOM element corresponding to a TableOfContents heading item.
 * Supports BlockNote blocks (via [data-id]), standard HTML headings with ID,
 * and text-matched headings in both BlockNote and legacy Editor.js content.
 */
function findHeadingElement(heading) {
    if (typeof document === 'undefined') return null;

    // 1. Check for BlockNote block by unique blockId
    if (heading.blockId) {
        const el = document.querySelector(`[data-id="${heading.blockId}"]`);
        if (el) return el;
    }

    // 2. Check for explicit DOM id if present
    if (heading.id) {
        const el = document.getElementById(heading.id);
        if (el) return el;
    }

    // 3. Match by heading tag content in reader view
    const candidates = document.querySelectorAll(
        '.blocknote-reader-view [data-content-type="heading"], ' +
        '.blocknote-reader-view h1, .blocknote-reader-view h2, .blocknote-reader-view h3, ' +
        '.blog-page-content h1, .blog-page-content h2, .blog-page-content h3, .blog-page-content h4'
    );

    const targetText = heading.text.replace(/\s+/g, ' ').trim().toLowerCase();
    for (const el of candidates) {
        const candidateText = el.textContent?.replace(/\s+/g, ' ').trim().toLowerCase();
        if (candidateText && (candidateText === targetText || candidateText.includes(targetText))) {
            return el;
        }
    }

    return null;
}

export default function TableOfContents({
    content,
    isSidebar = false,
    readTimeMinutes = 1,
    onShare
}) {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const scrollRafRef = useRef(null);

    // ── 1. Extract headings from content or DOM fallback ────────────
    useEffect(() => {
        const extract = () => {
            const blocks = Array.isArray(content)
                ? (content[0]?.blocks || content)
                : (content?.blocks || []);

            const extracted = [];

            if (Array.isArray(blocks) && blocks.length > 0) {
                blocks.forEach((b, i) => {
                    // Editor.js header block
                    if (b.type === 'header' && b.data?.text) {
                        const text = b.data.text.replace(/<[^>]*>/g, '').trim();
                        if (text) {
                            const id = `heading-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                            extracted.push({
                                id,
                                blockId: b.id,
                                text,
                                level: Number(b.data.level) || 2,
                                index: i
                            });
                        }
                    }
                    // BlockNote heading block
                    else if (b.type === 'heading' && Array.isArray(b.content)) {
                        const text = b.content.map((c) => c.text || '').join('').trim();
                        if (text) {
                            const id = `heading-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                            extracted.push({
                                id,
                                blockId: b.id,
                                text,
                                level: Number(b.props?.level) || 1,
                                index: i
                            });
                        }
                    }
                });
            }

            // DOM Fallback if blocks had no explicit headings
            if (extracted.length === 0 && typeof document !== 'undefined') {
                const domHeadings = document.querySelectorAll(
                    '.blocknote-reader-view h1, .blocknote-reader-view h2, .blocknote-reader-view h3, ' +
                    '.blog-page-content h1, .blog-page-content h2, .blog-page-content h3'
                );
                domHeadings.forEach((el, i) => {
                    const text = el.textContent?.trim();
                    if (text) {
                        const tagLevel = el.tagName === 'H1' ? 1 : el.tagName === 'H2' ? 2 : 3;
                        const id = el.id || `heading-dom-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                        if (!el.id) el.id = id;
                        extracted.push({
                            id,
                            text,
                            level: tagLevel,
                            index: i
                        });
                    }
                });
            }

            // Standard TOC normalization: dynamically normalize depth relative to the shallowest heading
            if (extracted.length > 0) {
                const minLevel = Math.min(...extracted.map((h) => h.level || 2));
                const MAX_TOC_DEPTH = 2; // Depth 0 (Main topic), Depth 1 (Subtopic), Depth 2 (Detailed section)
                extracted.forEach((h) => {
                    const relativeDepth = (h.level || 2) - minLevel;
                    h.depth = Math.max(0, Math.min(relativeDepth, MAX_TOC_DEPTH));
                });
            }

            setHeadings(extracted);
            if (extracted.length > 0) {
                setActiveId(extracted[0].id);
            }
        };

        extract();
        const timer = setTimeout(extract, 400);
        return () => clearTimeout(timer);
    }, [content]);

    // ── 2. Scrollspy to track active heading & live scroll reading progress ─────
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleScroll = () => {
            if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
            scrollRafRef.current = requestAnimationFrame(() => {
                const scrollY = window.pageYOffset || document.documentElement.scrollTop;

                // Accurate real-time reading progress based on scroll position
                let pct = 0;
                const windowHeight = window.innerHeight || document.documentElement.clientHeight || 0;
                const docHeight = Math.max(
                    document.documentElement.scrollHeight,
                    document.body.scrollHeight,
                    document.documentElement.offsetHeight,
                    document.body.offsetHeight
                );
                const articleEl = document.querySelector('article') || document.querySelector('.blog-page-content');

                if (windowHeight + scrollY >= docHeight - 30) {
                    pct = 100;
                } else if (articleEl) {
                    const rect = articleEl.getBoundingClientRect();
                    const articleTop = rect.top + scrollY;
                    const articleHeight = articleEl.offsetHeight;

                    if (scrollY + windowHeight >= articleTop + articleHeight - 20) {
                        pct = 100;
                    } else {
                        const currentOffset = scrollY - (articleTop - 60);
                        if (currentOffset <= 0) {
                            pct = 0;
                        } else {
                            const effectiveScrollable = Math.max(1, articleHeight - (windowHeight * 0.4));
                            pct = Math.min(100, Math.max(0, Math.round((currentOffset / effectiveScrollable) * 100)));
                        }
                    }
                } else {
                    const maxScroll = docHeight - windowHeight;
                    if (maxScroll > 0) {
                        pct = Math.min(100, Math.max(0, Math.round((scrollY / maxScroll) * 100)));
                    }
                }
                setScrollProgress(pct);

                if (!headings.length) return;

                const offsetThreshold = 140;
                let currentActive = headings[0]?.id || '';
                for (let i = 0; i < headings.length; i++) {
                    const el = findHeadingElement(headings[i]);
                    if (el) {
                        const top = el.getBoundingClientRect().top + scrollY;
                        if (scrollY >= top - offsetThreshold) {
                            currentActive = headings[i].id;
                        } else {
                            break;
                        }
                    }
                }
                setActiveId(currentActive);
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
        };
    }, [headings]);

    // ── 3. Smooth scroll with offset & visual flash ────────────────
    const scrollToHeading = useCallback((heading) => {
        const el = findHeadingElement(heading);
        if (el) {
            const navOffset = 90;
            const rect = el.getBoundingClientRect();
            const targetY = (window.pageYOffset || document.documentElement.scrollTop) + rect.top - navOffset;

            window.scrollTo({
                top: Math.max(0, targetY),
                behavior: 'smooth'
            });

            setActiveId(heading.id);
            setMobileDrawerOpen(false);

            // Set hash in URL smoothly without jump
            if (window.history?.replaceState) {
                window.history.replaceState(null, '', `#${heading.id}`);
            }

            // Subtle highlight animation on the target section
            el.classList.add('ring-2', 'ring-purple/60', 'rounded-lg', 'transition-all', 'duration-500');
            setTimeout(() => {
                el.classList.remove('ring-2', 'ring-purple/60');
            }, 1400);
        }
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setMobileDrawerOpen(false);
    };

    const copySectionLink = (e, heading) => {
        e.stopPropagation();
        const url = `${window.location.origin}${window.location.pathname}#${heading.id}`;
        navigator.clipboard.writeText(url);
        setCopiedId(heading.id);
        toast.success(`Copied link to "${heading.text}"`, { duration: 1500 });
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Filter headings based on search query
    const filteredHeadings = useMemo(() => {
        if (!searchQuery.trim()) return headings;
        const q = searchQuery.toLowerCase().trim();
        return headings.filter((h) => h.text.toLowerCase().includes(q));
    }, [headings, searchQuery]);

    if (!headings.length) return null;

    const activeIndex = Math.max(0, headings.findIndex((h) => h.id === activeId));
    const activeHeading = headings[activeIndex] || headings[0];

    // ───────────────────────────────────────────────────────────────
    // DESKTOP SIDEBAR VARIANT:
    // Seamlessly integrated into page layout, no box border, full height
    // with top and bottom breathing room, search filter, and tree track.
    // ───────────────────────────────────────────────────────────────
    if (isSidebar) {
        return (
            <div className="w-full h-full flex flex-col justify-between py-1 text-foreground select-none">
                <div className="flex flex-col gap-3 min-h-0">
                    {/* Header Row: Clean, no enclosing card */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <ListTree className="w-4 h-4 text-purple" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                On This Page
                            </span>
                        </div>
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {headings.length} {headings.length === 1 ? 'topic' : 'topics'}
                        </span>
                    </div>

                    {/* Integrated Search Input (only when there are multiple topics) */}
                    {headings.length > 1 && (
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filter sections..."
                                className="w-full pl-8 pr-7 py-1.5 rounded-md bg-muted/35 hover:bg-muted/50 focus:bg-muted/70 border border-border/25 focus:border-purple/40 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Reading Progress Line */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Reading progress</span>
                            <span className="font-mono text-purple font-medium">{scrollProgress}%</span>
                        </div>
                        <div className="w-full h-0.5 bg-muted/60 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple transition-all duration-150 ease-out"
                                style={{ width: `${scrollProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Vertical Tree Navigation Track */}
                    <nav className="relative pl-3 border-l-2 border-border/50 space-y-0.5 overflow-y-auto pr-1 scrollbar-thin max-h-[calc(100vh-18rem)]">
                        {filteredHeadings.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic py-3 pl-1">
                                No matching sections
                            </p>
                        ) : (
                            filteredHeadings.map((h) => {
                                const isActive = activeId === h.id;
                                const isCopied = copiedId === h.id;

                                return (
                                    <div
                                        key={h.id}
                                        onClick={() => scrollToHeading(h)}
                                        className={`group relative w-full text-left py-1.5 px-2 rounded-md text-xs transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer ${
                                            h.depth === 2
                                                ? 'pl-5 text-[11px] text-muted-foreground/80'
                                                : h.depth === 1
                                                ? 'pl-3 text-[11.5px] font-normal text-muted-foreground'
                                                : 'pl-1.5 font-medium text-foreground'
                                        } ${
                                            isActive
                                                ? 'text-purple font-semibold bg-purple/10 -ml-[14px] pl-[12px] border-l-2 border-purple rounded-l-none'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                        }`}
                                        title={h.text}
                                    >
                                        <span className="truncate leading-snug flex-1" title={h.text}>
                                            {h.text}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={(e) => copySectionLink(e, h)}
                                            title="Copy link to section"
                                            className={`shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:text-purple ${
                                                isActive ? 'opacity-70 text-purple' : 'text-muted-foreground'
                                            }`}
                                        >
                                            {isCopied ? (
                                                <Check className="w-3 h-3 text-emerald-500" />
                                            ) : (
                                                <Hash className="w-3 h-3" />
                                            )}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="inline-flex items-center gap-1.5 hover:text-purple transition-colors cursor-pointer text-[11px] font-medium"
                    >
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span>Back to top</span>
                    </button>

                    <div className="flex items-center gap-2.5 text-[11px]">
                        {readTimeMinutes && (
                            <span className="flex items-center gap-1 text-muted-foreground/80">
                                <Clock className="w-3 h-3" />
                                <span>{readTimeMinutes}m read</span>
                            </span>
                        )}
                        {onShare && (
                            <button
                                type="button"
                                onClick={onShare}
                                title="Share article"
                                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ───────────────────────────────────────────────────────────────
    // MOBILE / TABLET VARIANT (Floating Drawer Trigger + Modal)
    // No redundant inline card above article text on mobile.
    // ───────────────────────────────────────────────────────────────
    return (
        <>
            {/* 1. Persistent Floating Quick-Nav Pill on Mobile */}
            <aside
                aria-label="Table of Contents Quick Navigation"
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 xl:hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
            >
                <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card/95 dark:bg-slate-900/95 backdrop-blur-xl border border-purple/30 shadow-2xl text-foreground text-xs font-medium cursor-pointer active:scale-95 transition-all hover:border-purple/50"
                    title="Open Table of Contents"
                >
                    <ListTree className="w-3.5 h-3.5 text-purple shrink-0" />
                    <span className="max-w-[170px] sm:max-w-[240px] truncate font-medium">
                        {activeHeading?.text || 'Contents'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-purple/15 text-purple text-[10px] font-mono font-bold shrink-0">
                        {activeIndex + 1}/{headings.length}
                    </span>
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
            </aside>

            {/* 2. Mobile Bottom Sheet Drawer Modal (with search filter) */}
            {mobileDrawerOpen && (
                <div className="fixed inset-0 z-50 xl:hidden">
                    {/* Backdrop overlay */}
                    <div
                        onClick={() => setMobileDrawerOpen(false)}
                        className="fixed inset-0 bg-background/70 backdrop-blur-sm transition-opacity"
                    />

                    {/* Bottom Sheet Modal Container */}
                    <div className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] bg-card dark:bg-slate-900 border-t border-border rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-250">
                        {/* Drawer Drag Handle bar */}
                        <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto mt-3 mb-1" />

                        {/* Drawer Header */}
                        <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-purple/10 text-purple flex items-center justify-center">
                                    <ListTree className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">
                                        Table of Contents
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground">
                                        Section {activeIndex + 1} of {headings.length}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileDrawerOpen(false)}
                                className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search Input in Mobile Drawer if multiple headings */}
                        {headings.length > 1 && (
                            <div className="px-4 pt-3 pb-1">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search sections..."
                                        className="w-full pl-8 pr-7 py-2 rounded-md bg-muted/35 hover:bg-muted/50 focus:bg-muted/70 border border-border/25 focus:border-purple/40 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* List of headings with comfortable mobile touch targets */}
                        <nav className="p-4 space-y-1 overflow-y-auto flex-1 overscroll-contain">
                            {filteredHeadings.map((h, i) => {
                                const isActive = activeId === h.id;
                                const numStr = String(i + 1).padStart(2, '0');
                                return (
                                    <button
                                        key={h.id}
                                        type="button"
                                        onClick={() => scrollToHeading(h)}
                                        title={h.text}
                                        className={`w-full min-h-[46px] text-left py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                            h.depth === 2
                                                ? 'pl-6 text-[11px]'
                                                : h.depth === 1
                                                ? 'pl-4 text-xs'
                                                : 'pl-2 text-xs font-medium'
                                        } ${
                                            isActive
                                                ? 'bg-purple/15 text-purple font-semibold shadow-xs'
                                                : 'text-foreground/80 hover:bg-muted/50 hover:text-foreground'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span
                                                className={`w-5 h-5 rounded-md text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                                                    isActive
                                                        ? 'bg-purple text-white'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {numStr}
                                            </span>
                                            <span className="truncate" title={h.text}>{h.text}</span>
                                        </div>

                                        {isActive && (
                                            <span className="flex items-center gap-1 text-purple text-[11px] font-medium shrink-0">
                                                <span>Active</span>
                                                <Check className="w-3.5 h-3.5" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Drawer Bottom Bar */}
                        <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs">
                            <button
                                type="button"
                                onClick={scrollToTop}
                                className="flex items-center gap-1.5 text-muted-foreground hover:text-purple font-medium transition-colors cursor-pointer"
                            >
                                <ArrowUp className="w-3.5 h-3.5" />
                                <span>Back to article top</span>
                            </button>
                            <span className="text-[11px] text-muted-foreground font-mono">
                                {scrollProgress}% read
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
