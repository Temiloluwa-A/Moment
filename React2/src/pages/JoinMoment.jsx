import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useSharedMoment } from '../hooks/useSharedMoment';
import { useToast } from '../context/ToastContext';

const JoinMoment = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { isLoggedIn } = useAuth();
    const queryClient = useQueryClient();

    // A user must be logged in to accept an invite!
    useEffect(() => {
        if (!isLoggedIn) {
            showToast({ type: 'warning', title: 'Login required', description: 'Please log in to accept the invitation.' });
            navigate('/login');
        }
    }, [isLoggedIn, navigate, showToast]);

    const { data: moment, isLoading, isError, error } = useSharedMoment(slug, { enabled: isLoggedIn });

    const joinMutation = useMutation({
        mutationFn: () => api.post(`/moments/${slug}/join`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shared-moment', slug] });
            queryClient.invalidateQueries({ queryKey: ['moments'] });
            showToast({ type: 'success', title: 'Joined', description: 'Successfully joined the moment!' });
            navigate('/my-moments'); // Redirect them to their moments where it will now appear
        },
        onError: (err) => {
            const errorMsg = err.response?.data?.message || "Failed to join moment. Please try again.";
            showToast({ type: 'error', title: 'Join failed', description: errorMsg });

            // If they are already a member or the owner, just redirect them anyway!
            if (typeof errorMsg === 'string' && (errorMsg.includes("already a member") || errorMsg.includes("owner"))) {
                navigate('/my-moments');
            }
        },
    });

    if (!isLoggedIn || isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-text/50 uppercase tracking-widest text-sm animate-pulse">Loading invitation...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center pt-16 px-4 md:px-8 text-text">
            <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-lg max-w-lg text-center flex flex-col items-center">
                {isError ? (
                    <p className="text-error">{error.response?.data?.message || "Could not find this moment. The link may be invalid or the moment is no longer public."}</p>
                ) : !moment.userId ? (
                    // The owner's account no longer exists — the moment is orphaned
                    // (hidden from Explore/My Moments already; joining it doesn't
                    // make sense since no one is left to manage it).
                    <p className="text-error">This invitation is no longer valid — the owner's account no longer exists.</p>
                ) : (
                    <>
                        <Avatar seed={moment.userId.userName} className="w-20 h-20 rounded-full mb-4" />
                        <p className="text-text/60 mb-2">You've been invited by <span className="font-bold text-text">{moment.userId.userName}</span> to collaborate on:</p>
                        <h1 className="text-4xl font-headline italic text-primary mb-8">"{moment.title}"</h1>
                        <button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending} className="w-full max-w-xs py-4 bg-primary text-on-primary font-bold tracking-widest uppercase text-sm rounded-full shadow-lg hover:bg-primary-hover hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed">
                            {joinMutation.isPending ? "Joining..." : "Accept Invitation"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default JoinMoment;
