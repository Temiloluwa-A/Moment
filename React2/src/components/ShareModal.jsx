import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Avatar from './Avatar';

const ShareModal = ({ isOpen, onClose, slug, isOwner }) => {
    const [copied, setCopied] = useState(false);
    const [collabCopied, setCollabCopied] = useState(false);
    const [members, setMembers] = useState([]);

    // Construct the live link
    const shareLink = `https://moment-1-h67x.onrender.com/moment/${slug}`;
    const collabLink = `https://moment-1-h67x.onrender.com/join/${slug}`; // Special route for adding members!

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCollabCopy = () => {
        navigator.clipboard.writeText(collabLink);
        setCollabCopied(true);
        setTimeout(() => setCollabCopied(false), 2000);
    };

    const handleRemoveMember = async (memberId, memberName) => {
        const confirmRemove = window.confirm(`Remove ${memberName} from this moment?`);
        if (!confirmRemove) return;

        const token = Cookies.get('token');
        try {
            await axios.delete(`https://moment-1-h67x.onrender.com/api/v1/moments/${slug}/members/${memberId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMembers(prev => prev.filter(m => m._id !== memberId));
        } catch (err) {
            console.error("Failed to remove member", err);
            alert("Failed to remove member");
        }
    };

    // Fetch the latest members when the modal opens!
    useEffect(() => {
        if (isOpen && slug) {
            axios.get(`https://moment-1-h67x.onrender.com/api/v1/moments/shared/${slug}`)
                .then(res => {
                    setMembers(res.data.data.members || []);
                })
                .catch(err => console.error("Failed to fetch members", err));
        }
    }, [isOpen, slug]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-stone-900 p-6 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-orange-100/50 hover:text-orange-200 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h2 className="text-2xl font-headline italic font-bold text-orange-50 mb-2">Share Moment</h2>
                <p className="text-orange-100/60 font-light text-sm mb-6">
                    Anyone with this link can view this moment in real-time.
                </p>

                <div className="flex items-center bg-black/30 border border-white/10 rounded-lg p-2 mb-4">
                    <input type="text" readOnly value={shareLink} className="bg-transparent text-orange-50 w-full px-2 outline-none text-sm" />
                    <button onClick={handleCopy} className="bg-amber-500 hover:bg-amber-400 text-stone-900 px-4 py-2 rounded-md text-sm font-label uppercase tracking-widest font-bold transition-all w-24 text-center shrink-0">
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <section>
                    <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-orange-300 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">group</span> Collaboration
                    </h3>
                    <div className="space-y-6 bg-surface-container-low/30 p-5 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-stone-500">Members</span>
                            <div className="flex items-center -space-x-2">
                                {members.length === 0 ? (
                                    <span className="text-[10px] text-stone-500 italic mr-2 tracking-normal lowercase">No collaborators yet</span>
                                ) : (
                                    members.slice(0, 3).map(member => (
                                        <div key={member._id} className="relative group shrink-0">
                                            <Avatar 
                                                seed={member.userName || member.email}
                                                avatarStyle={member.avatarStyle}
                                                options={member.avatarOptions}
                                                className="w-8 h-8 rounded-full border-2 border-stone-900 bg-stone-800 relative z-0 group-hover:z-10 transition-transform group-hover:scale-110"
                                            />
                                            {isOwner && (
                                                <button
                                                    onClick={() => handleRemoveMember(member._id, member.userName || member.email)}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                                    title="Remove member"
                                                >
                                                    <span className="material-symbols-outlined text-[10px]">close</span>
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                                {members.length > 3 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-stone-900 bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-500 shrink-0 z-10 relative">
                                        +{members.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="block font-label text-[10px] uppercase text-stone-500 ml-1">Invite to Join timer</label>
                            <div className="flex gap-2">
                                <input className="grow bg-stone-950 border border-white/5 rounded-md py-3 px-4 text-orange-50 text-xs focus:outline-none focus:border-orange-200/50 transition-all" readOnly value={collabLink} type="text" />
                                <button onClick={handleCollabCopy} className="px-4 bg-amber-500 text-stone-900 hover:bg-amber-400 rounded-md transition-colors flex items-center justify-center font-label text-[10px] uppercase font-bold tracking-widest w-24 shrink-0">
                                    {collabCopied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
        </div>
        </div >
    );
};

export default ShareModal;