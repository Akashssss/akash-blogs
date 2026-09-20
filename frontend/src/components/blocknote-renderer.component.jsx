import React, { useMemo } from 'react';
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { blockSchema } from '../utils/blockSchema';

export default function BlockNoteRenderer({ blocks, theme }) {
    const validBlocks = useMemo(() => {
        if (!blocks || !Array.isArray(blocks) || !blocks.length) return undefined;
        return blocks;
    }, [blocks]);

    const editor = useCreateBlockNote({
        schema: blockSchema,
        initialContent: validBlocks,
    });

    if (editor && editor.isEditable) {
        editor.isEditable = false;
    }

    return (
        <div className="blocknote-reader-view my-8 w-full font-inter">
            <BlockNoteView
                editor={editor}
                editable={false}
                theme={theme === 'dark' ? 'dark' : 'light'}
            />
        </div>
    );
}
