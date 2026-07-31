import { useTimer } from '../context/TimerContext';

const MomentTab = () => {
    const { config, update } = useTimer();

    const handleMoodNoteChange = (e) => {
        update('customization.moodNote', e.target.value);
    };

    return (
        <div className="tab-content space-y-6">
            <div className="flex flex-col gap-2">
                <label htmlFor="moodNote" className="text-xs uppercase tracking-widest opacity-70 ">Moment Note</label>
                <textarea
                    id="moodNote"
                    placeholder="What's this moment about?"
                    value={config.customization.moodNote || ''}
                    onChange={handleMoodNoteChange}
                    maxLength={400}
                    className="bg-input-bg border border-input-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors text-text resize-none h-32"
                />
                <p className="text-[10px] opacity-50">
                    {(config.customization.moodNote || '').length}/400 characters
                </p>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <h4 className="text-xs uppercase tracking-widest opacity-70">Moment Details</h4>
                
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-surface-high/50 rounded-lg p-3">
                        <span className="opacity-70">Mode</span>
                        <span className="text-primary capitalize font-semibold">
                            {config.mode === 'countup' ? 'Counting Up' : 'Counting Down'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center bg-surface-high/50 rounded-lg p-3">
                        <span className="opacity-70">Visibility</span>
                        <span className="text-primary font-semibold">
                            {config.isPublic ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="bg-surface-high/50 rounded-lg p-3">
                        <div className="opacity-70 text-xs mb-2">Active Units</div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(config.units).map(([unit, isActive]) => (
                                isActive && (
                                    <span key={unit} className="inline-block bg-primary/20 border border-primary rounded-full px-3 py-1 text-xs capitalize text-primary">
                                        {unit}
                                    </span>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <h4 className="text-xs uppercase tracking-widest opacity-70">Customization Preview</h4>
                
                <div className="space-y-2 text-sm">
                    <div className="bg-surface-high/50 rounded-lg p-3">
                        <div className="opacity-70 text-xs mb-2">Font</div>
                        <div className="text-text capitalize font-semibold">
                            {config.customization.font}
                        </div>
                    </div>

                    <div className="bg-surface-high/50 rounded-lg p-3">
                        <div className="opacity-70 text-xs mb-2">Mood</div>
                        <div className="text-text capitalize font-semibold">
                            {config.customization.mood}
                        </div>
                    </div>

                    <div className="bg-surface-high/50 rounded-lg p-3">
                        <div className="opacity-70 text-xs mb-2">Border Radius</div>
                        <div className="text-text font-semibold">
                            {config.customization.borderRadius}px
                        </div>
                    </div>

                    <div className="bg-surface-high/50 rounded-lg p-3">
                        <div className="opacity-70 text-xs mb-2">Celebration Trigger</div>
                        <div className="text-text capitalize font-semibold">
                            {config.customization.trigger.preset}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MomentTab;
