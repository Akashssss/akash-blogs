import React, { useEffect, useState } from 'react';

export default function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
            const windowHeight = window.innerHeight || document.documentElement.clientHeight || 0;
            const docHeight = Math.max(
                document.documentElement.scrollHeight,
                document.body.scrollHeight,
                document.documentElement.offsetHeight,
                document.body.offsetHeight
            );

            // 1. If user scrolled to (or within 30px of) the bottom of the page -> 100%
            if (windowHeight + scrollY >= docHeight - 30) {
                setProgress(100);
                return;
            }

            // 2. Measure progress through the article content
            const article = document.querySelector('article') || document.querySelector('.blog-page-content');
            if (article) {
                const rect = article.getBoundingClientRect();
                const articleTop = rect.top + scrollY;
                const articleHeight = article.offsetHeight;

                // When user reaches or scrolls past the end of the article (or bottom interaction bar)
                if (scrollY + windowHeight >= articleTop + articleHeight - 20) {
                    setProgress(100);
                    return;
                }

                // If reader hasn't reached the article content yet
                const currentOffset = scrollY - (articleTop - 60);
                if (currentOffset <= 0) {
                    setProgress(0);
                    return;
                }

                const effectiveScrollable = Math.max(1, articleHeight - (windowHeight * 0.4));
                const pct = Math.min(100, Math.max(0, Math.round((currentOffset / effectiveScrollable) * 100)));
                setProgress(pct);
                return;
            }

            // 3. Fallback to document scroll height
            const maxScroll = docHeight - windowHeight;
            if (maxScroll > 0) {
                const pct = Math.min(100, Math.max(0, Math.round((scrollY / maxScroll) * 100)));
                setProgress(pct);
            }
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress, { passive: true });
        updateProgress();

        return () => {
            window.removeEventListener('scroll', updateProgress);
            window.removeEventListener('resize', updateProgress);
        };
    }, []);

    if (progress <= 0) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-50 pointer-events-none bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-purple via-indigo-500 to-pink-500 transition-all duration-150 shadow-glow"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
