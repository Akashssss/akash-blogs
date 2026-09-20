import React, { useContext, useState } from 'react';
import AnimationWrapper from '../common/page-animation';
import { Toaster, toast } from 'react-hot-toast';
import { EditorContext } from '../pages/editor.pages';
import Tag from './tags.component';
import axios from 'axios';
import { UserContext } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Send, Eye, Sparkles } from 'lucide-react';
import { clearLocalDraft } from '../utils/draftManager';

export default function PublishForm() {
  const { blog_id } = useParams();
  const characterLimit = 200;
  const tagLimit = 10;
  const { userAuth: { access_token } } = useContext(UserContext);
  const navigate = useNavigate();
  const { blog, blog: { banner, title, tags = [], des = '', content }, setBlog, setEditorState } = useContext(EditorContext);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) e.preventDefault();
  };

  const handleBlogTitleChange = (e) => {
    setBlog({ ...blog, title: e.target.value });
  };

  const handleBlogDesChange = (e) => {
    setBlog({ ...blog, des: e.target.value });
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();
      const tag = e.target.value.trim();
      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        toast.error(`You can add maximum ${tagLimit} tags.`);
      }
      e.target.value = '';
    }
  };

  const publishBlog = async () => {
    if (isPublishing) return;
    if (!title || !title.trim().length) {
      return toast.error('Story title is required before publishing.');
    }
    if (!des || des.length > characterLimit) {
      return toast.error(`Description must be between 1 and ${characterLimit} characters.`);
    }
    if (!tags.length) {
      return toast.error('Add at least one topic tag to help readers discover your story.');
    }

    setIsPublishing(true);
    const TOAST_ID = "publish-story-action";
    toast.loading("Publishing story...", { id: TOAST_ID });

    const blogObj = {
      title,
      banner,
      des,
      content,
      tags,
      draft: false,
      banner_public_id: blog.banner_public_id || ''
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`,
        { ...blogObj, id: blog_id },
        {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        }
      );

      clearLocalDraft(blog_id);
      toast.success('Story published successfully! 🎉', { id: TOAST_ID });

      setTimeout(() => {
        navigate("/dashboard/blogs");
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Internal server error while publishing.', { id: TOAST_ID });
      console.error('Error publishing blog:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AnimationWrapper>
      <section className='w-full min-h-screen grid items-center lg:grid-cols-2 py-8 sm:py-12 px-4 sm:px-12 lg:gap-12 relative max-w-7xl mx-auto'>
        <Toaster />

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCloseEvent}
          className="w-10 h-10 rounded-full absolute right-3 top-3 sm:right-6 sm:top-6 z-20 hover:bg-muted"
          aria-label="Back to editor"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Story Preview Card */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-purple" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Story Card Preview
            </h3>
          </div>

          <Card className="rounded-3xl overflow-hidden border-border shadow-lg bg-card">
            <div className="aspect-[16/9] w-full bg-muted overflow-hidden">
              <img
                src={banner}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[11px] py-0">Preview</Badge>
                {tags[0] && (
                  <Badge variant="outline" className="text-[11px] py-0 capitalize">
                    {tags[0]}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold font-inter text-foreground leading-tight line-clamp-2">
                {title || "Untitled Story"}
              </h1>
              <p className="font-gelasio text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {des || "No story description provided yet."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Publishing Metadata Configuration */}
        <div className="space-y-6 pt-6 lg:pt-0 lg:pl-6 lg:border-l border-border">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5 ml-1">
              Story Title
            </label>
            <input
              type="text"
              placeholder="Story title"
              defaultValue={title}
              className="w-full rounded-xl border border-input bg-background/50 p-3.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onChange={handleBlogTitleChange}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Short Description (Search Summary)
              </label>
              <span className="text-xs text-muted-foreground font-mono">
                {characterLimit - des.length} left
              </span>
            </div>
            <textarea
              maxLength={characterLimit}
              defaultValue={des}
              rows={3}
              placeholder="Write a compelling snippet to introduce your story on feeds..."
              className="w-full rounded-xl border border-input bg-background/50 p-3.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none leading-relaxed"
              onChange={handleBlogDesChange}
              onKeyDown={handleTitleKeyDown}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Topic Tags (Press Enter or Comma to add)
              </label>
              <span className="text-xs text-muted-foreground font-mono">
                {tagLimit - tags.length} left
              </span>
            </div>

            <div className="rounded-2xl border border-input bg-background/50 p-3 space-y-3">
              <input
                type="text"
                placeholder="Add a topic (e.g., tech, design, ai)..."
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground outline-none"
                onKeyDown={handleKeyDown}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                  {tags.map((tag, i) => (
                    <Tag tag={tag} tagIndex={i} key={i} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={publishBlog}
              disabled={isPublishing}
              className="w-full h-11 text-sm font-semibold rounded-xl bg-purple hover:bg-purple/90 text-white gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>{isPublishing ? "Publishing Story..." : "Publish Now"}</span>
            </Button>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
}
