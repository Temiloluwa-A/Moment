import Avatar from "./Avatar";

const getBackgroundStyles = (background) => {
    if (!background) return { backgroundColor: '#0f172a' };
    if (background.type === 'image') {
        return {
            backgroundImage: `linear-gradient(rgba(15,23,42,0.72), rgba(15,23,42,0.72)), url(${background.value})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
    }
    if (background.type === 'gradient') {
        return { backgroundImage: background.value };
    }
    return { backgroundColor: background.value };
};

// Returns the day count split into a big `value` (number, or null when there is
// nothing to count) and a short `label` so the right panel can style them apart.
const getDayCount = (moment) => {
    const now = new Date();
    const startAt = moment.startAt ? new Date(moment.startAt) : null;
    const endAt = moment.endAt ? new Date(moment.endAt) : null;

    if (moment.mode === 'countup') {
        if (!startAt) return { value: null, label: 'Count-up moment' };
        const daysSince = Math.max(0, Math.floor((now - startAt) / (1000 * 60 * 60 * 24)));
        if (daysSince === 0) return { value: null, label: 'Started today' };
        return { value: daysSince, label: daysSince === 1 ? 'day since' : 'days since' };
    }

    if (!endAt) return { value: null, label: 'No deadline set' };
    // Target date is the current calendar day → it's happening today.
    const isToday = endAt.getFullYear() === now.getFullYear()
        && endAt.getMonth() === now.getMonth()
        && endAt.getDate() === now.getDate();
    if (isToday) return { value: null, label: 'Today' };
    const diffDays = Math.ceil((endAt - now) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0) return { value: diffDays, label: diffDays === 1 ? 'day left' : 'days left' };
    const past = Math.abs(diffDays);
    return { value: past, label: past === 1 ? 'day ago' : 'days ago' };
};

// Shared moment card with a split layout: a left content column (header slots,
// title, mood pill, optional footer) and a full-height right panel showing the
// day count. The header has two slots (`headerLeft` / `headerRight`) and an
// optional `footer` so each page drops in its own controls while the shell,
// title, day count and mood pill stay identical everywhere.
// Defaults match the Explore layout (creator on the left, mode badge on the right).
// `compact` shrinks the card to its content height, uses a smaller mood pill, and
// keeps the day-count panel visible at all widths (used by MyMoments); the default
// keeps the taller Explore card with a mobile-only panel.
// `actions` renders inside the day-count panel, beneath the number.
const SavedMoment = ({ moment, onClick, headerLeft, headerRight, footer, actions, compact = false }) => {
    const cardStyles = getBackgroundStyles(moment.customization?.background);
    const moodLabel = moment.customization?.mood || 'Unspecified mood';
    const dayCount = getDayCount(moment);

    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden rounded-[28px] border border-white/10 shadow-2xl shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}
            style={cardStyles}
        >
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" />
            <div className={`relative flex ${compact ? '' : 'min-h-72 sm:min-h-80'}`}>
                {/* Left content column */}
                <div className="flex flex-1 flex-col justify-between p-5 sm:p-7 min-w-0">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4 text-xs uppercase tracking-[0.23em] text-text/70 font-label">
                            {headerLeft ?? (
                                <span className="inline-flex items-center gap-2 min-w-0">
                                    <Avatar className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 shrink-0 shadow-lg" />
                                    <span className="truncate">{moment.userId?.userName || 'Anonymous'}</span>
                                </span>
                            )}
                            {headerRight ?? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-text shrink-0">
                                    <span className="text-base">{moment.mode === 'countup' ? '↑' : '↓'}</span>
                                    {moment.mode === 'countup' ? 'Count up' : 'Count down'}
                                </span>
                            )}
                        </div>

                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold tracking-tight text-white leading-tight break-words">
                            {moment.title || 'Untitled moment'}
                        </h2>

                        {/* Inline count (larger screens only — the right panel takes over on mobile,
                            and in compact mode the panel is always shown instead) */}
                        <p className={`${compact ? 'hidden' : 'hidden sm:block'} mt-3 text-sm text-text/70`}>
                            {dayCount.value !== null && (
                                <span className="text-base font-bold text-text">{dayCount.value} </span>
                            )}
                            {dayCount.label}
                        </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <div className={`inline-flex items-center uppercase font-bold text-text/80 border border-white/10 bg-white/10 ${compact ? 'gap-1.5 rounded-full px-2.5 py-1 text-[10px] tracking-[0.15em]' : 'gap-2 rounded-2xl px-3 py-2 text-[11px] tracking-[0.2em]'}`}>
                            <span className={compact ? 'text-sm' : 'text-base'}>{moment.customization?.mood === 'hopeful' ? '🍀' : '✨'}</span>
                            {moodLabel}
                        </div>
                        {footer}
                    </div>
                </div>

                {/* Day-count panel. Mobile-only by default (inspo layout); always shown in
                    compact mode so actions can live on the day-count side. */}
                <div className={`${compact ? 'flex' : 'flex sm:hidden'} w-28 shrink-0 flex-col items-center justify-center border-l border-white/10 bg-black/20 px-3 py-4 text-center`}>
                    <div className="flex flex-1 flex-col items-center justify-center gap-1">
                        {dayCount.value !== null ? (
                            <>
                                <span className="text-4xl font-headline font-bold leading-none tracking-tighter text-white">
                                    {dayCount.value}
                                </span>
                                <span className="text-[11px] uppercase tracking-[0.2em] text-text/70 font-label">
                                    {dayCount.label}
                                </span>
                            </>
                        ) : (
                            <span className="text-xs uppercase tracking-[0.2em] text-text/70 font-label leading-snug">
                                {dayCount.label}
                            </span>
                        )}
                    </div>
                    {actions && (
                        <div className="mt-3 flex items-center justify-center gap-1">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedMoment;
