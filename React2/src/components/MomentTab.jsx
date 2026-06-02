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
                    maxLength={500}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-200/50 transition-colors text-orange-50 resize-none h-32"
                />
                <p className="text-[10px] opacity-50">
                    {(config.customization.moodNote || '').length}/500 characters
                </p>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                <h4 className="text-xs uppercase tracking-widest opacity-70">Moment Details</h4>
                
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                        <span className="opacity-70">Mode</span>
                        <span className="text-orange-200 capitalize font-semibold">
                            {config.mode === 'countup' ? 'Counting Up' : 'Counting Down'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                        <span className="opacity-70">Visibility</span>
                        <span className="text-orange-200 font-semibold">
                            {config.isPublic ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="opacity-70 text-xs mb-2">Active Units</div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(config.units).map(([unit, isActive]) => (
                                isActive && (
                                    <span key={unit} className="inline-block bg-orange-200/20 border border-orange-300 rounded-full px-3 py-1 text-xs capitalize text-orange-200">
                                        {unit}
                                    </span>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                <h4 className="text-xs uppercase tracking-widest opacity-70">Customization Preview</h4>
                
                <div className="space-y-2 text-sm">
                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="opacity-70 text-xs mb-2">Font</div>
                        <div className="text-orange-100 capitalize font-semibold">
                            {config.customization.font}
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="opacity-70 text-xs mb-2">Mood</div>
                        <div className="text-orange-100 capitalize font-semibold">
                            {config.customization.mood}
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="opacity-70 text-xs mb-2">Border Radius</div>
                        <div className="text-orange-100 font-semibold">
                            {config.customization.borderRadius}px
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="opacity-70 text-xs mb-2">Celebration Trigger</div>
                        <div className="text-orange-100 capitalize font-semibold">
                            {config.customization.trigger.preset}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MomentTab;
