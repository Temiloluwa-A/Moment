import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import './BottomDrawer.css';

const BottomDrawer = ({ isOpen, onClose, children, activeTab, onTabChange }) => {
    const [height, setHeight] = useState(() => (isOpen ? 50 : 0)); // 50vh default
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [snapState, setSnapState] = useState(() => (isOpen ? 'half' : 'closed')); // 'half', 'full', 'closed'
    const drawerRef = useRef(null);
    const contentRef = useRef(null);

    const HALF_HEIGHT = 50; // 50vh
    const FULL_HEIGHT = 100; // 100dvh
    const CLOSE_THRESHOLD = 15; // threshold to close drawer
    const DRAG_THRESHOLD = 5; // minimum drag distance to register

    // Handle touch start
    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartY(e.touches[0].clientY);
    };

    // Handle touch move
    const handleTouchMove = (e) => {
        if (!isDragging) return;

        const currentY = e.touches[0].clientY;
        const deltaY = startY - currentY; // positive = drag up, negative = drag down

        // Only update if we've dragged more than threshold
        if (Math.abs(deltaY) < DRAG_THRESHOLD) return;

        const viewportHeight = window.innerHeight;
        let newHeight = (height * viewportHeight + deltaY) / viewportHeight;

        // Clamp between 0 and 100vh
        newHeight = Math.max(0, Math.min(FULL_HEIGHT, newHeight));
        setHeight(newHeight);
        setSnapState(null); // Indicate we're in a dragging state (not snapped)
    };

    // Handle touch end with snapping logic
    const handleTouchEnd = () => {
        setIsDragging(false);

        // Determine snap position based on current height
        if (height < CLOSE_THRESHOLD) {
            setHeight(0);
            setSnapState('closed');
        } else if (height < HALF_HEIGHT - 10) {
            setHeight(HALF_HEIGHT);
            setSnapState('half');
        } else if (height < HALF_HEIGHT + 10) {
            setHeight(HALF_HEIGHT);
            setSnapState('half');
        } else if (height < 75) {
            // Snap to half or full depending on momentum/position
            setHeight(HALF_HEIGHT);
            setSnapState('half');
        } else {
            setHeight(FULL_HEIGHT);
            setSnapState('full');
        }
    };

    // Handle mouse events for desktop testing
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartY(e.clientY);
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;

        const currentY = e.clientY;
        const deltaY = startY - currentY;

        if (Math.abs(deltaY) < DRAG_THRESHOLD) return;

        let newHeight = height + (deltaY / window.innerHeight) * 100;
        newHeight = Math.max(0, Math.min(FULL_HEIGHT, newHeight));
        setHeight(newHeight);
        setSnapState(null);
    }, [isDragging, startY, height]);

    const handleMouseUp = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        if (height < CLOSE_THRESHOLD) {
            setHeight(0);
            setSnapState('closed');
        } else if (height < HALF_HEIGHT - 10) {
            setHeight(HALF_HEIGHT);
            setSnapState('half');
        } else if (height < HALF_HEIGHT + 10) {
            setHeight(HALF_HEIGHT);
            setSnapState('half');
        } else if (height < 75) {
            setHeight(HALF_HEIGHT);
            setSnapState('half');
        } else {
            setHeight(FULL_HEIGHT);
            setSnapState('full');
        }
    }, [isDragging, height]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    useLayoutEffect(() => {
        if (!isOpen && snapState !== 'closed') {
            setHeight(0);
            setSnapState('closed');
        } else if (isOpen && snapState === 'closed') {
            setHeight(HALF_HEIGHT);
            setSnapState('half');
        }
    }, [isOpen, snapState]);

    if (!isOpen && snapState === 'closed') {
        return null;
    }

    const drawerHeightClass = snapState === 'full' ? 'snap-full' : 
                               snapState === 'half' ? 'snap-half' : 
                               snapState === 'closed' ? 'snap-closed' : '';

    return (
        <>
            {/* Backdrop overlay */}
            {height > 10 && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 transition-opacity duration-300"
                    style={{
                        opacity: Math.min(1, height / FULL_HEIGHT) * 0.4,
                        pointerEvents: height > 10 ? 'auto' : 'none',
                    }}
                    onClick={onClose}
                />
            )}

            {/* Drawer container */}
            <div
                ref={drawerRef}
                className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-stone-900 to-stone-800 z-40 rounded-t-3xl shadow-2xl ${!isDragging ? 'transition-all duration-500 ease-out' : ''} ${drawerHeightClass}`}
                style={{
                    height: `${height}dvh`,
                    boxShadow: isDragging ? '0 -4px 20px rgba(0,0,0,0.5)' : '0 -4px 16px rgba(0,0,0,0.3)',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget || e.target.closest('.drawer-handle')) {
                        handleMouseDown(e);
                    }
                }}
            >
                {/* Drag Handle */}
                <div className="drawer-handle sticky top-0 flex items-center justify-center pt-3 pb-4 cursor-grab active:cursor-grabbing bg-gradient-to-b from-stone-800 to-transparent rounded-t-3xl">
                    <div className="w-12 h-1 bg-orange-200/40 rounded-full"></div>
                </div>

                {/* Tab Navigation */}
                <div className="sticky top-12 bg-stone-800/95 backdrop-blur-sm border-b border-white/10 px-4 z-10">
                    <div className="flex gap-4">
                        {['Basics', 'Look', 'Moment'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => onTabChange(tab.toLowerCase())}
                                className={`py-3 px-4 text-sm font-label uppercase tracking-widest transition-all border-b-2 ${
                                    activeTab === tab.toLowerCase()
                                        ? 'text-orange-300 border-orange-300'
                                        : 'text-orange-100/60 border-transparent hover:text-orange-100/80'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div
                    ref={contentRef}
                    className="overflow-y-auto h-full custom-scrollbar"
                    style={{
                        paddingTop: '1rem',
                        maxHeight: `calc(${height}dvh - 80px)`,
                    }}
                >
                    <div className="px-4 pb-10">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

export default BottomDrawer;
