import React, { useContext } from 'react';
import { EditorContext } from '../pages/editor.pages';
import { X } from 'lucide-react';

export default function Tag({ tag, tagIndex }) {
  let { blog, blog: { tags }, setBlog } = useContext(EditorContext);

  const handleTagDelete = () => {
    const updatedTags = tags.filter(t => t !== tag);
    setBlog({ ...blog, tags: updatedTags });
  };

  const handleTagEdit = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();
      const currentTag = e.target.innerText.trim();
      if (currentTag.length > 0) {
        tags[tagIndex] = currentTag;
        setBlog({ ...blog, tags: [...tags] });
      } else {
        tags.splice(tagIndex, 1);
        setBlog({ ...blog, tags: [...tags] });
      }
      e.target.setAttribute("contentEditable", false);
    }
  };

  const addEditable = (e) => {
    e.target.setAttribute("contentEditable", true);
    e.target.focus();
  };

  return (
    <div className='relative py-1 px-3.5 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-full inline-flex items-center text-xs font-medium pr-7 transition-colors'>
      <span
        className='outline-none cursor-text'
        onKeyDown={handleTagEdit}
        onClick={addEditable}
      >
        {tag}
      </span>
      <button
        type="button"
        onClick={handleTagDelete}
        className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
        aria-label="Remove tag"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
