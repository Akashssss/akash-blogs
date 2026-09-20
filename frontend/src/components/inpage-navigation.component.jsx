import React, { useEffect, useRef, useState, useCallback } from 'react';

// Maintained for backwards compatibility if referenced
export let activeTabLineRef = { current: null };
export let activeTabRef = { current: null };

export default function InPageNavigation({
    routes = [],
    defaultHidden = [],
    defaultActiveIndex = 0,
    children
}) {
    const [inPageNavIndex, setInpageNavIndex] = useState(defaultActiveIndex);
    const tabsRef = useRef([]);
    const lineRef = useRef(null);
    const containerRef = useRef(null);

    // Sync state if defaultActiveIndex changes externally (e.g. URL query params)
    useEffect(() => {
        setInpageNavIndex(defaultActiveIndex);
    }, [defaultActiveIndex]);

    const updateIndicator = useCallback((index) => {
        const activeBtn = tabsRef.current[index];
        if (activeBtn && lineRef.current) {
            lineRef.current.style.width = `${activeBtn.offsetWidth}px`;
            lineRef.current.style.left = `${activeBtn.offsetLeft}px`;
        }
    }, []);

    // Reposition line when index or routes change
    useEffect(() => {
        updateIndicator(inPageNavIndex);
    }, [inPageNavIndex, routes, updateIndicator]);

    // Handle container/window resizes without resetting active tab
    useEffect(() => {
        const handleResize = () => updateIndicator(inPageNavIndex);
        window.addEventListener('resize', handleResize);

        let resizeObserver;
        if (containerRef.current && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => updateIndicator(inPageNavIndex));
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [inPageNavIndex, updateIndicator]);

    const handleTabClick = (i) => {
        setInpageNavIndex(i);
        updateIndicator(i);
    };

    return (
        <>
            <div
                ref={containerRef}
                className='relative mb-6 sm:mb-8 bg-background border-border border-b flex flex-nowrap overflow-x-auto scrollbar-none'
            >
                {routes.map((route, i) => {
                    const isActive = inPageNavIndex === i;
                    return (
                        <button
                            ref={(el) => {
                                tabsRef.current[i] = el;
                                if (i === defaultActiveIndex) activeTabRef.current = el;
                            }}
                            className={`py-3.5 px-4 sm:px-5 capitalize text-sm transition-colors duration-150 whitespace-nowrap shrink-0 ${
                                isActive
                                    ? 'text-foreground font-semibold'
                                    : 'text-muted-foreground hover:text-foreground font-medium'
                            } ${defaultHidden.includes(route) ? "md:hidden" : ""}`}
                            key={i}
                            onClick={() => handleTabClick(i)}
                        >
                            {route}
                        </button>
                    );
                })}
                <hr
                    ref={(el) => {
                        lineRef.current = el;
                        activeTabLineRef.current = el;
                    }}
                    className='absolute bottom-0 duration-300 border-b-2 border-purple border-t-0 rounded-full'
                />
            </div>
            {Array.isArray(children) ? children[inPageNavIndex] : children}
        </>
    );
}
