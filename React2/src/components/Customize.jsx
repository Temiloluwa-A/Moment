import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import BottomDrawer from './BottomDrawer';
import BasicsTab from './BasicsTab';
import LookTab from './LookTab';
import MomentTab from './MomentTab';
import './Customize.css';

const Customize = () => {
    const { config } = useTimer();
    const location = useLocation();
    const [isSaving, setIsSaving] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('basics');

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
                await axios.patch(`https://moment-1-h67x.onrender.com/api/v1/moments/${config._id}`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Moment updated successfully!");
            } else {
                await axios.post('https://moment-1-h67x.onrender.com/api/v1/moments', dataToSend, {
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

    return (
        <div className="customize-container">
            {/* Mobile: Full screen Timer view with floating button */}
            <div className="timer-full-screen">
                {/* Timer component takes full height on mobile */}
                <div className="timer-content">
                    {/* Timer component will be rendered here by parent */}
                </div>

                {/* Floating Customize Button */}
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

            {/* Bottom Drawer */}
            <BottomDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            >
                <div className="drawer-content-wrapper">
                    {renderTabContent()}
                </div>

                {/* Save Button at Bottom of Drawer */}
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
