import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import ShareModal from '../components/ShareModal';

const MyMoments = () => {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareSlug, setShareSlug] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
      const fetchMoments = async () => {
          const token = Cookies.get('token');
          
          if (!token) {
              alert('Please login to view your moments');
              navigate('/login');
              return;
          }

          try {
              const response = await axios.get('https://moment-sandy.vercel.app/api/v1/moments', {
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
          await axios.delete(`https://moment-sandy.vercel.app/api/v1/moments/${slug}/members/${currentUserId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          // Instantly remove the moment from the collaborator's dashboard
          setMoments(prevMoments => prevMoments.filter(m => m.slug !== slug));
      } catch (error) {
          console.error("Error leaving moment:", error);
          alert("Failed to leave moment. Please try again.");
      }
  };

  const handleDelete = async (id, e) => {
      e.stopPropagation(); // Prevent the card's onClick from navigating
      
      const confirmDelete = window.confirm("Are you sure you want to permanently delete this moment?");
      if (!confirmDelete) return;

      const token = Cookies.get('token');
      try {
          await axios.delete(`https://moment-1-h67x.onrender.com/api/v1/moments/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          // Remove the moment from the screen instantly without reloading the page!
          setMoments(prevMoments => prevMoments.filter(m => m._id !== id));
      } catch (error) {
          console.error("Error deleting moment:", error);
          alert("Failed to delete moment. Please try again.");
      }
  };

  if (loading) return <div className="text-orange-50 text-center mt-32 animate-pulse">Loading your moments...</div>;

  // Find if the currently opened modal belongs to the owner so we can pass permissions to the modal!
  const selectedMoment = moments.find(m => m.slug === shareSlug);
  const isOwner = selectedMoment && currentUserId ? selectedMoment.userId === currentUserId : false;

  return (
    <div className="min-h-screen pt-32 px-8 text-orange-50 max-w-7xl mx-auto">
      <h1 className="text-4xl font-headline italic mb-12 text-orange-100">My Archives</h1>
      
      {moments.length === 0 ? (
          <p className="text-orange-100/50 font-light">You haven't created any moments yet.</p>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {moments.map(moment => {
                  // Basic logic: If we've passed the target date, it's completed!
                  const target = moment.endAt ? new Date(moment.endAt) : null;
                  const isCompleted = moment.mode === 'countdown' && target ? new Date() >= target : false;
                  const isSharedWithMe = currentUserId && moment.userId !== currentUserId;

                  return (
                  <div 
                    key={moment._id} 
                    onClick={() => navigate(`/create/${moment.mode === 'countup' ? 'count-up' : 'count-down'}`, { state: { savedConfig: moment, isCompleted } })}
                    className="relative glass-panel p-6 rounded-2xl border border-white/10 shadow-lg hover:bg-white/5 transition-all duration-300 group cursor-pointer"
                  >
                      <div className="absolute top-5 right-5 flex items-center gap-2">
                          {/* Shared Badge */}
                          {isSharedWithMe && (
                              <span className="text-[9px] font-label px-2 py-1 rounded-sm tracking-widest bg-blue-500/20 text-blue-200 border border-blue-500/30">
                                  SHARED
                              </span>
                          )}
                          <span className={`text-[9px] font-label px-2 py-1 rounded-sm tracking-widest ${isCompleted ? 'bg-green-500/20 text-green-200 border border-green-500/30' : 'bg-orange-500/20 text-orange-200 border border-orange-500/30'}`}>
                              {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                          </span>
                          
                          {/* Share Button */}
                          <button 
                              onClick={(e) => { e.stopPropagation(); setShareSlug(moment.slug); }}
                              className="text-orange-100/50 hover:text-amber-400 transition-colors p-1"
                              title="Share moment"
                          >
                              <span className="material-symbols-outlined text-sm">share</span>
                          </button>

                          {/* Leave Button - Only show if the user is a COLLABORATOR */}
                          {isSharedWithMe && (
                              <button 
                                  onClick={(e) => handleLeave(moment.slug, e)}
                                  className="text-orange-100/50 hover:text-red-400 transition-colors p-1"
                                  title="Leave moment"
                              >
                                  <span className="material-symbols-outlined text-sm">logout</span>
                              </button>
                          )}

                          {/* Delete Button - Only show if the user is the OWNER */}
                          {!isSharedWithMe && (
                              <button 
                                  onClick={(e) => handleDelete(moment._id, e)}
                                  className="text-orange-100/50 hover:text-red-400 transition-colors p-1"
                                  title="Delete moment"
                              >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                          )}
                      </div>

                      <h2 className="text-2xl font-headline font-bold mb-2 group-hover:text-orange-200 transition-colors">{moment.title}</h2>
                      <p className="text-orange-100/50 text-sm mb-6 font-label uppercase tracking-widest">{moment.endAt ? new Date(moment.endAt).toLocaleDateString() : 'No Deadline'}</p>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-200/10 border border-orange-200/20">
                          <span className="text-lg">{moment.customization?.mood === 'hopeful' ? '🍀' : '✨'}</span>
                          <span className="text-xs font-label uppercase tracking-widest text-orange-200">{moment.customization?.mood}</span>
                      </div>
                  </div>
              )})}
          </div>
      )}

      {/* The Share Modal */}
      <ShareModal isOpen={!!shareSlug} onClose={() => setShareSlug(null)} slug={shareSlug} isOwner={isOwner} />
    </div>
  )
}

export default MyMoments 