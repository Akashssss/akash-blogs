import React, { useContext, useState } from 'react';
import { UserContext } from '../App';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { BlogContext } from '../pages/blog.page';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export default function CommentField({ action, index = undefined, replyingTo = undefined, setReplying }) {
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext);
    const {
        blog,
        setBlog,
        blog: {
            _id,
            author: { _id: blog_author } = {},
            comments,
            comments: { results: commentsArr = [] } = {},
            activity,
            activity: { total_comments = 0, total_parent_comments = 0 } = {}
        } = {},
        totalParentCommentsLoaded,
        setTotalParentCommentsLoaded
    } = useContext(BlogContext);

    const handleComment = async () => {
        if (!access_token) {
            return toast.error("Please login first to leave a comment.");
        }
        if (!comment.trim().length) {
            return toast.error("Please write something before submitting.");
        }

        setIsSubmitting(true);
        try {
            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + '/add-comment',
                { _id, blog_author, comment, replying_to: replyingTo },
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                }
            );

            setComment('');

            data.commented_by = {
                personal_info: {
                    username,
                    profile_img,
                    fullname
                }
            };

            let newCommentArr;
            if (replyingTo && index !== undefined) {
                commentsArr[index].children = commentsArr[index].children || [];
                commentsArr[index].children.push(data._id);
                data.childrenLevel = (commentsArr[index].childrenLevel || 0) + 1;
                data.parentIndex = index;
                commentsArr[index].isReplyLoaded = true;
                commentsArr.splice(index + 1, 0, data);
                newCommentArr = [...commentsArr];
                if (setReplying) setReplying(false);
            } else {
                data.childrenLevel = 0;
                newCommentArr = [data, ...commentsArr];
            }

            const parentCommentIncrementVal = replyingTo ? 0 : 1;
            setBlog({
                ...blog,
                comments: { ...comments, results: newCommentArr },
                activity: {
                    ...activity,
                    total_comments: total_comments + 1,
                    total_parent_comments: total_parent_comments + parentCommentIncrementVal
                }
            });

            setTotalParentCommentsLoaded((prev) => prev + parentCommentIncrementVal);
            toast.success(replyingTo ? "Reply added!" : "Comment published!");
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-3">
            <Toaster />
            <textarea
                value={comment}
                placeholder={replyingTo ? 'Write your reply...' : 'What are your thoughts on this story?'}
                className="w-full rounded-2xl border border-input bg-background/60 p-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none h-28 leading-relaxed"
                onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end gap-2">
                {replyingTo && setReplying && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplying(false)}
                        className="rounded-xl text-xs"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="button"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={handleComment}
                    className="rounded-xl font-semibold text-xs px-5 gap-1.5"
                >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Posting..." : (action || "Comment")}</span>
                </Button>
            </div>
        </div>
    );
}
