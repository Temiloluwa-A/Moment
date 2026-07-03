import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useToast } from '../context/ToastContext';
import SavedMoment from '../components/SavedMoment';

const Explore = () => {
  const [publicMoments, setPublicMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rootLoading, setRootLoading] = useState({});

  const { showToast } = useToast();

  const handleRoot = async (momentId) => {
      const token = Cookies.get('token');
      if (!token) {
          showToast({ type: 'warning', title: 'Login required', description: 'Log in to root a moment.' });
          return;
      }

      setRootLoading((prev) => ({ ...prev, [momentId]: true }));
      try {
          const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/v1/moments/${momentId}/root`,
              {},
              {
                  headers: { Authorization: `Bearer ${token}` }
              }
          );

          const newCount = response.data.rootCount || 0;
          const didRoot = response.data.rooted; // true if rooted, false if unrooted
          setPublicMoments((prev) => prev.map((moment) => moment._id === momentId ? { ...moment, rootCount: newCount } : moment));
          showToast({ type: didRoot ? 'success':'warning', title: didRoot ? 'Rooted' : 'Unrooted', description: didRoot ? 'Your support has been added.' : 'Your support has been removed.' });
      } catch (error) {
          console.error('Error rooting moment:', error);
          showToast({ type: 'error', title: 'Root failed', description: error.response?.data?.message || 'Unable to root this moment.' });
      } finally {
          setRootLoading((prev) => ({ ...prev, [momentId]: false }));
      }
  };

  useEffect(() => {
      const fetchPublicMoments = async () => {
          try {
              const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/moments/public`);
              setPublicMoments(response.data.data);
          } catch (error) {
              console.error("Error fetching public moments:", error);
          } finally {
              setLoading(false);
          }
      };

      fetchPublicMoments();
  }, []);

  if (loading) return <div className="text-orange-50 text-center mt-32 animate-pulse">Loading the collective...</div>;

  return (
    <div className="min-h-screen pt-28 px-4 sm:px-6 lg:px-8 text-orange-50 max-w-7xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-headline italic mb-3 text-orange-100">The Collective</h1>
      <p className="font-light text-orange-100/60 mb-10 max-w-3xl">Witness and root for moments shared by the community. Every card shows the title, creator, mood, progress label, and root count.</p>
      
      {publicMoments.length === 0 ? (
          <p className="text-orange-100/60 font-light">No public moments yet. Be the first to share one!</p>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {publicMoments.map(moment => (
                  <SavedMoment
                      key={moment._id}
                      moment={moment}
                      footer={
                          <button
                              onClick={() => handleRoot(moment._id)}
                              disabled={rootLoading[moment._id]}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm font-semibold text-orange-100 transition hover:bg-orange-200/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              {rootLoading[moment._id] ? (
                                  <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-transparent" />
                              ) : (
                                  <span className="material-symbols-outlined text-base">favorite</span>
                              )}
                              {moment.rootCount || 0}
                          </button>
                      }
                  />
              ))}
          </div>
      )}
    </div>
  )
}

export default Explore