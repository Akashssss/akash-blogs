/**
 * Local Draft Storage Manager
 * Ensures zero data loss when refreshing the browser or navigating away.
 */

const DRAFT_PREFIX = 'mernblog_local_draft_';

export function getDraftKey(blog_id) {
    return `${DRAFT_PREFIX}${blog_id || 'new'}`;
}

export function getLocalDraft(blog_id) {
    try {
        const key = getDraftKey(blog_id);
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed;
    } catch (e) {
        console.warn('Failed to read local draft:', e);
        return null;
    }
}

export function saveLocalDraft(blog_id, draftData) {
    try {
        if (!draftData) return;
        const key = getDraftKey(blog_id);
        const payload = {
            ...draftData,
            blog_id: blog_id || null,
            savedAt: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
        console.warn('Failed to save local draft:', e);
    }
}

export function clearLocalDraft(blog_id) {
    try {
        const key = getDraftKey(blog_id);
        localStorage.removeItem(key);
    } catch (e) {
        console.warn('Failed to clear local draft:', e);
    }
}

export function hasMeaningfulDraft(draft) {
    if (!draft) return false;
    if (draft.title && draft.title.trim().length > 0) return true;
    if (draft.banner && draft.banner.trim().length > 0) return true;
    if (draft.des && draft.des.trim().length > 0) return true;

    // Check content blocks
    const content = draft.content;
    const blocks = Array.isArray(content)
        ? (content[0]?.blocks || content)
        : (content?.blocks || []);

    if (Array.isArray(blocks) && blocks.length > 0) {
        // If there's more than one block, or one block with actual text/props
        if (blocks.length > 1) return true;
        const first = blocks[0];
        if (first?.type && first.type !== 'paragraph') return true;
        if (Array.isArray(first?.content) && first.content.length > 0) {
            return first.content.some((c) => c.text && c.text.trim().length > 0);
        }
    }
    return false;
}
