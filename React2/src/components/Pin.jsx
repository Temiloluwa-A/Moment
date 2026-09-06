import Avatar from './Avatar';

// One photo pinned to the board — a small polaroid-ish card, tilted, with a
// pushpin dot at the top selling the "actually pinned to something" feel.
// Position is entirely controlled by the parent (AlbumBoard) via style; this
// component only owns its own look and its pointer-down handler for dragging.
const Pin = ({ pin, isOpen, canVote, onDragStart, onVote, votePending, isDragging }) => {
    const hasPendingDelete = !!pin.pendingDelete;

    return (
        <div
            className={`absolute select-none touch-none ${isDragging ? '' : 'transition-[left,top] duration-150'}`}
            style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: `translate(-50%, -50%) rotate(${pin.rotation}deg) scale(${isDragging ? 1.08 : 1})`,
                zIndex: isDragging ? 40 : hasPendingDelete ? 20 : 10,
            }}
            onPointerDown={isOpen ? (e) => onDragStart(e, pin) : undefined}
        >
            <div
                className={`group relative w-36 sm:w-44 bg-[#fdfaf3] p-2 pb-3 rounded-sm shadow-[0_8px_16px_rgba(0,0,0,0.35)] transition-transform hover:scale-[1.03] hover:z-30 ${isOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
            >
                {/* pushpin */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_2px_3px_rgba(0,0,0,0.5)] border border-primary-hover" />

                <div className="w-full aspect-square overflow-hidden bg-black/10 rounded-[1px]">
                    <img src={pin.imageUrl} alt={pin.note || 'Pinned photo'} className="w-full h-full object-cover pointer-events-none" draggable={false} />
                </div>

                {pin.note && (
                    <p className="mt-2 px-0.5 text-[11px] leading-snug text-[#2E241A] noto-serif-italic line-clamp-2">
                        {pin.note}
                    </p>
                )}

                <div className="mt-1.5 flex items-center justify-between px-0.5">
                    <Avatar seed={pin.addedBy?.userName} avatarStyle={pin.addedBy?.avatarStyle} className="w-5 h-5 rounded-full shrink-0" />
                    {canVote && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onVote(pin); }}
                            disabled={votePending}
                            title={pin.pendingDelete?.hasVoted ? 'You voted to remove this' : 'Vote to remove'}
                            className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold transition-colors disabled:opacity-50 ${
                                hasPendingDelete
                                    ? 'bg-error/15 text-error'
                                    : 'text-black/30 opacity-0 group-hover:opacity-100 hover:text-error hover:bg-error/10'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[12px]">
                                {pin.pendingDelete?.hasVoted ? 'how_to_vote' : 'delete'}
                            </span>
                            {hasPendingDelete && `${pin.pendingDelete.currentVotes}/${pin.pendingDelete.requiredVotes}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Pin;
