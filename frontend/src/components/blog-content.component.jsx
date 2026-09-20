import React from 'react';

const Img = ({ url, caption }) => {
    return (
        <div className="my-6">
            <div className="rounded-2xl overflow-hidden shadow-sm bg-muted">
                <img src={url} alt={caption || "Story visual"} className="w-full max-h-[600px] object-cover" />
            </div>
            {caption && caption.length > 0 && (
                <p
                    dangerouslySetInnerHTML={{ __html: caption }}
                    className='w-full text-center mt-2.5 text-xs text-muted-foreground italic'
                />
            )}
        </div>
    );
};

const Quote = ({ quote, caption }) => {
    return (
        <blockquote className='bg-purple/10 p-5 rounded-2xl border-l-4 border-purple my-6'>
            <p className='text-lg md:text-xl font-gelasio leading-relaxed text-foreground' dangerouslySetInnerHTML={{ __html: quote }} />
            {caption && caption.length > 0 && (
                <cite className='block w-full text-purple text-xs font-semibold mt-2 not-italic'
                    dangerouslySetInnerHTML={{ __html: `— ${caption}` }} />
            )}
        </blockquote>
    );
};

const List = ({ style, items = [] }) => {
    return (
        <ol className={`pl-6 my-4 space-y-2 ${style === 'ordered' ? "list-decimal" : "list-disc"}`}>
            {items.map((listItem, key) => (
                <li
                    key={key}
                    className='text-base text-foreground leading-relaxed'
                    dangerouslySetInnerHTML={{ __html: listItem }}
                />
            ))}
        </ol>
    );
};

export default function BlogContent({ block }) {
    const { type, data } = block;

    if (type === 'paragraph') {
        return <p className="my-4 text-base sm:text-lg leading-relaxed text-foreground font-gelasio" dangerouslySetInnerHTML={{ __html: data.text }} />;
    }
    if (type === "header") {
        if (data.level === 4) {
            return <h4 className='text-xl sm:text-2xl font-bold font-inter mt-8 mb-3 text-foreground' dangerouslySetInnerHTML={{ __html: data.text }} />;
        }
        if (data.level === 3) {
            return <h3 className='text-2xl sm:text-3xl font-bold font-inter mt-10 mb-4 text-foreground' dangerouslySetInnerHTML={{ __html: data.text }} />;
        }
        if (data.level === 2) {
            return <h2 className='text-3xl sm:text-4xl font-bold font-inter mt-12 mb-5 text-foreground' dangerouslySetInnerHTML={{ __html: data.text }} />;
        }
    }
    if (type === 'image') {
        return <Img url={data?.file?.url} caption={data?.caption} />;
    }
    if (type === 'quote') {
        return <Quote quote={data?.text} caption={data?.caption} />;
    }
    if (type === 'list') {
        return <List style={data?.style} items={data?.items} />;
    }
    if (type === 'code') {
        return (
            <pre className="p-4 my-6 rounded-2xl bg-muted border border-border font-mono text-sm overflow-x-auto text-foreground">
                <code>{data?.code}</code>
            </pre>
        );
    }

    return null;
}
