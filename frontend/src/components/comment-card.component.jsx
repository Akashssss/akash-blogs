import React, { useContext, useState } from 'react';
import { getDay } from '../common/date';
import { UserContext } from '../App';
import toast from 'react-hot-toast';
import CommentField from './comment-field.component';
import { BlogContext } from '../pages/blog.page';
import axios from 'axios';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CornerDownRight, MessageSquare, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function CommentCard({ index, leftVal, commentData }) {
    const {
        commented_by: { personal_info: { profile_img, fullname, username: commented_by_username } = {} } = {},
        comment,
        commentedAt,
        _id,
        children = []
    } = commentData;

    const [isReplying, setReplying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { userAuth: { access_token, username } } = useContext(UserContext);
    const {
        blog,
        blog: {
            comments,
            activity,
            comments: { results: commentsArr = [] } = {},
            activity: { total_parent_comments = 0 } = {},
            author: { personal_info: { username: blog_author } = {} } = {}
        } = {},
        setBlog,
        setTotalParentCommentsLoaded
    } = useContext(BlogContext);

    const handleReplyClick = () => {
        if (!access_token) {
            return toast.error("Login first to leave a reply.");
        }
        setReplying((prev) => !prev);
    };

    const getParentIndex = () => {
        let startingPoint = index - 1;
        try {
            while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
                startingPoint--;
            }
        } catch (error) {
            startingPoint = undefined;
        }
        return startingPoint;
    };

    const removeCommentsCards = (startingPoint, isDelete = false) => {
        if (commentsArr[startingPoint]) {
            while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
                commentsArr.splice(startingPoint, 1);
                if (!commentsArr[startingPoint]) break;
            }
        }
        if (isDelete) {
            const parentIndex = getParentIndex();
            if (parentIndex !== undefined && commentsArr[parentIndex]) {
                commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(child => child !== _id);
                if (commentsArr[parentIndex].children.length === 0) {
                    commentsArr[parentIndex].isReplyLoaded = false;
                }
            }
            commentsArr.splice(index, 1);
        }
        if (commentData.childrenLevel === 0 && isDelete) {
            setTotalParentCommentsLoaded((prev) => prev - 1);
        }
        setBlog({
            ...blog,
            comments: { results: commentsArr },
            activity: {
                ...activity,
                total_parent_comments: total_parent_comments - (commentData.childrenLevel === 0 && isDelete ? 1 : 0)
            }
        });
    };

    const hideReplies = () => {
        commentData.isReplyLoaded = false;
        removeCommentsCards(index + 1);
    };

    const loadReplies = ({ skip = 0 }) => {
        if (children.length) {
            hideReplies();
            axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + '/get-replies',
                { _id, skip }
            ).then(({ data: { replies } }) => {
                commentData.isReplyLoaded = true;
                for (let i = 0; i < replies.length; i++) {
                    replies[i].childrenLevel = commentData.childrenLevel + 1;
                    commentsArr.splice(index + 1 + i + skip, 0, replies[i]);
                }
                setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
            }).catch((error) => {
                console.error("Error loading replies:", error);
            });
        }
    };

    const deleteComment = () => {
        setIsDeleting(true);
        axios.post(
            import.meta.env.VITE_SERVER_DOMAIN + '/delete-comment',
            { _id },
            { headers: { 'Authorization': `Bearer ${access_token}` } }
        ).then(() => {
            removeCommentsCards(index + 1, true);
            toast.success("Comment deleted.");
        }).catch((error) => {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete comment.");
        }).finally(() => {
            setIsDeleting(false);
        });
    };

    const initials = (fullname || commented_by_username || 'U').slice(0, 2).toUpperCase();

    // Standard capped nesting (prevents staircase squish on deep threads)
    const MAX_VISUAL_DEPTH = 3;
    const rawLevel = commentData.childrenLevel ?? leftVal ?? 0;
    const visualDepth = Math.min(rawLevel, MAX_VISUAL_DEPTH);
    const isDepthCapped = rawLevel >= MAX_VISUAL_DEPTH;

    const parentIndex = getParentIndex();
    const parentComment = parentIndex !== undefined && commentsArr[parentIndex] ? commentsArr[parentIndex] : null;
    const parentUsername = parentComment?.commented_by?.personal_info?.username;

    return (
        <div className="w-full relative" style={{ paddingLeft: `${visualDepth * 14}px` }}>
            <div className="my-3 p-4 rounded-2xl border border-border bg-card/60 hover:bg-card transition-all duration-150 relative">
                {visualDepth > 0 && (
                    <div className="absolute -left-3 top-6 w-3 h-0.5 bg-border" />
                )}

                {/* Replying-to context indicator when nested */}
                {rawLevel > 0 && parentUsername && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 mb-2.5 font-medium">
                        <CornerDownRight className="w-3 h-3 text-purple shrink-0" />
                        <span>
                            Replying to <span className="text-purple font-semibold">@{parentUsername}</span>
                        </span>
                        {isDepthCapped && rawLevel > 3 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-auto">
                                depth {rawLevel}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                        <Avatar className="w-7 h-7 ring-1 ring-border">
                            <AvatarImage src={profile_img} alt={commented_by_username} />
                            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <span className="font-semibold text-xs text-foreground">
                                {fullname || commented_by_username}
                            </span>
                            <span className="text-[11px] text-muted-foreground ml-1.5">
                                @{commented_by_username}
                            </span>
                        </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{getDay(commentedAt)}</span>
                </div>

                <p className="font-gelasio text-sm sm:text-base text-foreground my-2.5 leading-relaxed pl-1">
                    {comment}
                </p>

                <div className="flex items-center gap-3 pt-1 text-xs">
                    {children.length > 0 && (
                        commentData.isReplyLoaded ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={hideReplies}
                                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                            >
                                <ChevronUp className="w-3.5 h-3.5" />
                                <span>Hide replies</span>
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={loadReplies}
                                className="h-7 text-xs text-purple hover:bg-purple/10 gap-1 px-2"
                            >
                                <ChevronDown className="w-3.5 h-3.5" />
                                <span>{children.length} {children.length === 1 ? 'reply' : 'replies'}</span>
                            </Button>
                        )
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReplyClick}
                        className="h-7 text-xs text-muted-foreground hover:text-purple gap-1 px-2"
                    >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Reply</span>
                    </Button>

                    {(username === commented_by_username || username === blog_author) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={isDeleting}
                            onClick={deleteComment}
                            className="h-7 text-xs text-muted-foreground hover:text-red hover:bg-red/10 gap-1 px-2 ml-auto"
                        >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                        </Button>
                    )}
                </div>

                {isReplying && (
                    <div className="mt-4 pt-3 border-t border-border">
                        <CommentField
                            action="reply"
                            index={index}
                            replyingTo={_id}
                            setReplying={setReplying}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
