import { useState, useRef } from 'react';
import { useTimer } from '../context/TimerContext';
import { useLocation } from 'react-router-dom';
import { TRIGGER } from '../registry';
import { triggerCelebration } from './celebration';

const BasicsTab = () => {
    const { config, update } = useTimer();
    const location = useLocation();
    const isCountUp = location.pathname.includes('count-up');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const videoInputRef = useRef(null);

    const handleDateChange = (e, field) => {
        const currentDate = config[field] ? new Date(config[field]) : new Date();
        const newDateStr = e.target.value;
        if (newDateStr) {
            const [year, month, day] = newDateStr.split('-');
            currentDate.setFullYear(year, month - 1, day);
            update(field, currentDate.toISOString());
        } else if (field === 'endAt' && isCountUp) {
            update(field, null);
        }
    };

    const handleTimeChange = (e, field) => {
        const currentDate = config[field] ? new Date(config[field]) : new Date();
        const newTimeStr = e.target.value;
        if (newTimeStr) {
            const [hours, minutes] = newTimeStr.split(':');
            currentDate.setHours(hours, minutes, 0, 0);
            update(field, currentDate.toISOString());
        } else if (field === 'endAt' && isCountUp) {
            update(field, null);
        }
    };

    const currentConfigDate = (isCountUp ? config.startAt : config.endAt) || new Date().toISOString();
    const d = new Date(currentConfigDate);
    const displayDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const displayTime = d.toTimeString().substring(0, 5);

    const milestoneD = config.endAt && isCountUp ? new Date(config.endAt) : null;
    const displayMilestoneDate = milestoneD ? `${milestoneD.getFullYear()}-${String(milestoneD.getMonth() + 1).padStart(2, '0')}-${String(milestoneD.getDate()).padStart(2, '0')}` : '';
    const displayMilestoneTime = milestoneD ? milestoneD.toTimeString().substring(0, 5) : '';

    const units = (e) => {
        const unitPicked = e.target.value;
        update('units', { ...config.units, [unitPicked]: !config.units[unitPicked] });
    };

    const handleTriggerChange = (trigger) => {
        update('customization.trigger.type', 'preset');
        update('customization.trigger.preset', trigger.key);
        triggerCelebration(trigger.key, config.customization.trigger.media);
    };

    return (
        <div className="tab-content space-y-6">
            <div className="flex flex-col gap-2">
                <label htmlFor="title" className="text-xs uppercase tracking-widest opacity-70">Title</label>
                <input
                    type="text"
                    placeholder="Name this moment..."
                    defaultValue={config.title || ''}
                    onChange={(e) => update('title', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-200/50 transition-colors text-orange-50"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="dateandtime" className="text-xs uppercase tracking-widest opacity-70">
                    {isCountUp ? "Start Date & Time" : "Deadline"}
                </label>
                <div className="flex gap-3">
                    <input
                        type="date"
                        className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-orange-200/50 color-scheme-dark text-orange-50"
                        value={displayDate}
                        onChange={(e) => handleDateChange(e, isCountUp ? 'startAt' : 'endAt')}
                    />
                    <input
                        type="time"
                        className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-orange-200/50 color-scheme-dark text-orange-50"
                        value={displayTime}
                        onChange={(e) => handleTimeChange(e, isCountUp ? 'startAt' : 'endAt')}
                    />
                </div>
            </div>

            {isCountUp && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="milestone" className="text-xs uppercase tracking-widest opacity-70">Optional Milestone</label>
                        {config.endAt && (
                            <button
                                type="button"
                                onClick={() => update('endAt', null)}
                                className="text-[10px] text-orange-200/50 hover:text-orange-200 uppercase tracking-widest transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="date"
                            className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-orange-200/50 color-scheme-dark text-orange-50"
                            value={displayMilestoneDate}
                            onChange={(e) => handleDateChange(e, 'endAt')}
                        />
                        <input
                            type="time"
                            className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-orange-200/50 color-scheme-dark text-orange-50"
                            value={displayMilestoneTime}
                            onChange={(e) => handleTimeChange(e, 'endAt')}
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <label htmlFor="units" className="text-xs uppercase tracking-widest opacity-70">Show Units</label>
                <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-orange-50">
                        <input
                            type="checkbox"
                            className="accent-orange-400 w-4 h-4 cursor-pointer"
                            value="days"
                            onChange={units}
                            checked={config.units.days}
                        />
                        Days
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-orange-50">
                        <input
                            type="checkbox"
                            className="accent-orange-400 w-4 h-4 cursor-pointer"
                            value="hours"
                            onChange={units}
                            checked={config.units.hours}
                        />
                        Hours
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-orange-50">
                        <input
                            type="checkbox"
                            className="accent-orange-400 w-4 h-4 cursor-pointer"
                            value="minutes"
                            onChange={units}
                            checked={config.units.minutes}
                        />
                        Minutes
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-orange-50">
                        <input
                            type="checkbox"
                            className="accent-orange-400 w-4 h-4 cursor-pointer"
                            value="seconds"
                            onChange={units}
                            checked={config.units.seconds}
                        />
                        Seconds
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-2 pt-6">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-label uppercase tracking-widest text-orange-100 opacity-90 transition-opacity hover:opacity-100">
                    <input
                        type="checkbox"
                        className="accent-orange-400 w-4 h-4 cursor-pointer"
                        checked={config.isGift}
                        onChange={(e) => update('isGift', e.target.checked)}
                    />
                    Make this a gift moment
                </label>
                {config.isGift && (
                    <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="text-xs uppercase tracking-widest opacity-70">Gift celebration</div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    update('customization.trigger.type', 'preset');
                                    update('customization.trigger.preset', 'confetti');
                                    update('customization.trigger.media', { secure_url: null, publicId: null, resourceType: null, file: null });
                                    setSelectedVideo(null);
                                }}
                                className={`py-2 rounded-xl text-xs uppercase tracking-widest transition-all ${config.customization.trigger.type === 'preset' ? 'bg-orange-200/20 border border-orange-300 text-orange-100' : 'bg-white/5 border border-white/10 text-orange-50 hover:bg-white/10'}`}
                            >
                                Use preset
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    update('customization.trigger.type', 'custom');
                                    update('customization.trigger.preset', 'video');
                                }}
                                className={`py-2 rounded-xl text-xs uppercase tracking-widest transition-all ${config.customization.trigger.type === 'custom' ? 'bg-orange-200/20 border border-orange-300 text-orange-100' : 'bg-white/5 border border-white/10 text-orange-50 hover:bg-white/10'}`}
                            >
                                Upload gift video
                            </button>
                        </div>
                        {config.customization.trigger.type === 'custom' && config.customization.trigger.preset === 'video' && (
                            <div className="flex flex-col gap-2 pt-2">
                                <input
                                    type="file"
                                    accept="video/*"
                                    ref={videoInputRef}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setSelectedVideo(file.name);
                                            update('customization.trigger.type', 'custom');
                                            update('customization.trigger.preset', 'video');
                                            update('customization.trigger.media', { secure_url: null, publicId: null, resourceType: 'video', file });
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => videoInputRef.current.click()}
                                    className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm text-orange-100"
                                >
                                    {selectedVideo ? selectedVideo : 'Choose gift video'}
                                </button>
                                {selectedVideo && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedVideo(null);
                                            if (videoInputRef.current) videoInputRef.current.value = '';
                                            update('customization.trigger.media', { secure_url: null, publicId: null, resourceType: 'video', file: null });
                                        }}
                                        className="text-xs text-orange-100/70 hover:text-orange-100 underline"
                                    >
                                        Remove uploaded video
                                    </button>
                                )}
                                <p className="text-[10px] opacity-50">This video will play when the gift moment completes.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-label uppercase tracking-widest text-orange-100 opacity-90 transition-opacity hover:opacity-100">
                    <input
                        type="checkbox"
                        className="accent-orange-400 w-4 h-4 cursor-pointer"
                        checked={config.isPublic}
                        onChange={(e) => update('isPublic', e.target.checked)}
                    />
                    Make this moment public
                </label>
                <p className="text-[10px] opacity-50 font-light ml-7">
                    If checked, this moment will appear on the Explore page for others to see and root for.
                </p>
            </div>

            <div className="flex flex-col gap-2 mt-6">
                <label className="text-xs uppercase tracking-widest opacity-70">Celebration Trigger</label>
                <div className='grid grid-cols-2 gap-3 py-2'>
                    {TRIGGER.map((trigger) => (
                        <button
                            key={trigger.key}
                            onClick={() => handleTriggerChange(trigger)}
                            className={`py-3 px-2 rounded-xl border transition-all text-xs font-label uppercase tracking-widest flex flex-col items-center gap-1 ${
                                config.customization.trigger.preset === trigger.key
                                    ? 'bg-orange-200/20 border-orange-300'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            <span className="text-2xl mb-1">{trigger.emoji}</span>
                            {trigger.tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BasicsTab;
