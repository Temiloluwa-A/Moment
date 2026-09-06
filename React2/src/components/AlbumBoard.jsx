import { useRef, useState } from 'react';
import Pin from './Pin';

// The corkboard itself. Position is percentage-based (0-100) against this
// container's own bounding rect, so it stays consistent across screen sizes.
// Dragging is hand-rolled with pointer events rather than a library — there's
// no collision/sorting logic needed (pins are free to overlap, matching a
// real corkboard), just "where did the pointer end up."
const AlbumBoard = ({ pins, isOpen, canContribute, onReposition, onVote, votingPinId }) => {
    const boardRef = useRef(null);
    const [draggingId, setDraggingId] = useState(null);
    const [localPositions, setLocalPositions] = useState({});

    const clampPercent = (value) => Math.min(96, Math.max(4, value));

    const handleDragStart = (e, pin) => {
        e.preventDefault();
        setDraggingId(pin._id);

        const move = (moveEvent) => {
            const rect = boardRef.current.getBoundingClientRect();
            const x = clampPercent(((moveEvent.clientX - rect.left) / rect.width) * 100);
            const y = clampPercent(((moveEvent.clientY - rect.top) / rect.height) * 100);
            setLocalPositions((prev) => ({ ...prev, [pin._id]: { x, y } }));
        };

        const up = (upEvent) => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            setDraggingId(null);

            const rect = boardRef.current.getBoundingClientRect();
            const x = clampPercent(((upEvent.clientX - rect.left) / rect.width) * 100);
            const y = clampPercent(((upEvent.clientY - rect.top) / rect.height) * 100);
            onReposition(pin._id, x, y);
        };

        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
    };

    return (
        <div
            ref={boardRef}
            className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-[10px] border-[#4a3320] shadow-2xl shadow-black/40"
            style={{
                backgroundColor: '#8a5f38',
                backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.22) 1px, transparent 0), linear-gradient(150deg, rgba(255,255,255,0.07), rgba(0,0,0,0.22))',
                backgroundSize: '13px 13px, 100% 100%',
            }}
        >
            {pins.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                    <p className="font-label text-xs uppercase tracking-[0.2em] text-white/40">
                        Nothing pinned yet — be the first to add a photo
                    </p>
                </div>
            )}
            {pins.map((pin) => {
                const pos = localPositions[pin._id] || pin;
                return (
                    <Pin
                        key={pin._id}
                        pin={{ ...pin, x: pos.x, y: pos.y }}
                        isOpen={isOpen && canContribute}
                        canVote={isOpen && canContribute}
                        onDragStart={handleDragStart}
                        onVote={onVote}
                        votePending={votingPinId === pin._id}
                        isDragging={draggingId === pin._id}
                    />
                );
            })}
        </div>
    );
};

export default AlbumBoard;
