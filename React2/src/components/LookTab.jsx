import { useState, useRef } from 'react';
import { useTimer } from '../context/TimerContext';
import { FONTS, MOOD } from '../registry';

const PRESET_BACKGROUNDS = [
    { key: 'espresso', label: 'Espresso', type: 'solid', value: 'var(--color-espresso-950)' },
    { key: 'surface', label: 'Surface', type: 'solid', value: 'var(--color-surface)' },
    { key: 'bg', label: 'Background', type: 'solid', value: 'var(--color-bg)' },
    { key: 'parchment', label: 'Parchment', type: 'solid', value: 'var(--color-parchment-100)' },
    { key: 'dawn', label: 'Dawn', type: 'gradient', value: 'linear-gradient(135deg, var(--color-amber-400) 0%, var(--color-espresso-900) 100%)' },
    { key: 'twilight', label: 'Twilight', type: 'gradient', value: 'linear-gradient(135deg, var(--color-surface-high) 0%, var(--color-amber-500) 100%)' },
    { key: 'ember', label: 'Ember', type: 'gradient', value: 'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-tawny-700) 100%)' }
];

const LookTab = () => {
    const { config, update } = useTimer();
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const featuredFonts = FONTS.slice(0, 4);
    const otherFonts = FONTS.slice(4);

    const handleFontChange = (fontKey) => {
        update('customization.font', fontKey.key);
    };

    const handleMoodChange = (mood) => {
        update('customization.mood', mood.key);
        const isDefaultNote = !config.customization.moodNote || MOOD.some(m => m.description === config.customization.moodNote);
        if (isDefaultNote) {
            update('customization.moodNote', mood.description);
        }
    };

    return (
        <div className="tab-content space-y-6">
            <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest opacity-70 ">Font</label>
                <div className='grid grid-cols-2 gap-3 py-2'>
                    {featuredFonts.map((font) => (
                        <button
                            key={font.key}
                            onClick={() => handleFontChange(font)}
                            style={{ fontFamily: font.family }}
                            className={`py-3 px-2 rounded-full border transition-all text-sm ${
                                config.customization.font === font.key
                                    ? 'bg-orange-200/20 border-orange-300'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {font.family.split(' ')[0]}
                        </button>
                    ))}

                    <select
                        name="others"
                        className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-orange-200/50 text-sm mt-2 text-orange-50"
                        onChange={(e) => update('customization.font', e.target.value)}
                        value={otherFonts.find(f => f.key === config.customization.font) ? config.customization.font : ''}
                    >
                        <option value='' disabled className="text-stone-900">Select other font</option>
                        {otherFonts.map((font) => (
                            <option key={font.key} value={font.key} className="text-stone-900">{font.family}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
                <label className="text-xs uppercase tracking-widest opacity-70">Background Image</label>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setSelectedFile(file);
                            // Keep a reference to the File so Customize can send it to the server (Cloudinary middleware)
                            update('customization.background.type', 'image');
                            update('customization.background.file', file);
                            // Use a local object URL for preview only
                            try {
                                const preview = URL.createObjectURL(file);
                                update('customization.background.value', preview);
                            } catch {
                                // Fallback: don't set preview
                            }
                        }
                    }}
                    style={{ display: 'none' }}
                />

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="flex-1 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm flex items-center justify-center gap-2 text-orange-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-camera" viewBox="0 0 16 16">
                            <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
                            <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
                        </svg>
                        {selectedFile ? selectedFile.name : (config.customization.background?.type === 'image' ? 'Change Image' : 'Choose Image')}
                    </button>

                    {(selectedFile || config.customization.background?.type === 'image') && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                                update('customization.background.file', null);
                                update('customization.background.type', 'solid');
                                update('customization.background.value', config.customization.background?.value || 'var(--color-bg)');
                            }}
                            className="p-3 rounded-xl border border-white/10 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all flex items-center justify-center"
                            title="Remove Image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-2 mt-6">
                    <label className="text-xs uppercase tracking-widest opacity-70">Background Presets</label>
                    <div className="grid grid-cols-2 gap-3">
                        {PRESET_BACKGROUNDS.map((preset) => {
                            const active = config.customization.background?.value === preset.value && config.customization.background?.type === preset.type;
                            return (
                                <button
                                    key={preset.key}
                                    type="button"
                                    onClick={() => {
                                        update('customization.background.type', preset.type);
                                        update('customization.background.value', preset.value);
                                        update('customization.background.file', null);
                                    }}
                                    className={`h-20 rounded-3xl border transition-all duration-300 overflow-hidden ${active ? 'border-orange-300 shadow-xl' : 'border-white/10 hover:border-white/20'}`}
                                    style={{ background: preset.value }}
                                >
                                    <span className="sr-only">{preset.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-widest opacity-70">Border Radius</label>
                    <span className="text-xs font-label">{config.customization.borderRadius}px</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="400"
                    value={config.customization.borderRadius}
                    onChange={(e) => update('customization.borderRadius', Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-400 mt-2"
                />
            </div>

            <div className="flex flex-col gap-2 mt-6">
                <label className="text-xs uppercase tracking-widest opacity-70">Mood</label>
                <div className='grid grid-cols-4 gap-2 py-2'>
                    {MOOD.map((mood) => (
                        <button
                            key={mood.key}
                            onClick={() => handleMoodChange(mood)}
                            className={`py-3 px-2 rounded-full border transition-all text-xs flex items-center justify-center gap-1 ${
                                config.customization.mood === mood.key
                                    ? 'bg-orange-200/20 border-orange-300'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            <span>{mood.emoji}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LookTab;
