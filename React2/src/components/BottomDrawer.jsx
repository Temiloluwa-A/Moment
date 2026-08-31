import { useState, useRef, useEffect, useCallback } from 'react';
import './BottomDrawer.css';

const BottomDrawer = ({ isOpen, onClose, children, activeTab, onTabChange }) => {
    const HALF_HEIGHT = 55;      // default resting height (vh)
    const EXPANDED_HEIGHT = 90;  // max height — never covers the full screen (PRD 9.4)
    const CLOSE_THRESHOLD = 28;  // drag below this to dismiss
    const DRAG_THRESHOLD = 4;    // min movement before we treat it as a drag

    // Resting position ('half' | 'full') and a live height while dragging (null otherwise).
    const [snapState, setSnapState] = useState('half');
    const [dragHeight, setDragHeight] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const startHeight = useRef(0);

    const restingHeight = snapState === 'full' ? EXPANDED_HEIGHT : HALF_HEIGHT;
    const height = dragHeight ?? restingHeight;

    const beginDrag = (clientY) => {
        startY.current = clientY;
        startHeight.current = restingHeight;
        setDragHeight(restingHeight);
        setIsDragging(true);
    };

    // Track the pointer 1:1 from where the drag began (no cumulative drift).
    const moveDrag = useCallback((clientY) => {
        const deltaY = startY.current - clientY; // drag up = positive
        if (Math.abs(deltaY) < DRAG_THRESHOLD) return;
        let next = startHeight.current + (deltaY / window.innerHeight) * 100;
        next = Math.max(0, Math.min(EXPANDED_HEIGHT, next));
        setDragHeight(next);
    }, []);

    // Snap to the nearest resting point when a drag ends.
    const settle = useCallback((h) => {
        setIsDragging(false);
        setDragHeight(null);
        if (h < CLOSE_THRESHOLD) {
            onClose?.();               // dismiss — parent unmounts us, no spring-back
        } else if (h < (HALF_HEIGHT + EXPANDED_HEIGHT) / 2) {
            setSnapState('half');
        } else {
            setSnapState('full');
        }
    }, [onClose]);

    // Touch: only start a drag from the handle so scrolling the content never fights the sheet.
    const handleTouchStart = (e) => {
        if (!e.target.closest('.drawer-handle')) return;
        beginDrag(e.touches[0].clientY);
    };
    const handleTouchMove = (e) => {
        if (isDragging) moveDrag(e.touches[0].clientY);
    };
    const handleTouchEnd = () => {
        if (isDragging) settle(height);
    };

    // Mouse (desktop testing): drag from the handle only.
    const handleMouseDown = (e) => {
        if (!e.target.closest('.drawer-handle')) return;
        e.preventDefault();
        beginDrag(e.clientY);
    };

    useEffect(() => {
        if (!isDragging) return;
        const onMove = (e) => moveDrag(e.clientY);
        const onUp = () => settle(dragHeight ?? restingHeight);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [isDragging, moveDrag, settle, dragHeight, restingHeight]);

    // Reset to the half position each time the sheet is opened. Adjusting state
    // during render (rather than in an effect) avoids an extra cascading render.
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setSnapState('half');
            setDragHeight(null);
        }
    }

    // The actual external-system side effect (toggling a body class) still
    // belongs in an effect, kept separate from the state adjustment above.
    useEffect(() => {
        if (!isOpen) return;
        document.body.classList.add('drawer-open');
        return () => document.body.classList.remove('drawer-open');
    }, [isOpen]);

    if (!isOpen) return null;

    const drawerHeightClass = snapState === 'full' ? 'snap-full' : 'snap-half';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-30"
                style={{ opacity: Math.min(1, height / EXPANDED_HEIGHT) }}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-surface to-surface-high z-40 rounded-t-3xl shadow-2xl flex flex-col ${!isDragging ? 'transition-all duration-500 ease-out' : ''} ${drawerHeightClass}`}
                style={{
                    height: `${height}dvh`,
                    boxShadow: isDragging ? '0 -4px 20px rgba(0,0,0,0.5)' : '0 -4px 16px rgba(0,0,0,0.3)',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
            >
                {/* Drag handle — the only draggable zone */}
                <div className="drawer-handle shrink-0 flex items-center justify-center pt-3 pb-4 cursor-grab active:cursor-grabbing rounded-t-3xl">
                    <div className="w-12 h-1.5 bg-primary/40 rounded-full"></div>
                </div>

                {/* Tab navigation */}
                <div className="shrink-0 bg-surface-high/95 backdrop-blur-sm border-b border-border px-4">
                    <div className="flex gap-4">
                        {['Basics', 'Look', 'Moment'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => onTabChange(tab.toLowerCase())}
                                className={`py-3 px-4 text-sm font-label uppercase tracking-widest transition-all border-b-2 ${
                                    activeTab === tab.toLowerCase()
                                        ? 'text-primary border-primary'
                                        : 'text-text/60 border-transparent hover:text-text/80'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar">
                    <div className="px-4 pt-4 pb-10">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

export default BottomDrawer;
