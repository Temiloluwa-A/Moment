import { useState, useEffect } from 'react';
import api from '../api/client';
import Avatar from './Avatar';
import { useToast } from '../context/ToastContext';

const ShareModal = ({ isOpen, onClose, slug, isOwner }) => {
    const { showToast } = useToast();
    const [copied, setCopied] = useState(false);
    const [collabCopied, setCollabCopied] = useState(false);
    const [members, setMembers] = useState([]);

    // These are pages on this site (App.jsx), not API endpoints — build them
    // off the site's own origin, not the backend's.
    const shareLink = `${window.location.origin}/moment/${slug}`;
    const collabLink = `${window.location.origin}/join/${slug}`; // Special route for adding members!

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

        try {
            await api.delete(`/moments/${slug}/members/${memberId}`);
            setMembers(prev => prev.filter(m => m._id !== memberId));
            showToast({ type: 'success', title: 'Member removed', description: `${memberName} was removed from this moment.` });
        } catch (err) {
            console.error("Failed to remove member", err);
            showToast({ type: 'error', title: 'Remove failed', description: 'Failed to remove member.' });
        }
    };

    // Fetch the latest members when the modal opens!
    useEffect(() => {
        if (isOpen && slug) {
            api.get(`/moments/shared/${slug}`)
                .then(res => {
                    setMembers(res.data.data.members || []);
                })
                .catch(err => console.error("Failed to fetch members", err));
        }
    }, [isOpen, slug]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-surface p-6 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text/50 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h2 className="text-2xl font-headline italic font-bold text-text mb-2">Share Moment</h2>
                <p className="text-text/60 font-light text-sm mb-6">
                    Anyone with this link can view this moment. Reload the page to see the latest updates.
                </p>

                <div className="flex items-center bg-black/30 border border-white/10 rounded-lg p-2 mb-4">
                    <input type="text" readOnly value={shareLink} className="bg-transparent text-text w-full px-2 outline-none text-sm" />
                    <button onClick={handleCopy} className="bg-primary hover:bg-primary-hover text-on-primary px-4 py-2 rounded-md text-sm font-label uppercase tracking-widest font-bold transition-all w-24 text-center shrink-0">
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <section>
                    <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">group</span> Collaboration
                    </h3>
                    <div className="space-y-6 bg-surface/30 p-5 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-text-subtle">Members</span>
                            <div className="flex items-center -space-x-2">
                                {members.length === 0 ? (
                                    <span className="text-[10px] text-text-subtle italic mr-2 tracking-normal lowercase">No collaborators yet</span>
                                ) : (
                                    members.slice(0, 3).map(member => (
                                        <div key={member._id} className="relative group shrink-0">
                                            <Avatar 
                                                seed={member.userName || member.email}
                                                avatarStyle={member.avatarStyle}
                                                options={member.avatarOptions}
                                                className="w-8 h-8 rounded-full border-2 border-surface bg-surface-high relative z-0 group-hover:z-10 transition-transform group-hover:scale-110"
                                            />
                                            {isOwner && (
                                                <button
                                                    onClick={() => handleRemoveMember(member._id, member.userName || member.email)}
                                                    className="absolute -top-1 -right-1 bg-error text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                                    title="Remove member"
                                                >
                                                    <span className="material-symbols-outlined text-[10px]">close</span>
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                                {members.length > 3 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 z-10 relative">
                                        +{members.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="block font-label text-[10px] uppercase text-text-subtle ml-1">Invite to Join timer</label>
                            <div className="flex gap-2">
                                <input className="grow bg-input-bg border border-white/5 rounded-md py-3 px-4 text-text text-xs focus:outline-none focus:border-primary/50 transition-all" readOnly value={collabLink} type="text" />
                                <button onClick={handleCollabCopy} className="px-4 bg-primary text-on-primary hover:bg-primary-hover rounded-md transition-colors flex items-center justify-center font-label text-[10px] uppercase font-bold tracking-widest w-24 shrink-0">
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