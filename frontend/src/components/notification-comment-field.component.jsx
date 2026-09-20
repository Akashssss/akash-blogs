import React, { useContext, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { UserContext } from '../App';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { CornerDownRight, Send } from 'lucide-react';

export default function NotificationComment({ _id, blog_author, index = undefined, replyingTo = undefined, setReplying, notification_id, notificationData }) {
    const { _id: user_id } = blog_author || {};
    const { userAuth: { access_token } } = useContext(UserContext);
    const { notifications, notifications: { results }, setNotifications } = notificationData;
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComment = async () => {
        if (!comment.trim().length) {
            return toast.error("Write something to leave a reply.");
        }

        setIsSubmitting(true);
        try {
            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + '/add-comment',
                { _id, blog_author: user_id, comment, replying_to: replyingTo, notification_id },
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                }
            );

            setReplying(false);
            results[index].reply = { comment, _id: data._id };
            setNotifications({ ...notifications, results });
            setComment('');
            toast.success("Reply posted!");
        } catch (error) {
            console.error("Error replying to notification:", error);
            toast.error("Failed to post reply.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-4 p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
            <Toaster />
            <textarea
                value={comment}
                placeholder='Write a reply...'
                className="w-full rounded-xl border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none h-24"
                onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplying(false)}
                    className="rounded-xl text-xs"
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={handleComment}
                    className="rounded-xl text-xs gap-1.5"
                >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Replying..." : "Post Reply"}</span>
                </Button>
            </div>
        </div>
    );
}
