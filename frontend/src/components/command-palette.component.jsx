import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    FileText,
    PenSquare,
    Bell,
    LayoutDashboard,
    User,
    Moon,
    Sun,
    ArrowRight,
    X
} from 'lucide-react';
import { ThemeContext, UserContext } from '../App';

export default function CommandPalette({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const { theme, setTheme } = useContext(ThemeContext);
    const { userAuth: { access_token, username } } = useContext(UserContext);

    const quickLinks = [
        { label: 'Home Feed', icon: FileText, action: () => navigate('/') },
        { label: 'Write New Story', icon: PenSquare, action: () => navigate('/editor') },
        ...(access_token ? [
            { label: 'Studio Analytics', icon: LayoutDashboard, action: () => navigate('/dashboard/analytics') },
            { label: 'My Stories', icon: FileText, action: () => navigate('/dashboard/blogs') },
            { label: 'Notifications', icon: Bell, action: () => navigate('/dashboard/notifications') },
            { label: 'Public Profile', icon: User, action: () => navigate(`/user/${username}`) },
        ] : []),
        {
            label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`,
            icon: theme === 'light' ? Moon : Sun,
            action: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
        }
    ];

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Live blog search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs?query=${encodeURIComponent(query)}&limit=5`);
                setResults(data.blogs || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const totalItems = (query.trim() ? 1 : 0) + (results.length > 0 ? results.length : quickLinks.length);
            setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalItems));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const totalItems = (query.trim() ? 1 : 0) + (results.length > 0 ? results.length : quickLinks.length);
            setSelectedIndex((prev) => (prev - 1 + totalItems) % Math.max(1, totalItems));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (query.trim() && selectedIndex === 0) {
                navigate(`/search/${encodeURIComponent(query.trim())}`);
                onClose();
                return;
            }
            const offset = query.trim() ? 1 : 0;
            const targetIndex = selectedIndex - offset;
            if (results.length > 0 && results[targetIndex]) {
                navigate(`/blog/${results[targetIndex].blog_id}`);
                onClose();
            } else if (quickLinks[targetIndex >= 0 ? targetIndex : selectedIndex]) {
                quickLinks[targetIndex >= 0 ? targetIndex : selectedIndex].action();
                onClose();
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-fadeIn" onClick={onClose}>
            <div
                className="w-full max-w-xl bg-card text-card-foreground rounded-2xl border border-border shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                {/* Search Bar Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type to search stories, topics, or quick actions..."
                        className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono border border-border">ESC</span>
                </div>

                {/* Results / Navigation list */}
                <div className="max-h-80 overflow-y-auto p-2">
                    {loading && (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                            Searching stories...
                        </div>
                    )}

                    {query.trim() && (
                        <div
                            onClick={() => {
                                navigate(`/search/${encodeURIComponent(query.trim())}`);
                                onClose();
                            }}
                            className={`flex items-center justify-between gap-3 px-3 py-2.5 mb-2 rounded-xl cursor-pointer duration-150 ${
                                selectedIndex === 0 ? 'bg-purple/15 text-purple font-medium' : 'hover:bg-muted text-foreground'
                            }`}
                        >
                            <div className="flex items-center gap-2.5 truncate">
                                <Search className="w-4 h-4 flex-shrink-0 text-purple" />
                                <span className="truncate text-sm">
                                    Search all stories & tags for <span className="font-semibold underline underline-offset-2">"{query.trim()}"</span>
                                </span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                        </div>
                    )}

                    {!loading && query.trim() && results.length === 0 && (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                            No quick title matches. Press <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border">Enter</kbd> to search full articles & topics.
                        </div>
                    )}

                    {/* Blog Results */}
                    {results.length > 0 && (
                        <div className="mb-2">
                            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Stories</div>
                            {results.map((blog, idx) => (
                                <div
                                    key={blog.blog_id}
                                    onClick={() => {
                                        navigate(`/blog/${blog.blog_id}`);
                                        onClose();
                                    }}
                                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer duration-150 ${
                                        selectedIndex === (idx + 1) ? 'bg-purple/15 text-purple font-medium' : 'hover:bg-muted text-foreground'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 truncate">
                                        <FileText className="w-4 h-4 flex-shrink-0 text-purple" />
                                        <span className="truncate text-sm">{blog.title}</span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Action Links */}
                    {(!query.trim() || results.length === 0) && (
                        <div>
                            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</div>
                            {quickLinks.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.label}
                                        onClick={() => {
                                            item.action();
                                            onClose();
                                        }}
                                        className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer duration-150 ${
                                            selectedIndex === idx ? 'bg-purple/15 text-purple font-medium' : 'hover:bg-muted text-foreground'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className="w-4 h-4 text-purple" />
                                            <span className="text-sm">{item.label}</span>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer hints */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground">
                    <span>Navigate with <kbd className="font-mono bg-muted px-1 py-0.5 rounded border border-border">↑</kbd> <kbd className="font-mono bg-muted px-1 py-0.5 rounded border border-border">↓</kbd></span>
                    <span>Select with <kbd className="font-mono bg-muted px-1 py-0.5 rounded border border-border">↵</kbd></span>
                </div>
            </div>
        </div>
    );
}
