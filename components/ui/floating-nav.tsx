"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface FloatingNavItem {
    id: string;
    icon: React.ReactNode;
    label: string;
}

interface FloatingNavProps {
    items: FloatingNavItem[];
    activeId: string;
    onItemClick: (id: string) => void;
    className?: string; // Allow positioning overrides
}

const FloatingNav: React.FC<FloatingNavProps> = ({ items, activeId, onItemClick, className }) => {
    const [indicatorStyle, setIndicatorStyle] = React.useState({ width: 0, left: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Find index of active item
    const activeIndex = items.findIndex(item => item.id === activeId);
    const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;

    // Update indicator position when active changes or resize
    useEffect(() => {
        const updateIndicator = () => {
            const btn = btnRefs.current[safeActiveIndex];
            const container = containerRef.current;

            if (btn && container) {
                const btnRect = btn.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                setIndicatorStyle({
                    width: btnRect.width,
                    left: btnRect.left - containerRect.left,
                });
            }
        };

        // Small timeout to ensure DOM is settled
        const timer = setTimeout(updateIndicator, 100);
        window.addEventListener("resize", updateIndicator);

        return () => {
            window.removeEventListener("resize", updateIndicator);
            clearTimeout(timer);
        };
    }, [safeActiveIndex, items.length]);

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-2 ${className || ''}`}>
            <div
                ref={containerRef}
                className="relative flex items-center bg-white/90 backdrop-blur-lg shadow-2xl rounded-full px-2 py-2 border border-blue-100/50 ring-1 ring-black/5"
            >
                {items.map((item, index) => {
                    const isActive = index === safeActiveIndex;
                    return (
                        <button
                            key={item.id}
                            ref={(el) => { btnRefs.current[index] = el; }}
                            onClick={() => onItemClick(item.id)}
                            type="button"
                            className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-colors z-10 
                ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}
            `}
                        >
                            <div className="relative z-10 flex items-center justify-center">
                                {/* Clone element to force size if needed, or just render */}
                                {item.icon}
                            </div>
                            {/* Show label only if active or on large screens, or always? Let's hide on mobile, show on desktop */}
                            <span className={`text-sm font-medium z-10 ${isActive ? 'block' : 'hidden sm:block'}`}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}

                {/* Sliding Active Indicator */}
                <motion.div
                    initial={false}
                    animate={indicatorStyle}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute top-1.5 bottom-1.5 rounded-full bg-blue-50"
                />
            </div>
        </div>
    );
};

export default FloatingNav;
