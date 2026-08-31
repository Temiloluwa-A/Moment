import { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import { useToast } from '../context/ToastContext';
import BasicsTab from './BasicsTab';
import LookTab from './LookTab';
import MomentTab from './MomentTab';
import BottomDrawer from './BottomDrawer';
import './Customize.css';

const Customize = ({ readOnly = false }) => {
    const { config } = useTimer();
    const location = useLocation();
    const { isLoggedIn } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('basics');
    const [isDesktop, setIsDesktop] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const update = () => setIsDesktop(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    const { showToast } = useToast();

    const saveMutation = useMutation({
        mutationFn: async () => {
            const isCountUp = location.pathname.includes('count-up');
            const payload = { ...config, mode: isCountUp ? 'countup' : 'countdown' };

            const bgFile = config.customization?.background?.file;
            const giftVideoFile = config.customization?.trigger?.media?.file;
            const customizationCopy = JSON.parse(JSON.stringify(payload.customization || {}));
            if (customizationCopy.background) delete customizationCopy.background.file;
            if (customizationCopy.trigger?.media) delete customizationCopy.trigger.media.file;

            if (bgFile || giftVideoFile) {
                const formData = new FormData();
                if (bgFile) {
                    formData.append('backgroundImage', bgFile);
                }
                if (giftVideoFile) {
                    formData.append('giftVideo', giftVideoFile);
                }

                formData.append('title', payload.title || '');
                formData.append('mode', payload.mode || 'countdown');
                if (payload.startAt) formData.append('startAt', payload.startAt);
                if (payload.endAt) formData.append('endAt', payload.endAt);
                formData.append('timeZone', payload.timeZone || '');
                formData.append('isPublic', payload.isPublic ? 'true' : 'false');
                formData.append('isGift', payload.isGift ? 'true' : 'false');
                formData.append('units', JSON.stringify(payload.units || {}));
                formData.append('customization', JSON.stringify(customizationCopy));

                // No explicit Content-Type here on purpose: the browser needs to set
                // multipart/form-data itself so it can attach the boundary — setting
                // it manually strips the boundary and breaks upload parsing server-side.
                return config._id
                    ? api.patch(`/moments/${config._id}`, formData)
                    : api.post('/moments', formData);
            }

            return config._id
                ? api.patch(`/moments/${config._id}`, payload)
                : api.post('/moments', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moments'] });
            showToast({
                type: 'success',
                title: 'Saved',
                description: config._id ? 'Moment updated successfully!' : 'Moment created successfully!',
            });
        },
        onError: (error) => {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Failed to save moment. Please try again.";
            showToast({ type: 'error', title: 'Save failed', description: errorMsg });
        },
    });

    const handleSave = () => {
        if (!isLoggedIn) {
            showToast({ type: 'warning', title: 'Login required', description: 'Please log in to save your moment!' });
            return;
        }
        saveMutation.mutate();
    };

    // A completed countdown, or a moment you don't own, is view-only: hide all editing UI (desktop panel + mobile drawer).
    if (readOnly) return null;

    // Render the appropriate tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'basics':
                return <BasicsTab />;
            case 'look':
                return <LookTab />;
            case 'moment':
                return <MomentTab />;
            default:
                return <BasicsTab />;
        }
    };

    // Render desktop side panel when large viewport; otherwise render mobile drawer + floating button
    if (isDesktop) {
        return (
            <div className="customize-panel h-full flex flex-col text-text">
                {/* Header */}
                <div className="border-b border-border pb-4 px-6 pt-6">
                    <h2 className="text-sm font-label tracking-[0.2em] text-text/50 uppercase">Create</h2>
                    <h5 className="text-2xl font-headline italic mt-1 text-text">Customize your moment</h5>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 border-b border-border px-6 pt-4">
                    {['Basics', 'Look', 'Moment'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`py-3 px-4 text-sm font-label uppercase tracking-widest transition-all border-b-2 ${
                                activeTab === tab.toLowerCase()
                                    ? 'text-primary border-primary'
                                    : 'text-text/60 border-transparent hover:text-text/80'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="tab-content">
                        {renderTabContent()}
                    </div>
                </div>

                {/* Save Button */}
                <div className="border-t border-border p-6">
                    <button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="w-full py-4 bg-primary text-on-primary font-bold tracking-widest uppercase text-sm rounded-full shadow-lg hover:bg-primary hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saveMutation.isPending ? "Saving..." : "Apply Changes"}
                    </button>
                </div>
            </div>
        );
    }

    // Mobile / small screens: show floating button that opens BottomDrawer
    return (
        <>
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="floating-customize-btn"
                    aria-label="Open customize drawer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-palette" viewBox="0 0 16 16">
                        <path d="M6.002 1a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm2.646 9l.914-2.743a1 1 0 0 0-1.872-1.086l-.914 2.743a2 2 0 1 0 1.872 1.086zM12 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm1 11.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM0 6.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 0-1H.5a.5.5 0 0 0-.5.5z" />
                    </svg>
                    <span>Customize</span>
                </button>

                <BottomDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            >
                <div className="drawer-content-wrapper">
                    {renderTabContent()}
                </div>

                <div className="sticky bottom-0 bg-linear-to-t from-surface via-surface to-transparent pt-6 pb-8 px-4 -mx-4">
                    <button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="w-full py-4 bg-primary text-on-primary font-bold tracking-widest uppercase text-sm rounded-full shadow-lg hover:bg-primary hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saveMutation.isPending ? "Saving..." : "Apply Changes"}
                    </button>
                </div>
            </BottomDrawer>
        </>
    );
};

export default Customize;
