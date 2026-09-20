/**
 * Shared BlockNote schema with all custom block types.
 * Import this in both the editor and the read-only renderer.
 */
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { MermaidBlock } from '../components/blocks/mermaid-block.jsx';
import { ExcalidrawBlock } from '../components/blocks/excalidraw-block.jsx';
import { VideoBlock } from '../components/blocks/video-block.jsx';
import { AlertBlock } from '../components/blocks/alert-block.jsx';

export const blockSchema = BlockNoteSchema.create({
    blockSpecs: {
        ...defaultBlockSpecs,
        mermaid: typeof MermaidBlock === 'function' ? MermaidBlock() : MermaidBlock,
        diagram: typeof ExcalidrawBlock === 'function' ? ExcalidrawBlock() : ExcalidrawBlock,
        video: typeof VideoBlock === 'function' ? VideoBlock() : VideoBlock,
        alert: typeof AlertBlock === 'function' ? AlertBlock() : AlertBlock,
    },
});
