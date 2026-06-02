import { useContext, createContext, useState } from "react";

const TimerContext = createContext(null)

export function TimerProvider({children}) {
    const [config, setconfig] = useState({
        mode: 'countdown',
        title: 'Untitled moment',
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        units:{
            days:true,
            hours:true,
            minutes:true,
            seconds:true
        },
        isGift:false,
        isPublic: false,
        notify: true,
        customization: {
            font: 'noto',
            background: { type: 'solid', value: '#1a2b3c', publicId: null, format: null },
            timerSize: 80,
            borderRadius: 50,
            borderStyle: { width: 1, color: 'transparent', style: 'solid' },
            mood: 'hopeful',
            moodNote: 'Something worth waiting for....',
            trigger: { type: 'preset', preset: 'confetti', media: { secure_url: null, publicId: null, resourceType: null } }
        }
    })
    function update(field, value){
        setconfig(prev => {
            const next = { ...prev };
            const keys = field.split('.');

            if (keys.length > 1) {
                let cursor = next;
                for (let i = 0; i < keys.length - 1; i++) {
                    const key = keys[i];
                    const existing = cursor[key];
                    cursor[key] = existing && typeof existing === 'object' && !Array.isArray(existing)
                        ? { ...existing }
                        : {};
                    cursor = cursor[key];
                }
                cursor[keys[keys.length - 1]] = value;
                return next;
            }

            next[field] = value;
            return next;
        })
    }

    // Allows us to load an entire saved configuration from the database at once!
    function loadConfig(newConfig){
        // Backwards compatibility: If we load an old moment from the DB that doesn't 
        // have the new 'customization' folder, we build it on the fly so React doesn't crash!
        if (!newConfig.customization) {
            newConfig.customization = {
                font: newConfig.font || 'noto',
                background: newConfig.background || { type: 'solid', value: '#1a2b3c' },
                timerSize: newConfig.timersize || 80,
                borderRadius: newConfig.borderRadius || 15,
                borderStyle: { width: 1, color: 'transparent', style: 'solid' },
                mood: newConfig.mood || null,
                moodNote: newConfig.moodNote || '',
                trigger: { type: 'preset', preset: 'confetti', media: { secure_url: null, publicId: null, resourceType: null } }
            };
        }
        setconfig(newConfig)
    }

    return(
        <TimerContext.Provider value={{config, update, loadConfig}}>
            {children}
        </TimerContext.Provider>
    )
}

export function useTimer(){
    const ctx = useContext(TimerContext)
    if(!ctx) 
        throw new Error("useTimer can only be used inside TimerProvider")
    return ctx
}