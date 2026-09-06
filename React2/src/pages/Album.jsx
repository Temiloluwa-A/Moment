import { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAlbum } from '../hooks/useAlbum';
import { useSharedMoment } from '../hooks/useSharedMoment';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AlbumBoard from '../components/AlbumBoard';

const Album = () => {
    const { slug } = useParams();
    const { user, isLoggedIn } = useAuth();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const [pendingFile, setPendingFile] = useState(null);
    const [note, setNote] = useState('');
    const [votingPinId, setVotingPinId] = useState(null);

    const { data: moment, isLoading: isMomentLoading } = useSharedMoment(slug);
    const { data: album, isLoading: isAlbumLoading } = useAlbum(slug);

    const canContribute = !!(
        isLoggedIn && user && moment &&
        (moment.userId?._id === user._id || moment.members?.some((m) => m._id === user._id))
    );

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['album', slug] });

    const addPinMutation = useMutation({
        mutationFn: (formData) => api.post(`/moments/${slug}/album/pins`, formData),
        onSuccess: () => {
            invalidate();
            setPendingFile(null);
            setNote('');
            showToast({ type: 'success', title: 'Pinned', description: 'Your photo is on the board.' });
        },
        onError: (err) => showToast({ type: 'error', title: 'Could not pin photo', description: err.response?.data?.message || 'Please try again.' }),
    });

    const repositionMutation = useMutation({
        mutationFn: ({ pinId, x, y }) => api.patch(`/moments/${slug}/album/pins/${pinId}/position`, { x, y }),
        onSuccess: invalidate,
        onError: () => showToast({ type: 'error', title: 'Could not move pin', description: 'Please try again.' }),
    });

    const voteMutation = useMutation({
        mutationFn: (pinId) => api.post(`/moments/${slug}/album/pins/${pinId}/delete-vote`),
        onSuccess: (res) => {
            invalidate();
            showToast(
                res.data.data.deleted
                    ? { type: 'success', title: 'Removed', description: 'The pin was voted off the board.' }
                    : { type: 'info', title: 'Vote recorded', description: `${res.data.data.currentVotes}/${res.data.data.requiredVotes} votes to remove.` }
            );
        },
        onError: (err) => showToast({ type: 'error', title: 'Could not vote', description: err.response?.data?.message || 'Please try again.' }),
        onSettled: () => setVotingPinId(null),
    });

    const handleFileChosen = (e) => {
        const file = e.target.files?.[0];
        if (file) setPendingFile(file);
        e.target.value = '';
    };

    const handleSubmitPin = () => {
        if (!pendingFile) return;
        const formData = new FormData();
        formData.append('pinImage', pendingFile);
        formData.append('note', note);
        addPinMutation.mutate(formData);
    };

    const handleVote = (pin) => {
        setVotingPinId(pin._id);
        voteMutation.mutate(pin._id);
    };

    if (isMomentLoading || isAlbumLoading) {
        return <div className="min-h-screen flex items-center justify-center text-text/50 uppercase tracking-widest text-sm animate-pulse">Loading album...</div>;
    }

    return (
        <div className="min-h-screen pt-28 px-4 sm:px-8 pb-24 max-w-4xl mx-auto text-text">
            <Link to={`/moment/${slug}`} className="inline-flex items-center gap-1 text-xs font-label uppercase tracking-widest text-text/60 hover:text-primary transition-colors mb-4">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Back to moment
            </Link>

            <h1 className="text-3xl sm:text-4xl font-headline italic mb-1 text-text">{moment?.title || 'Untitled moment'}</h1>
            <p className="font-label text-xs uppercase tracking-[0.2em] text-primary mb-8">Album</p>

            {!album?.isOpen && (
                <div className="mb-6 rounded-2xl border border-border bg-surface/60 px-5 py-3 text-sm text-text/70">
                    {moment?.mode === 'countdown'
                        ? "This countdown has ended — the board is now a keepsake and can't be changed."
                        : 'This board is full — no more photos can be pinned.'}
                </div>
            )}

            <AlbumBoard
                pins={album?.pins || []}
                isOpen={!!album?.isOpen}
                canContribute={canContribute}
                onReposition={(pinId, x, y) => repositionMutation.mutate({ pinId, x, y })}
                onVote={handleVote}
                votingPinId={votingPinId}
            />

            {canContribute && album?.isOpen && (
                <div className="mt-8 flex flex-col items-center gap-4">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChosen} className="hidden" />

                    {pendingFile ? (
                        <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <img src={URL.createObjectURL(pendingFile)} alt="Preview" className="w-14 h-14 object-cover rounded-lg shrink-0" />
                                <p className="text-xs text-text-muted truncate">{pendingFile.name}</p>
                            </div>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value.slice(0, 300))}
                                placeholder="Add a little note (optional)"
                                maxLength={300}
                                rows={2}
                                className="w-full bg-input-bg border border-input-border rounded-xl px-3 py-2 text-sm text-text resize-none focus:outline-none focus:border-primary/50"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setPendingFile(null); setNote(''); }}
                                    className="flex-1 py-2.5 rounded-full border border-border-mid text-text font-label text-xs uppercase tracking-widest hover:border-primary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitPin}
                                    disabled={addPinMutation.isPending}
                                    className="flex-1 py-2.5 rounded-full bg-primary text-on-primary font-label text-xs uppercase tracking-widest font-bold hover:bg-primary-hover transition-all disabled:opacity-60"
                                >
                                    {addPinMutation.isPending ? 'Pinning…' : 'Pin it'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-primary text-on-primary font-label text-xs uppercase tracking-widest font-bold shadow-lg hover:bg-primary-hover hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-base">add_photo_alternate</span>
                            Add a photo
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Album;
