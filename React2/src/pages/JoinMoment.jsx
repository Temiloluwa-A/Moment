import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Avatar from '../components/Avatar';

const JoinMoment = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [moment, setMoment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        const fetchMomentDetails = async () => {
            // A user must be logged in to accept an invite!
            if (!Cookies.get('token')) {
                alert("Please log in to accept the invitation.");
                navigate('/login');
                return;
            }

            try {
                const res = await axios.get(`https://moment-1-h67x.onrender.com/api/v1/moments/shared/${slug}`);
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
            const token = Cookies.get('token');
            await axios.post(`https://moment-1-h67x.onrender.com/api/v1/moments/${slug}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert("Successfully joined the moment!");
            navigate('/my-moments'); // Redirect them to their moments where it will now appear
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to join moment. Please try again.";
            alert(errorMsg);
            
            // If they are already a member or the owner, just redirect them anyway!
            if (errorMsg.includes("already a member") || errorMsg.includes("owner")) {
                navigate('/my-moments');
            }
        } finally {
            setIsJoining(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-orange-50/50 uppercase tracking-widest text-sm animate-pulse">Loading invitation...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center pt-16 px-4 md:px-8 text-orange-50">
            <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-lg max-w-lg text-center flex flex-col items-center">
                {error ? (
                    <p className="text-red-400">{error}</p>
                ) : (
                    <>
                        <Avatar seed={moment.userId.userName} className="w-20 h-20 rounded-full mb-4" />
                        <p className="text-orange-100/60 mb-2">You've been invited by <span className="font-bold text-orange-100">{moment.userId.userName}</span> to collaborate on:</p>
                        <h1 className="text-4xl font-headline italic text-amber-300 mb-8">"{moment.title}"</h1>
                        <button onClick={handleJoin} disabled={isJoining} className="w-full max-w-xs py-4 bg-amber-400 text-espresso-900 font-bold tracking-widest uppercase text-sm rounded-full shadow-lg hover:bg-amber-300 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isJoining ? "Joining..." : "Accept Invitation"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default JoinMoment;