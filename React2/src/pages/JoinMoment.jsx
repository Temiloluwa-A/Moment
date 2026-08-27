import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from '../api/client';
import Avatar from '../components/Avatar';
import { useToast } from '../context/ToastContext';

const JoinMoment = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [moment, setMoment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        const fetchMomentDetails = async () => {
            // A user must be logged in to accept an invite!
            if (!Cookies.get('token')) {
                showToast({ type: 'warning', title: 'Login required', description: 'Please log in to accept the invitation.' });
                navigate('/login');
                return;
            }

            try {
                const res = await api.get(`/moments/shared/${slug}`);
                setMoment(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || "Could not find this moment. The link may be invalid or the moment is no longer public.");
            } finally {
                setLoading(false);
            }
        };
        fetchMomentDetails();
    }, [slug, navigate]);

    const handleJoin = async () => {
        setIsJoining(true);
        try {
            await api.post(`/moments/${slug}/join`, {});

            showToast({ type: 'success', title: 'Joined', description: 'Successfully joined the moment!' });
            navigate('/my-moments'); // Redirect them to their moments where it will now appear
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to join moment. Please try again.";
            showToast({ type: 'error', title: 'Join failed', description: errorMsg });
            
            // If they are already a member or the owner, just redirect them anyway!
            if (typeof errorMsg === 'string' && (errorMsg.includes("already a member") || errorMsg.includes("owner"))) {
                navigate('/my-moments');
            }
        } finally {
            setIsJoining(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-text/50 uppercase tracking-widest text-sm animate-pulse">Loading invitation...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center pt-16 px-4 md:px-8 text-text">
            <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-lg max-w-lg text-center flex flex-col items-center">
                {error ? (
                    <p className="text-error">{error}</p>
                ) : (
                    <>
                        <Avatar seed={moment.userId.userName} className="w-20 h-20 rounded-full mb-4" />
                        <p className="text-text/60 mb-2">You've been invited by <span className="font-bold text-text">{moment.userId.userName}</span> to collaborate on:</p>
                        <h1 className="text-4xl font-headline italic text-primary mb-8">"{moment.title}"</h1>
                        <button onClick={handleJoin} disabled={isJoining} className="w-full max-w-xs py-4 bg-primary text-on-primary font-bold tracking-widest uppercase text-sm rounded-full shadow-lg hover:bg-primary-hover hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isJoining ? "Joining..." : "Accept Invitation"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default JoinMoment;