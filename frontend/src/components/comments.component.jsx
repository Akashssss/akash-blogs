import React, { useContext } from 'react';
import { BlogContext } from '../pages/blog.page';
import CommentField from './comment-field.component';
import axios from 'axios';
import NoDataMessage from './nodata.component';
import AnimationWrapper from '../common/page-animation';
import CommentCard from './comment-card.component';
import { Button } from '@/components/ui/button';
import { X, MessageSquare } from 'lucide-react';

export const fetchComments = async ({ skip = 0, blog_id, setParentCommentCountFun, comments_arr = [] }) => {
  let res;
  try {
    const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-blog-comments', { blog_id, skip });
    data.forEach((comment) => {
      comment.childrenLevel = 0;
    });
    setParentCommentCountFun((prevVal) => prevVal + data.length);
    if (comments_arr == null) {
      res = { results: data };
    } else {
      res = { results: [...comments_arr, ...data] };
    }
    return res;
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
  return res;
};

export default function CommentsContainer() {
  const {
    blog: {
      _id,
      title,
      comments: { results: commentsArr = [] } = {},
      activity: { total_parent_comments = 0 } = {}
    } = {},
    commentWrapper,
    setCommentWrapper,
    totalParentCommentsLoaded,
    setTotalParentCommentsLoaded,
    blog,
    setBlog
  } = useContext(BlogContext);

  const loadMoreComments = async () => {
    const newCommentsArr = await fetchComments({
      skip: totalParentCommentsLoaded,
      blog_id: _id,
      setParentCommentCountFun: setTotalParentCommentsLoaded,
      comments_arr: commentsArr
    });
    setBlog({ ...blog, comments: newCommentsArr });
  };

  // Lock body scroll and handle Escape key when comments drawer is open
  React.useEffect(() => {
    if (commentWrapper) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setCommentWrapper(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [commentWrapper, setCommentWrapper]);

  return (
    <>
      {/* Backdrop overlay */}
      {commentWrapper && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 duration-200"
          onClick={() => setCommentWrapper(false)}
        />
      )}

      {/* Slide-over comments panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] md:w-[460px] z-50 bg-card text-card-foreground shadow-2xl p-6 sm:p-8 flex flex-col transition-transform duration-300 ease-in-out border-l border-border ${
          commentWrapper ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-purple" />
            <div>
              <h2 className="text-lg font-bold font-inter text-foreground">
                Responses
              </h2>
              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">
                {title}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommentWrapper(false)}
            className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Close discussion panel"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
          {/* New Comment Input */}
          <CommentField action="Post Response" />

          <div className="pt-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Discussion ({commentsArr.length})
            </h3>

            {commentsArr && commentsArr.length ? (
              commentsArr.map((comment, i) => (
                <AnimationWrapper key={comment._id || i}>
                  <CommentCard
                    index={i}
                    leftVal={comment.childrenLevel * 1}
                    commentData={comment}
                  />
                </AnimationWrapper>
              ))
            ) : (
              <NoDataMessage
                message="No responses yet"
                description="Be the first to share your thoughts on this story."
              />
            )}

            {total_parent_comments > totalParentCommentsLoaded && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMoreComments}
                  className="rounded-full text-xs font-semibold"
                >
                  Load More Responses
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
