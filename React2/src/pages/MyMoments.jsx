import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import ShareModal from '../components/ShareModal';
import SavedMoment from '../components/SavedMoment';
import { useToast } from '../context/ToastContext';

const MyMoments = () => {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareSlug, setShareSlug] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
      const fetchMoments = async () => {
          const token = Cookies.get('token');
          
          if (!token) {
              showToast({ type: 'warning', title: 'Login required', description: 'Please login to view your moments' });
              navigate('/login');
              return;
          }

          try {
              const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/moments`, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setMoments(response.data.data);
              setCurrentUserId(response.data.currentUserId);
          } catch (error) {
              console.error("Error fetching moments:", error);
          } finally {
              setLoading(false);
          }
      };

      fetchMoments();
  }, [navigate]);

  const handleLeave = async (slug, e) => {
      e.stopPropagation();
      const confirmLeave = window.confirm("Are you sure you want to leave this shared moment?");
      if (!confirmLeave) return;

      const token = Cookies.get('token');
      try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/moments/${slug}/members/${currentUserId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          // Instantly remove the moment from the collaborator's dashboard
          setMoments(prevMoments => prevMoments.filter(m => m.slug !== slug));
      } catch (error) {
          console.error("Error leaving moment:", error);
          showToast({ type: 'error', title: 'Leave failed', description: 'Failed to leave moment. Please try again.' });
      }
  };

  const handleDelete = async (id, e) => {
      e.stopPropagation(); // Prevent the card's onClick from navigating
      
      const confirmDelete = window.confirm("Are you sure you want to permanently delete this moment?");
      if (!confirmDelete) return;

      const token = Cookies.get('token');
      try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/moments/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          // Remove the moment from the screen instantly without reloading the page!
          setMoments(prevMoments => prevMoments.filter(m => m._id !== id));
      } catch (error) {
          console.error("Error deleting moment:", error);
          showToast({ type: 'error', title: 'Delete failed', description: 'Failed to delete moment. Please try again.' });
      }
  };

  if (loading) return <div className="text-orange-50 text-center mt-32 animate-pulse">Loading your moments...</div>;

  // Find if the currently opened modal belongs to the owner so we can pass permissions to the modal!
  const selectedMoment = moments.find(m => m.slug === shareSlug);
  const isOwner = selectedMoment && currentUserId ? selectedMoment.userId === currentUserId : false;



  return (
    <div className=" pt-32 px-8 text-orange-50 max-w-7xl mx-auto">
      <h1 className="text-4xl font-headline italic mb-12 text-orange-100">My Archives</h1>
      
      {moments.length === 0 ? (
          <p className="text-orange-100/50 font-light">You haven't created any moments yet.</p>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {moments.map(moment => {
                  // Basic logic: If we've passed the target date, it's completed!
                  const target = moment.endAt ? new Date(moment.endAt) : null;
                  const isCompleted = moment.mode === 'countdown' && target ? new Date() >= target : false;
                  const isSharedWithMe = currentUserId && moment.userId !== currentUserId;

                  return (
                  <SavedMoment
                    key={moment._id}
                    moment={moment}
                    compact
                    onClick={() => navigate(`/create/${moment.mode === 'countup' ? 'count-up' : 'count-down'}`, { state: { savedConfig: moment, isCompleted } })}
                    headerLeft={
                        <span className="inline-flex flex-wrap items-center gap-2">
                            {/* Shared Badge */}
                            {isSharedWithMe && (
                                <span className="text-[9px] font-label px-2 py-1 rounded-sm tracking-widest bg-blue-500/20 text-blue-200 border border-blue-500/30">
                                    SHARED
                                </span>
                            )}
                            <span className={`text-[9px] font-label px-2 py-1 rounded-sm tracking-widest ${isCompleted ? 'bg-green-500/20 text-green-200 border border-green-500/30' : 'bg-orange-500/20 text-orange-200 border border-orange-500/30'}`}>
                                {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                            </span>
                        </span>
                    }
                    headerRight={<></>}
                    actions={
                        <span className="inline-flex items-center gap-1">
                            {/* Share Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setShareSlug(moment.slug); }}
                                className="text-orange-100/70 hover:text-amber-400 transition-colors p-1"
                                title="Share moment"
                            >
                                <span className="material-symbols-outlined text-base">share</span>
                            </button>

                            {/* Leave Button - Only show if the user is a COLLABORATOR */}
                            {isSharedWithMe && (
                                <button
                                    onClick={(e) => handleLeave(moment.slug, e)}
                                    className="text-orange-100/70 hover:text-red-400 transition-colors p-1"
                                    title="Leave moment"
                                >
                                    <span className="material-symbols-outlined text-base">logout</span>
                                </button>
                            )}

                            {/* Delete Button - Only show if the user is the OWNER */}
                            {!isSharedWithMe && (
                                <button
                                    onClick={(e) => handleDelete(moment._id, e)}
                                    className="text-orange-100/70 hover:text-red-400 transition-colors p-1"
                                    title="Delete moment"
                                >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                            )}
                        </span>
                    }
                  />
              )})}
          </div>
      )}

      {/* The Share Modal */}
      <ShareModal isOpen={!!shareSlug} onClose={() => setShareSlug(null)} slug={shareSlug} isOwner={isOwner} />
    </div>
  )
}

export default MyMoments 