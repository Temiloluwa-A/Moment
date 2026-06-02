import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { FONTS, MOOD } from '../registry';
import { triggerCelebration } from './celebration';

const Timer = ({ isPanelOpen }) => {
    const location = useLocation();
    const { config, update } = useTimer();
    
    // If we are in the creator, trust the URL tabs. Otherwise, trust the database config!
    const isCountUp = location.pathname.includes('/create') ? location.pathname.includes('count-up') : config.mode === 'countup';

    const targetDate = config.endAt;
    const startDate = config.startAt;

    const [currentTime, setCurrentTime] = useState(new Date());
    const [timeDiff, setTimeDiff] = useState(0);

    // A ref to track if we were actively counting down (> 0) in the previous second
    const wasCountingRef = useRef(false);

    useEffect(() => {
        // Calculate immediately so there is no 1-second lag on mount!
        const calculateTime = () => {
            const now = new Date();
            setCurrentTime(now);

            if (isCountUp && startDate) {
                // Counting UP from start date
                const diff = Math.floor((now - new Date(startDate)) / 1000);
                setTimeDiff(diff > 0 ? diff : 0);
            } else if (!isCountUp && targetDate) {
                // Counting DOWN to target date
                const diff = Math.floor((new Date(targetDate) - now) / 1000);
                
                if (diff > 0) {
                    setTimeDiff(diff);
                    wasCountingRef.current = true; // We are actively counting down!
                } else {
                    setTimeDiff(0);
                    // If we hit 0 AND we were previously counting down, CELEBRATE!
                    if (wasCountingRef.current) {
                        triggerCelebration(config.customization.trigger.preset || 'confetti', config.customization.trigger.custom);
                        wasCountingRef.current = false;
                    }
                }
            }
        };

        calculateTime(); // Run immediately
        const interval = setInterval(calculateTime, 1000); // Then run every second

        return () => clearInterval(interval);
    }, [targetDate, startDate, isCountUp, config.customization.trigger.preset, config.customization.trigger.custom]);

    let days, hours, minutes, seconds;

    if ((!isCountUp && targetDate) || (isCountUp && startDate)) {
        days = Math.floor(timeDiff / (24 * 3600));
        hours = Math.floor((timeDiff % (24 * 3600)) / 3600);
        minutes = Math.floor((timeDiff % 3600) / 60);
        seconds = timeDiff % 60;
    } else {
        // Show current time
        days = 0; // Keeping days 0 when showing current time
        hours = currentTime.getHours();
        minutes = currentTime.getMinutes();
        seconds = currentTime.getSeconds();
    }

    const pad = (num) => String(num).padStart(2, '0');

    const activeFont = FONTS.find(font => font.key === config.customization.font) || FONTS[0];
    const activeMood = MOOD.find(mood => mood.key === config.customization.mood);
    const background = config.customization.background || { type: 'solid', value: '#131418' };
    const bgStyle = background.type === 'image'
        ? { backgroundImage: `url(${background.value})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
        : { background: background.value };

    return (
        <div className="relative flex flex-col items-center w-full min-h-screen justify-center gap-4 overflow-hidden" style={{ fontFamily: activeFont.family }}>
            <div className="pointer-events-none fixed inset-0 -z-20" style={bgStyle} />
            <div className={`relative z-10 glass-panel w-full flex flex-col items-center justify-center border border-white/5 shadow-2xl transition-all duration-500 ${isPanelOpen ? 'max-w-2xl' : 'max-w-4xl'}`} style={{ borderRadius: `${config.customization.borderRadius}px` }}>
                <span className="font-label text-dark-cofee-900 uppercase tracking-[0.2em] text-xs md:text-lg mb-8 mt-4">{config.title || 'untitled moment'}</span>

                <div className="flex items-center gap-3 md:gap-6 mt-4">
                    
                    {/* DAYS */}
                    {config.units.days && (
                        <div className="flex flex-col items-center">
                            <span className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-orange-50">{pad(days)}</span>
                            <span className="font-label text-xs md:text-[15px] uppercase tracking-widest text-orange-100/40 mt-1">Days</span>
                        </div>
                    )}

                    {/* COLON (If Days exists AND another unit exists after it) */}
                    {config.units.days && (config.units.hours || config.units.minutes || config.units.seconds) && (
                        <span className="text-4xl md:text-6xl font-headline text-orange-100/30 pb-4 md:pb-6">:</span>
                    )}

                    {/* HOURS */}
                    {config.units.hours && (
                        <div className="flex flex-col items-center">
                            <span className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-orange-50">{pad(hours)}</span>
                            <span className="font-label text-xs md:text-[15px] uppercase tracking-widest text-orange-100/40 mt-1">Hours</span>
                        </div>
                    )}

                    {/* COLON (If Hours exists AND another unit exists after it) */}
                    {config.units.hours && (config.units.minutes || config.units.seconds) && (
                        <span className="text-4xl md:text-6xl font-headline text-orange-100/30 pb-4 md:pb-6">:</span>
                    )}

                    {/* MINUTES */}
                    {config.units.minutes && (
                        <div className="flex flex-col items-center">
                            <span className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-orange-50">{pad(minutes)}</span>
                            <span className="font-label text-xs md:text-[15px] uppercase tracking-widest text-orange-100/40 mt-1">Mins</span>
                        </div>
                    )}

                    {/* COLON (If Minutes exists AND Seconds exists after it) */}
                    {config.units.minutes && config.units.seconds && (
                        <span className="text-4xl md:text-6xl font-headline text-orange-100/30 pb-4 md:pb-6">:</span>
                    )}

                    {/* SECONDS */}
                    {config.units.seconds && (
                        <div className="flex flex-col items-center">
                            <span className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-orange-50">{pad(seconds)}</span>
                            <span className="font-label text-xs md:text-[15px] uppercase tracking-widest text-orange-100/40 mt-1">Secs</span>
                        </div>
                    )}
                </div>
                <div className="h-px w-24 bg-outline-variant/30 mb-8"></div>
                <p className="noto-serif-italic text-2xl md:text-3xl text-orange-100/90 text-center max-w-md leading-relaxed mb-3">
                    "waiting has value"
                </p>
                {/* <p className="font-body text-orange-100/40 mt-6 text-sm">Parisian Summer '24</p> */}
            </div >
                    
            <div className={`relative z-10 glass-panel p-4 w-full flex flex-col items-center justify-center border border-white/5 shadow-2xl transition-all duration-500 ${isPanelOpen ? 'max-w-2xl' : 'max-w-4xl'}`} style={{ borderRadius: `${config.customization.borderRadius}px` }}>
                {activeMood && (
                    <div className='w-full flex flex-col m-4'>
                        <div><span className='pb-2'>{activeMood.emoji}</span></div>
                        <textarea value={config.customization.moodNote} onChange={(e) => update('customization.moodNote', e.target.value)} className='text-center bg-transparent resize-none focus:outline-none w-full'></textarea>
                        <div>
                            <span className=' border px-4 py-1 mb-2 rounded-3xl bg-amber-200/20 border-amber-500'>{activeMood.tag}</span>
                        </div>

                    </div>
                )}
            </div>

        </div >
    )
}

export default Timer