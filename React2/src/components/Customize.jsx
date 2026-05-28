import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import BasicsTab from './BasicsTab';
import LookTab from './LookTab';
import MomentTab from './MomentTab';
import BottomDrawer from './BottomDrawer';
import './Customize.css';

const Customize = () => {
    const { config } = useTimer();
    const location = useLocation();
    const [isSaving, setIsSaving] = useState(false);
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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = Cookies.get('token');
            if (!token) {
                alert("Please log in to save your moment!");
                return;
            }

            const isCountUp = location.pathname.includes('count-up');
            const payload = { ...config, mode: isCountUp ? 'countup' : 'countdown' };

            let dataToSend = payload;

            if (config._id) {
                await axios.patch(`https://moment-sandy.vercel.app/api/v1/moments/${config._id}`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Moment updated successfully!");
            } else {
                await axios.post('https://moment-sandy.vercel.app/api/v1/moments', dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Moment created successfully!");
            }
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Failed to save moment. Please try again.";
            alert(`Backend Error: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

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
            <div className="customize-panel h-full flex flex-col text-orange-50">
                {/* Header */}
                <div className="border-b border-white/10 pb-4 px-6 pt-6">
                    <h2 className="text-sm font-label tracking-[0.2em] text-orange-100/50 uppercase">Create</h2>
                    <h5 className="text-2xl font-headline italic mt-1 text-orange-100">Customize your moment</h5>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 border-b border-white/10 px-6 pt-4">
                    {['Basics', 'Look', 'Moment'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`py-3 px-4 text-sm font-label uppercase tracking-widest transition-all border-b-2 ${
                                activeTab === tab.toLowerCase()
                                    ? 'text-orange-300 border-orange-300'
                                    : 'text-orange-100/60 border-transparent hover:text-orange-100/80'
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
                <div className="border-t border-white/10 p-6">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-4 bg-amber-400 text-espresso-900 font-bold tracking-widest uppercase text-sm rounded-full shadow-lg hover:bg-amber-300 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Saving..." : "Apply Changes"}
                    </button>
                </div>
            </div>
        );
    }

    // Mobile / small screens: show floating button that opens BottomDrawer
    return (
        <div className="customize-container">
            <div className="timer-full-screen">
                <div className="timer-content" />

                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="floating-customize-btn"
                    aria-label="Open customize drawer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-palette" viewBox="0 0 16 16">
                        <path d="M6.002 1a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm2.646 9l.914-2.743a1 1 0 0 0-1.872-1.086l-.914 2.743a2 2 0 1 0 1.872 1.086zM12 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm1 11.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM0 6.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 0-1H.5a.5.5 0 0 0-.5.5z" />
                    </svg>
                    <span>Customize</span>
                </button>
            </div>

            <BottomDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            >
                <div className="drawer-content-wrapper">
                    {renderTabContent()}
                </div>

                <div className="sticky bottom-0 bg-gradient-to-t from-stone-900 via-stone-900 to-transparent pt-6 pb-8 px-4 -mx-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-4 bg-amber-400 text-espresso-900 font-bold tracking-widest uppercase text-sm rounded-full shadow-lg hover:bg-amber-300 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Saving..." : "Apply Changes"}
                    </button>
                </div>
            </BottomDrawer>
        </div>
    );
};

export default Customize;
