export const calculateReadTime = (content) => {
    let wordCount = 0;

    const countWords = (text) => {
        if (!text || typeof text !== 'string') return 0;
        const clean = text.replace(/<[^>]*>/g, '').trim();
        return clean.split(/\s+/).filter(Boolean).length;
    };

    if (typeof content === 'string') {
        wordCount = countWords(content);
    } else {
        const blocks = Array.isArray(content)
            ? (content[0]?.blocks || content)
            : (content?.blocks || []);

        if (Array.isArray(blocks)) {
            blocks.forEach((block) => {
                // Editor.js block format
                if (block.data?.text) {
                    wordCount += countWords(block.data.text);
                } else if (Array.isArray(block.data?.items)) {
                    block.data.items.forEach((item) => {
                        wordCount += countWords(item);
                    });
                }
                // BlockNote block format
                if (Array.isArray(block.content)) {
                    block.content.forEach((inline) => {
                        if (inline.text) wordCount += countWords(inline.text);
                    });
                }
            });
        }
    }

    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);

    return {
        words: wordCount,
        readTimeMinutes: Math.max(1, minutes),
        readTimeText: `${Math.max(1, minutes)} min read`
    };
};
