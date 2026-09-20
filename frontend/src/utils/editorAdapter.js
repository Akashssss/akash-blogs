/**
 * Editor Data Adapter:
 * Provides seamless bidirectional conversion and detection between
 * legacy Editor.js blocks and modern BlockNote document blocks.
 */

export function isBlockNoteContent(content) {
    if (!content) return false;

    // Check if explicitly formatted as blocknote
    if (content.format === 'blocknote') return true;

    // Unwrap array wrapping if stored as [ { blocks: [...] } ]
    const data = Array.isArray(content) && content.length === 1 && content[0]?.blocks
        ? content[0]
        : content;

    const blocks = Array.isArray(data) ? data : data?.blocks;
    if (!Array.isArray(blocks) || blocks.length === 0) return false;

    // A block is BlockNote if it has 'content' array or 'props' object rather than Editor.js 'data' object
    const firstBlock = blocks[0];
    if (firstBlock && (Array.isArray(firstBlock.content) || (firstBlock.props && !firstBlock.data))) {
        return true;
    }

    return false;
}

export function extractBlocks(content) {
    if (!content) return [];
    if (Array.isArray(content)) {
        if (content.length === 1 && content[0]?.blocks) return content[0].blocks;
        return content;
    }
    if (content.blocks && Array.isArray(content.blocks)) {
        return content.blocks;
    }
    return [];
}

/**
 * Converts legacy Editor.js blocks to BlockNote-compatible blocks
 */
export function editorJsToBlockNote(content) {
    const rawBlocks = extractBlocks(content);
    if (!rawBlocks.length) return undefined;

    // If already BlockNote, return directly
    if (isBlockNoteContent(content)) {
        return rawBlocks;
    }

    const converted = [];

    rawBlocks.forEach((block) => {
        const { type, data } = block;
        if (!data) return;

        switch (type) {
            case 'paragraph': {
                const cleanText = (data.text || '').replace(/<[^>]*>/g, '');
                converted.push({
                    type: 'paragraph',
                    content: cleanText ? [{ type: 'text', text: cleanText, styles: {} }] : [],
                });
                break;
            }

            case 'header': {
                const cleanText = (data.text || '').replace(/<[^>]*>/g, '');
                const level = data.level ? Math.min(3, Math.max(1, data.level === 1 ? 1 : data.level === 2 ? 1 : data.level === 3 ? 2 : 3)) : 2;
                converted.push({
                    type: 'heading',
                    props: { level },
                    content: cleanText ? [{ type: 'text', text: cleanText, styles: {} }] : [],
                });
                break;
            }

            case 'list': {
                const isOrdered = data.style === 'ordered';
                const items = Array.isArray(data.items) ? data.items : [];
                items.forEach((itemText) => {
                    const cleanText = (itemText || '').replace(/<[^>]*>/g, '');
                    converted.push({
                        type: isOrdered ? 'numberedListItem' : 'bulletListItem',
                        content: cleanText ? [{ type: 'text', text: cleanText, styles: {} }] : [],
                    });
                });
                break;
            }

            case 'quote': {
                const quoteText = (data.text || '').replace(/<[^>]*>/g, '');
                const caption = (data.caption || '').replace(/<[^>]*>/g, '');
                converted.push({
                    type: 'paragraph',
                    content: [{
                        type: 'text',
                        text: `“${quoteText}”${caption ? ` — ${caption}` : ''}`,
                        styles: { italic: true },
                    }],
                });
                break;
            }

            case 'image': {
                const url = data.file?.url || data.url;
                if (url) {
                    converted.push({
                        type: 'image',
                        props: {
                            url,
                            caption: data.caption || '',
                        },
                    });
                }
                break;
            }

            case 'code': {
                converted.push({
                    type: 'codeBlock',
                    props: { language: 'javascript' },
                    content: data.code ? [{ type: 'text', text: data.code, styles: {} }] : [],
                });
                break;
            }

            default: {
                if (data.text) {
                    converted.push({
                        type: 'paragraph',
                        content: [{ type: 'text', text: data.text.replace(/<[^>]*>/g, ''), styles: {} }],
                    });
                }
                break;
            }
        }
    });

    return converted.length ? converted : undefined;
}

/**
 * Checks if the BlockNote document has meaningful author text
 */
export function hasMeaningfulContent(blocks) {
    if (!blocks || !blocks.length) return false;
    // Block types that are always meaningful on their own
    const MEDIA_TYPES = new Set(['image', 'video', 'table', 'mermaid', 'diagram', 'alert']);
    for (const b of blocks) {
        if (MEDIA_TYPES.has(b.type)) return true;
        if (Array.isArray(b.content) && b.content.length > 0) {
            const hasText = b.content.some((c) => c.text && c.text.trim().length > 0);
            if (hasText) return true;
        }
    }
    return false;
}

/**
 * Calculates live word count and reading time for BlockNote document blocks
 */
export function calculateDocumentStats(blocks) {
    if (!Array.isArray(blocks)) return { words: 0, readTime: 1 };
    let words = 0;
    blocks.forEach((block) => {
        if (Array.isArray(block.content)) {
            block.content.forEach((item) => {
                if (item.text) {
                    const count = item.text.trim().split(/\s+/).filter(Boolean).length;
                    words += count;
                }
            });
        }
    });
    const readTime = Math.max(1, Math.ceil(words / 200));
    return { words, readTime };
}

