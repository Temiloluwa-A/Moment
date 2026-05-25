import { useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { FONTS, MOOD, TRIGGER } from '../registry';
import { triggerCelebration } from './celebration';

const Customize = () => {
    const { config, update } = useTimer();
    const location = useLocation();
    const isCountUp = location.pathname.includes('count-up');
    const [isSaving, setIsSaving] = useState(false);
    
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);


    const handleDateChange = (e, field) => {
        const currentDate = config[field] ? new Date(config[field]) : new Date();
        const newDateStr = e.target.value; // YYYY-MM-DD
        if (newDateStr) {
            const [year, month, day] = newDateStr.split('-');
            currentDate.setFullYear(year, month - 1, day);
            update(field, currentDate.toISOString());
        } else if (field === 'endAt' && isCountUp) {
            // Allow users to clear the optional milestone
            update(field, null);
        }
    };

    const handleTimeChange = (e, field) => {
        const currentDate = config[field] ? new Date(config[field]) : new Date();
        const newTimeStr = e.target.value; // HH:MM
        if (newTimeStr) {
            const [hours, minutes] = newTimeStr.split(':');
            currentDate.setHours(hours, minutes, 0, 0);
            update(field, currentDate.toISOString());
        } else if (field === 'endAt' && isCountUp) {
            update(field, null);
        }
    };

    // Ensure it's never blank by falling back to the current date/time
    const currentConfigDate = (isCountUp ? config.startAt : config.endAt) || new Date().toISOString();
    const d = new Date(currentConfigDate);
    // Use local time extraction to avoid timezone mismatch bugs!
    const displayDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const displayTime = d.toTimeString().substring(0, 5);

    // For the optional milestone (endAt) on Count-Up
    const milestoneD = config.endAt && isCountUp ? new Date(config.endAt) : null;
    const displayMilestoneDate = milestoneD ? `${milestoneD.getFullYear()}-${String(milestoneD.getMonth() + 1).padStart(2, '0')}-${String(milestoneD.getDate()).padStart(2, '0')}` : '';
    const displayMilestoneTime = milestoneD ? milestoneD.toTimeString().substring(0, 5) : '';

    const units = (e) => {
        const unitPicked = e.target.value;
        // const activeUnit = Object.values(config.units).filter(Boolean).length;
        // if (activeUnit === 1 && config.units[unitPicked] === true) {
        //     return
        // } else{
        //     alert("At least one unit must be picked")
        // }
        update('units', { ...config.units, [unitPicked]: !config.units[unitPicked] })
    }
    const featuredFonts = FONTS.slice(0, 4);
    console.log(featuredFonts);
    const otherFonts = FONTS.slice(4)
    const handleFontChange = (fontKey) => {
        update('customization.font', fontKey.key)
    }

    const handleMoodChange = (mood) => {
        update('customization.mood', mood.key)
        const isDefaultNote = !config.customization.moodNote || MOOD.some(m => m.description === config.customization.moodNote);
        if (isDefaultNote) {
            update('customization.moodNote', mood.description);
        }
    }

    const handleTriggerChange = (trigger) => {
        update('customization.trigger.preset', trigger.key);
        // Fire the newly selected celebration immediately so they can see what it looks like!
        triggerCelebration(trigger.key, config.customization.trigger.custom);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = Cookies.get('token'); // Read the token from the cookie
            if (!token) {
                alert("Please log in to save your moment!");
                return;
            }

            // Make sure the database knows if this is a count-up or count-down!
            // We create a copy of config so we don't mutate React state directly
            const payload = { ...config, mode: isCountUp ? 'countup' : 'countdown' };

            let dataToSend = payload;

            // If an image is selected, we MUST package it as FormData instead of standard JSON
            if (selectedFile) {
                const formData = new FormData();
                formData.append('title', payload.title || '');
                formData.append('mode', payload.mode);
                if (payload.startAt) formData.append('startAt', payload.startAt);
                if (payload.endAt) formData.append('endAt', payload.endAt);
                formData.append('isPublic', payload.isPublic || false);
                
                // Nested objects must be stringified so Multer doesn't destroy them
                formData.append('customization', JSON.stringify(payload.customization));
                formData.append('units', JSON.stringify(payload.units));
                
                // Append the actual file using the exact field name Multer expects
                formData.append('backgroundImage', selectedFile);
                
                dataToSend = formData;
            }

            if (config._id) {
                await axios.patch(`http://localhost:3000/api/v1/moments/${config._id}`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Moment updated successfully!");
            } else {
                await axios.post('http://localhost:3000/api/v1/moments', dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Moment created successfully!");
            }
        } catch (error) {
            console.error(error);
            // Display the exact backend error message!
            const errorMsg = error.response?.data?.message || "Failed to save moment. Please try again.";
            alert(`Backend Error: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full p-6 pt-7 text-orange-50">
            <aside className="space-y-8 pb-10">
                <header className="border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-sm font-label tracking-[0.2em] text-orange-100/50 uppercase">Create</h2>
                        <h5 className="text-2xl font-headline italic mt-1 text-orange-100">Customize your moment</h5>

                    </div>

                </header>

                {/* SECTION 1: The Basics */}
                <div className="space-y-6">
                    <h3 className="font-label text-xs uppercase tracking-widest text-orange-200">The Basics</h3>
                    <div className="flex flex-col space-y-5">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="title" className="text-xs uppercase tracking-widest opacity-70">TITLE</label>
                            <input type="text" placeholder="Name this moment..." className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-200/50 transition-colors" onChange={(e) => update('title', e.target.value)} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="dateandtime" className="text-xs uppercase tracking-widest opacity-70">{isCountUp ? "START DATE & TIME" : "DEADLINE"}</label>
                            <div className="flex gap-3">
                                <input type="date" className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-orange-200/50 color-scheme-dark" value={displayDate} onChange={(e) => handleDateChange(e, isCountUp ? 'startAt' : 'endAt')} />
                                <input type="time" className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-orange-200/50 color-scheme-dark" value={displayTime} onChange={(e) => handleTimeChange(e, isCountUp ? 'startAt' : 'endAt')} />
                            </div>
                        </div>

                        {isCountUp && (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="milestone" className="text-xs uppercase tracking-widest opacity-70">OPTIONAL MILESTONE</label>
                                    {config.endAt && (
                                        <button type="button" onClick={() => update('endAt', null)} className="text-[10px] text-orange-200/50 hover:text-orange-200 uppercase tracking-widest transition-colors">Clear</button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <input type="date" className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-orange-200/50 color-scheme-dark" value={displayMilestoneDate} onChange={(e) => handleDateChange(e, 'endAt')} />
                                    <input type="time" className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-orange-200/50 color-scheme-dark" value={displayMilestoneTime} onChange={(e) => handleTimeChange(e, 'endAt')} />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label htmlFor="units" className="text-xs uppercase tracking-widest opacity-70">SHOW UNITS</label>
                            <div className="flex flex-wrap gap-4 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input type="checkbox" className="accent-orange-400 w-4 h-4 cursor-pointer" value="days" onChange={units} checked={config.units.days} /> DAYS
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input type="checkbox" className="accent-orange-400 w-4 h-4 cursor-pointer" value="hours" onChange={units} checked={config.units.hours} /> HOURS
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input type="checkbox" className="accent-orange-400 w-4 h-4 cursor-pointer" value="minutes" onChange={units} checked={config.units.minutes} /> MINUTES
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input type="checkbox" className="accent-orange-400 w-4 h-4 cursor-pointer" value="seconds" onChange={units} checked={config.units.seconds} /> SECONDS
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer text-xs font-label uppercase tracking-widest text-orange-100 opacity-90 transition-opacity hover:opacity-100">
                                <input type="checkbox" className="accent-orange-400 w-4 h-4 cursor-pointer" checked={config.isPublic} onChange={(e) => update('isPublic', e.target.checked)} />
                                Make this moment public
                            </label>
                            <p className="text-[10px] opacity-50 font-light ml-7">If checked, this moment will appear on the Explore page for others to see and root for.</p>
                        </div>


                    </div>

                    <div className="flex flex-col gap-2 mt-6">
                        <label className="text-xs uppercase tracking-widest opacity-70">CELEBRATION TRIGGER</label>
                        <div className='grid grid-cols-2 md:grid-cols-5 gap-3 py-2'>
                            {TRIGGER.map((trigger) => (
                                <button
                                    key={trigger.key}
                                    onClick={() => handleTriggerChange(trigger)}
                                    className={`py-3 px-2 rounded-xl border transition-all text-xs font-label uppercase tracking-widest flex flex-col items-center gap-1 ${config.customization.trigger.preset === trigger.key ? 'bg-orange-200/20 border-orange-300' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <span className="text-2xl mb-1">{trigger.emoji}</span>
                                    {trigger.tag}
                                </button>
                            ))}
                             {config.customization.trigger.type === 'custom' && (
                            <div className="flex flex-col gap-2 mt-4 ">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-camera py-3 px-2 rounded-xl border transition-all text-xs font-label uppercase tracking-widest flex flex-col items-center gap-1 ${config.customization.trigger.custom === trigger.key ? 'bg-orange-200/20 border-orange-300' : 'bg-white/5 border-white/10 hover:bg-white/10'" viewBox="0 0 16 16">
                                    <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
                                    <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
                                </svg>
                                {/* <label className="text-xs uppercase tracking-widest opacity-70">CUSTOM CELEBRATION</label> */}
                            </div>
                        )}
                        </div>
                    </div>
                    <div>
                        {config.customization.trigger.type === 'custom' && (
                            <div className="flex flex-col gap-2 mt-4 ">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera" viewBox="0 0 16 16">
                                    <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
                                    <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
                                </svg>
                                {/* <label className="text-xs uppercase tracking-widest opacity-70">CUSTOM CELEBRATION</label> */}
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 2: The Look */}
                <div className="space-y-6 pt-4 border-t border-white/10">
                    <h3 className="font-label text-xs uppercase tracking-widest text-orange-200">The Look</h3>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest opacity-70">FONT</label>
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-3 py-2'>
                            {featuredFonts.map((font) => (
                                <button
                                    key={font.key}
                                    onClick={() => handleFontChange(font)}
                                    style={{ fontFamily: font.family }}
                                    className={`py-3 px-2 rounded-full border transition-all text-sm ${config.customization.font === font.key ? 'bg-orange-200/20 border-orange-300' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    {font.family.split(' ')[0]}
                                </button>
                            ))}

                            <select name="others" className="col-span-2 md:col-span-3 bg-white/5 border border-white/10 rounded-lg px-3 py-3 focus:outline-none focus:border-orange-200/50 text-sm mt-2" onChange={(e) => update('customization.font', e.target.value)} value={otherFonts.find(f => f.key === config.customization.font) ? config.customization.font : ''}>
                                <option value='' disabled className="text-stone-900">Select other font</option>
                                {otherFonts.map((font) => (
                                    <option key={font.key} value={font.key} className="text-stone-900">{font.family}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                        <label className="text-xs uppercase tracking-widest opacity-70">BACKGROUND IMAGE</label>
                        
                        {/* Hidden file input */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setSelectedFile(e.target.files[0]);
                                    update('customization.background.type', 'image');
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
                                {selectedFile ? selectedFile.name : (config.customization.background?.type === 'image' ? 'Change Image' : 'Choose from Gallery/Camera')}
                            </button>
                            
                            {(selectedFile || config.customization.background?.type === 'image') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                        update('customization.background.type', 'solid');
                                    }}
                                    className="p-3 rounded-xl border border-white/10 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all flex items-center justify-center"
                                    title="Remove Image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        <div>
                            <label className="text-xs uppercase tracking-widest opacity-70">BORDER RADIUS</label>
                            <span className="ml-2 text-xs font-label">{config.customization.borderRadius}px</span>

                        </div>
                        <input type="range" min="0" max="400" value={config.customization.borderRadius} onChange={(e) => update('customization.borderRadius', Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-400 mt-2" />
                    </div>
                </div>

                {/* SECTION 3: The Moment */}
                <div className="space-y-6 pt-4 border-t border-white/10">
                    <h3 className="font-label text-xs uppercase tracking-widest text-orange-200">The Moment</h3>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest opacity-70">MOOD</label>
                        <div>
                            <div className='grid grid-cols-4 gap-3 py-2'>
                                {MOOD.map((mood) => (
                                    <button
                                        key={mood.key}
                                        onClick={() => handleMoodChange(mood)}
                                        className={`py-3 px-4 rounded-full border transition-all text-sm flex items-center justify-center gap-2 ${config.customization.mood === mood.key ? 'bg-orange-200/20 border-orange-300' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <span>{mood.emoji}</span>
                                        {mood.key}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-4 bg-amber-400 text-espresso-900 font-bold tracking-widest uppercase text-sm rounded-full shadow-lg hover:bg-amber-300 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Saving..." : "Apply Changes"}
                    </button>
                </div>
            </aside>
        </div>
    )
}

export default Customize