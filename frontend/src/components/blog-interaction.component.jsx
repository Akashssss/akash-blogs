import React, { useContext, useEffect, useState } from 'react';
import { BlogContext } from '../pages/blog.page';
import { Link } from 'react-router-dom';
import { UserContext } from '../App';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import { Heart, MessageSquare, Edit3, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function BlogIntraction() {
    const {
        blog,
        blog: {
            title,
            _id,
            blog_id,
            activity,
            activity: { total_likes = 0, total_comments = 0 } = {},
            author: { personal_info: { username: author_username } = {} } = {}
        } = {},
        setBlog,
        isLikedByUser,
        setLikedByUser,
        commentWrapper,
        setCommentWrapper
    } = useContext(BlogContext);

    const { userAuth: { username, access_token } } = useContext(UserContext);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (access_token && _id) {
            axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + '/isLiked-by-user',
                { _id },
                { headers: { 'Authorization': `Bearer ${access_token}` } }
            ).then(({ data: { result } }) => {
                setLikedByUser(Boolean(result));
            }).catch((err) => {
                console.error('Error checking like status:', err);
            });
        }
    }, [_id, access_token]);

    const handleLike = async () => {
        if (!access_token) {
            return toast.error("Please login to like this story.");
        }

        try {
            const nextLikedState = !isLikedByUser;
            setLikedByUser(nextLikedState);
            const newTotalLikes = nextLikedState ? total_likes + 1 : Math.max(0, total_likes - 1);

            setBlog({
                ...blog,
                activity: { ...activity, total_likes: newTotalLikes }
            });

            await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + '/like_blog',
                { _id, isLikedByUser: nextLikedState },
                { headers: { 'Authorization': `Bearer ${access_token}` } }
            );
        } catch (error) {
            console.error("Error liking blog:", error);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Story link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <TooltipProvider delayDuration={150}>
            <Toaster />
            <div className="py-3 border-y border-border my-8 flex items-center justify-between gap-4">
                {/* Likes & Comments */}
                <div className="flex items-center gap-3">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLike}
                                className={`rounded-full px-3 h-9 gap-1.5 transition-all ${
                                    isLikedByUser
                                        ? "text-rose-500 bg-rose-500/10 hover:bg-rose-500/20"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Heart className={`w-4 h-4 ${isLikedByUser ? "fill-rose-500" : ""}`} />
                                <span className="text-xs font-semibold">{total_likes}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isLikedByUser ? "Unlike story" : "Like story"}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCommentWrapper((prev) => !prev)}
                                className="rounded-full px-3 h-9 gap-1.5 text-muted-foreground hover:text-foreground"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-xs font-semibold">{total_comments}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>View discussion</TooltipContent>
                    </Tooltip>
                </div>

                {/* Sharing and Author Actions */}
                <div className="flex items-center gap-2">
                    {username === author_username && (
                        <Button asChild variant="outline" size="sm" className="rounded-xl h-8 text-xs gap-1.5 border-border">
                            <Link to={`/editor/${blog_id}`}>
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Story</span>
                            </Link>
                        </Button>
                    )}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCopyLink}
                                className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{copied ? "Copied!" : "Copy story link"}</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}
