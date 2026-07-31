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

    // Play whatever celebration is currently selected: the chosen preset, or the
    // uploaded gift video (using a local preview URL before it's saved to Cloudinary).
    const handlePreviewCelebration = () => {
        const trigger = config.customization.trigger;
        if (trigger.type === 'custom') {
            const media = trigger.media || {};
            const url = media.file ? URL.createObjectURL(media.file) : media.secure_url;
            if (url) {
                triggerCelebration('custom', { type: 'video', url });
            }
            return;
        }
        triggerCelebration(trigger.preset || 'confetti');
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
                    className="bg-input-bg border border-input-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors text-text"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="dateandtime" className="text-xs uppercase tracking-widest opacity-70">
                    {isCountUp ? "Start Date & Time" : "Deadline"}
                </label>
                <div className="flex gap-3">
                    <input
                        type="date"
                        className="w-1/2 bg-input-bg border border-input-border rounded-lg px-3 py-3 focus:outline-none focus:border-primary/50 color-scheme-dark text-text"
                        value={displayDate}
                        onChange={(e) => handleDateChange(e, isCountUp ? 'startAt' : 'endAt')}
                    />
                    <input
                        type="time"
                        className="w-1/2 bg-input-bg border border-input-border rounded-lg px-3 py-3 focus:outline-none focus:border-primary/50 color-scheme-dark text-text"
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
                                className="text-[10px] text-primary/50 hover:text-primary uppercase tracking-widest transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="date"
                            className="w-1/2 bg-input-bg border border-input-border rounded-lg px-3 py-3 focus:outline-none focus:border-primary/50 color-scheme-dark text-text"
                            value={displayMilestoneDate}
                            onChange={(e) => handleDateChange(e, 'endAt')}
                        />
                        <input
                            type="time"
                            className="w-1/2 bg-input-bg border border-input-border rounded-lg px-3 py-3 focus:outline-none focus:border-primary/50 color-scheme-dark text-text"
                            value={displayMilestoneTime}
                            onChange={(e) => handleTimeChange(e, 'endAt')}
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <label htmlFor="units" className="text-xs uppercase tracking-widest opacity-70">Show Units</label>
                <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-text">
                        <input
                            type="checkbox"
                            className="accent-primary w-4 h-4 cursor-pointer"
                            value="days"
                            onChange={units}
                            checked={config.units.days}
                        />
                        Days
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-text">
                        <input
                            type="checkbox"
                            className="accent-primary w-4 h-4 cursor-pointer"
                            value="hours"
                            onChange={units}
                            checked={config.units.hours}
                        />
                        Hours
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-text">
                        <input
                            type="checkbox"
                            className="accent-primary w-4 h-4 cursor-pointer"
                            value="minutes"
                            onChange={units}
                            checked={config.units.minutes}
                        />
                        Minutes
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-text">
                        <input
                            type="checkbox"
                            className="accent-primary w-4 h-4 cursor-pointer"
                            value="seconds"
                            onChange={units}
                            checked={config.units.seconds}
                        />
                        Seconds
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-2 pt-6">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-label uppercase tracking-widest text-text opacity-90 transition-opacity hover:opacity-100">
                    <input
                        type="checkbox"
                        className="accent-primary w-4 h-4 cursor-pointer"
                        checked={config.isGift}
                        onChange={(e) => update('isGift', e.target.checked)}
                    />
                    Make this a gift moment
                </label>
                {config.isGift && (
                    <div className="space-y-3 bg-surface-high/40 border border-border rounded-2xl p-4">
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
                                className={`py-2 rounded-xl text-xs uppercase tracking-widest transition-all ${config.customization.trigger.type === 'preset' ? 'bg-primary/20 border border-primary text-text' : 'bg-input-bg border border-input-border text-text hover:bg-surface-high'}`}
                            >
                                Use preset
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    update('customization.trigger.type', 'custom');
                                    update('customization.trigger.preset', 'video');
                                }}
                                className={`py-2 rounded-xl text-xs uppercase tracking-widest transition-all ${config.customization.trigger.type === 'custom' ? 'bg-primary/20 border border-primary text-text' : 'bg-input-bg border border-input-border text-text hover:bg-surface-high'}`}
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
                                    className="w-full py-3 rounded-xl border border-border bg-surface-high/50 hover:bg-surface-high transition-all text-sm text-text"
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
                                        className="text-xs text-text/70 hover:text-text underline"
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
                <label className="flex items-center gap-3 cursor-pointer text-xs font-label uppercase tracking-widest text-text opacity-90 transition-opacity hover:opacity-100">
                    <input
                        type="checkbox"
                        className="accent-primary w-4 h-4 cursor-pointer"
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
                                    ? 'bg-primary/20 border-primary'
                                    : 'bg-surface-high/50 border-border hover:bg-surface-high'
                            }`}
                        >
                            <span className="text-2xl mb-1">{trigger.emoji}</span>
                            {trigger.tag}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={handlePreviewCelebration}
                    className="mt-1 w-full py-3 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-all text-xs font-label uppercase tracking-widest text-text flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                    Preview celebration
                </button>
            </div>
        </div>
    );
};

export default BasicsTab;
