import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDay } from '../common/date';
import NotificationCommentField from './notification-comment-field.component';
import { UserContext } from '../App';
import axios from 'axios';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, CornerDownRight, Trash2 } from 'lucide-react';

export default function NotificationCard({ data, index, notificationState }) {
  const [isReplying, setReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    seen,
    reply,
    createdAt,
    comment,
    replied_on_comment,
    type,
    user,
    user: { personal_info: { fullname, username, profile_img } = {} } = {},
    blog: { _id, blog_id, title } = {},
    _id: notification_id
  } = data;

  const { userAuth: { username: author_username, profile_img: author_profile_img, access_token } } = useContext(UserContext);
  const { notifications, notifications: { results, totalDocs }, setNotifications } = notificationState;

  const handleReplyClick = () => {
    setReplying((prev) => !prev);
  };

  const handleDelete = (comment_id, deleteType) => {
    setIsDeleting(true);
    axios.post(
      `${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`,
      { _id: comment_id },
      {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      }
    ).then(() => {
      setNotifications((prev) => {
        if (!prev) return prev;
        const currentResults = prev.results || [];
        let updatedResults;
        if (deleteType === 'comment') {
          updatedResults = currentResults.filter((_, i) => i !== index);
        } else {
          updatedResults = currentResults.map((item, i) => {
            if (i === index) {
              const { reply: _, ...rest } = item;
              return rest;
            }
            return item;
          });
        }
        return {
          ...prev,
          results: updatedResults,
          totalDocs: Math.max(0, (prev.totalDocs || 1) - 1),
          deleteDocCount: (prev.deleteDocCount || 0) + 1
        };
      });
    }).catch(err => {
      console.error("Failed to delete comment:", err);
    }).finally(() => {
      setIsDeleting(false);
    });
  };

  const initials = (fullname || username || 'U').slice(0, 2).toUpperCase();
  const authorInitials = (author_username || 'U').slice(0, 2).toUpperCase();

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-150 mb-3 ${
      !seen ? "bg-purple/5 border-purple/20" : "bg-card border-border"
    }`}>
      <div className="flex items-start gap-4">
        <Avatar className="w-10 h-10 ring-1 ring-border">
          <AvatarImage src={profile_img} alt={username} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/user/${username}`} className="font-semibold text-sm text-foreground hover:text-purple transition-colors">
              {fullname || username}
            </Link>
            <span className="text-xs text-muted-foreground">@{username}</span>

            {/* Notification Type Badge */}
            {type === 'like' && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0 px-2 text-rose-500 bg-rose-500/10">
                <Heart className="w-3 h-3 fill-rose-500" />
                <span>liked your story</span>
              </Badge>
            )}
            {type === 'comment' && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0 px-2 text-blue-500 bg-blue-500/10">
                <MessageSquare className="w-3 h-3" />
                <span>commented on</span>
              </Badge>
            )}
            {type === 'reply' && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0 px-2 text-purple bg-purple/10">
                <CornerDownRight className="w-3 h-3" />
                <span>replied to you</span>
              </Badge>
            )}

            <span className="text-xs text-muted-foreground ml-auto">{getDay(createdAt)}</span>
          </div>

          {/* Story Title reference */}
          {type === 'reply' && replied_on_comment ? (
            <div className="p-3 my-2 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground italic">
              "{replied_on_comment.comment}"
            </div>
          ) : (
            <Link to={`/blog/${blog_id}`} className="inline-block text-xs font-medium text-muted-foreground hover:text-purple duration-150 line-clamp-1 mt-1">
              "{title}"
            </Link>
          )}

          {/* User Comment content */}
          {type !== 'like' && comment && (
            <p className="font-gelasio text-base text-foreground my-3 leading-relaxed">
              {comment.comment}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {type !== 'like' && !reply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReplyClick}
                className="h-8 text-xs text-purple hover:bg-purple/10 rounded-lg gap-1 px-2.5"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>Reply</span>
              </Button>
            )}

            {type !== 'like' && comment && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                onClick={() => handleDelete(comment._id, "comment")}
                className="h-8 text-xs text-muted-foreground hover:text-red hover:bg-red/10 rounded-lg gap-1 px-2.5 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Reply Field */}
      {isReplying && (
        <NotificationCommentField
          _id={_id}
          blog_author={user}
          index={index}
          replyingTo={comment?._id}
          setReplying={setReplying}
          notification_id={notification_id}
          notificationData={notificationState}
        />
      )}

      {/* Existing Reply if already replied */}
      {reply && (
        <div className="ml-10 mt-3 p-4 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-5 h-5 ring-1 ring-border">
              <AvatarImage src={author_profile_img} alt={author_username} />
              <AvatarFallback className="text-[9px]">{authorInitials}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-foreground">
              @{author_username}
            </span>
            <span className="text-[11px] text-muted-foreground">replied</span>
          </div>
          <p className="font-gelasio text-sm text-foreground mb-2">
            {reply.comment}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(reply._id, "reply")}
            className="h-7 text-xs text-muted-foreground hover:text-red hover:bg-red/10 rounded-md p-1 px-2"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            <span>Delete reply</span>
          </Button>
        </div>
      )}
    </div>
  );
}
