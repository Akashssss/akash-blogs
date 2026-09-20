import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import AnimationWrapper from '../common/page-animation';
import { getDay } from '../common/date';
import BlogIntraction from '../components/blog-interaction.component';
import BlogPostCard from '../components/blog-post.component';
import BlogContent from '../components/blog-content.component';
import CommentsContainer, { fetchComments } from '../components/comments.component';
import ReadingProgressBar from '../components/reading-progress.component';
import TableOfContents from '../components/table-of-contents.component';
import BlockNoteRenderer from '../components/blocknote-renderer.component';
import { isBlockNoteContent } from '../utils/editorAdapter';
import { ThemeContext } from '../App';
import { Clock, Link as LinkIcon, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export const blogStructure = {
    title: '',
    des: '',
    content: [],
    author: {
        personal_info: {
            fullname: '',
            username: '',
            profile_img: ''
        }
    },
    banner: '',
    publishedAt: '',
    read_time: { minutes: 1 }
};

export const BlogContext = createContext({});

export default function BlogPage() {
    const { blog_id } = useParams();
    const [blog, setBlog] = useState(blogStructure);
    const [similarBlogs, setSimilarBlogs] = useState(null);
    const [copied, setCopied] = useState(false);
    const asideRef = useRef(null);
    const [sidebarLeft, setSidebarLeft] = useState(null);

    const {
        title,
        des,
        banner,
        content,
        author: { personal_info: { fullname, username: author_username, profile_img } = {} } = {},
        publishedAt,
        read_time
    } = blog;

    const [loading, setLoading] = useState(true);
    const [isLikedByUser, setLikedByUser] = useState(false);
    const [commentWrapper, setCommentWrapper] = useState(false);
    const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

    const fetchBlog = async () => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog`, { blog_id });
            data.blog.comments = await fetchComments({
                blog_id: data.blog._id,
                setParentCommentCountFun: setTotalParentCommentsLoaded
            });
            setBlog(data.blog);

            if (data.blog.tags && data.blog.tags.length) {
                const { data: similarBlogData } = await axios.post(
                    `${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`,
                    { tag: data.blog.tags[0], limit: 4, eliminateBlog: blog_id }
                );
                setSimilarBlogs(similarBlogData.blogs);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching blog:', error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        resetState();
        fetchBlog();
        window.scrollTo(0, 0);
    }, [blog_id]);

    useEffect(() => {
        const updateSidebarPos = () => {
            if (asideRef.current) {
                const rect = asideRef.current.getBoundingClientRect();
                if (rect.left > 0) {
                    setSidebarLeft(rect.left);
                }
            }
        };

        updateSidebarPos();
        window.addEventListener('resize', updateSidebarPos);
        const timer = setTimeout(updateSidebarPos, 200);
        return () => {
            window.removeEventListener('resize', updateSidebarPos);
            clearTimeout(timer);
        };
    }, [loading, content]);

    const resetState = () => {
        setBlog(blogStructure);
        setSimilarBlogs(null);
        setLoading(true);
        setLikedByUser(false);
        setTotalParentCommentsLoaded(0);
    };

    const copyShareLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('Article link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const { theme } = useContext(ThemeContext);
    const blocks = content?.blocks || (Array.isArray(content) && content[0]?.blocks) || [];
    const isBlockNote = isBlockNoteContent(content);
    const readTimeMinutes = read_time?.minutes || Math.max(1, Math.ceil((des?.length || 100) / 150));
    const initials = (fullname || author_username || 'U').slice(0, 2).toUpperCase();

    return (
        <div>
            <ReadingProgressBar />
            <AnimationWrapper>
                {loading ? (
                    <div className="max-w-[850px] center py-12 px-4 space-y-6">
                        <Skeleton className="h-12 w-4/5 rounded-xl" />
                        <Skeleton className="h-6 w-3/5 rounded-lg" />
                        <div className="flex items-center gap-3 py-4 border-y border-border">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="aspect-video w-full rounded-2xl" />
                        <div className="space-y-3 pt-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                        </div>
                    </div>
                ) : (
                    <BlogContext.Provider
                        value={{
                            blog,
                            setBlog,
                            isLikedByUser,
                            setLikedByUser,
                            commentWrapper,
                            setCommentWrapper,
                            totalParentCommentsLoaded,
                            setTotalParentCommentsLoaded
                        }}
                    >
                        <CommentsContainer />

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col xl:flex-row justify-center items-start gap-8 lg:gap-12 relative">
                            <article className="w-full max-w-4xl min-w-0 flex-1">
                                {/* Article Header */}
                                <header className="mb-8">
                                    <h1 className="text-3xl md:text-5xl font-bold font-inter leading-tight mb-6 text-foreground">
                                        {title}
                                    </h1>

                                    {des && (
                                        <p className="text-lg md:text-xl font-gelasio text-muted-foreground leading-relaxed mb-6">
                                            {des}
                                        </p>
                                    )}

                                    {/* Author and Meta bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border">
                                        <div className="flex items-center gap-3.5">
                                            <Link to={`/user/${author_username}`}>
                                                <Avatar className="w-12 h-12 ring-2 ring-purple/20 hover:ring-purple/50 duration-150">
                                                    <AvatarImage src={profile_img} alt={fullname || author_username} />
                                                    <AvatarFallback>{initials}</AvatarFallback>
                                                </Avatar>
                                            </Link>
                                            <div>
                                                <Link to={`/user/${author_username}`} className="font-semibold text-foreground hover:text-purple duration-150 block capitalize">
                                                    {fullname}
                                                </Link>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>Published {getDay(publishedAt)}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1 text-purple font-medium">
                                                        <Clock className="w-3 h-3" />
                                                        {readTimeMinutes} min read
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Social Share Links */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={copyShareLink}
                                                title="Copy link"
                                                className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground duration-150 cursor-pointer"
                                            >
                                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
                                            </button>
                                            <a
                                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Share on LinkedIn"
                                                className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-[#0A66C2] duration-150"
                                            >
                                                <i className="fi fi-brands-linkedin text-sm" />
                                            </a>
                                        </div>
                                    </div>
                                </header>

                                {/* Banner Image */}
                                {banner && (
                                    <div className="rounded-2xl overflow-hidden shadow-premium mb-8 bg-muted max-h-[460px]">
                                        <img src={banner} alt={title} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                {/* Top Interaction Bar */}
                                <BlogIntraction />

                                {/* Mobile / Tablet Inline Table of Contents */}
                                <div className="xl:hidden">
                                    <TableOfContents
                                        content={{ blocks }}
                                        readTimeMinutes={readTimeMinutes}
                                        onShare={copyShareLink}
                                    />
                                </div>

                                {/* Blog Content: Modern BlockNote or Legacy EditorJS */}
                                {isBlockNote ? (
                                    <BlockNoteRenderer blocks={blocks} theme={theme} />
                                ) : (
                                    <div className="my-10 font-gelasio blog-page-content text-foreground leading-relaxed">
                                        {blocks.map((block, i) => (
                                            <div key={i} className="my-4">
                                                <BlogContent block={block} />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Bottom Interaction Bar */}
                                <BlogIntraction />

                                {/* Similar Blogs Section */}
                                {similarBlogs && similarBlogs.length > 0 && (
                                    <div className="mt-16 pt-8 border-t border-border">
                                        <h2 className="text-2xl font-bold font-inter mb-8 text-foreground">
                                            More from this topic
                                        </h2>
                                        <div className="space-y-4">
                                            {similarBlogs.map((b, i) => (
                                                <AnimationWrapper key={b.blog_id || i} transition={{ duration: 0.4, delay: i * 0.05 }}>
                                                    <BlogPostCard content={b} author={b.author?.personal_info} />
                                                </AnimationWrapper>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </article>

                            {/* Desktop Fixed Right Sidebar Table of Contents */}
                            <aside ref={asideRef} className="hidden xl:block w-72 2xl:w-80 shrink-0">
                                <div
                                    style={sidebarLeft ? { left: `${sidebarLeft}px` } : undefined}
                                    className="fixed top-24 w-72 2xl:w-80 h-[calc(100vh-7.5rem)] pb-4 z-20"
                                >
                                    <TableOfContents
                                        content={{ blocks }}
                                        isSidebar={true}
                                        readTimeMinutes={readTimeMinutes}
                                        onShare={copyShareLink}
                                    />
                                </div>
                            </aside>
                        </div>
                    </BlogContext.Provider>
                )}
            </AnimationWrapper>
        </div>
    );
}
