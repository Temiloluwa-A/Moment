import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useToast } from '../context/ToastContext';

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
          setPublicMoments((prev) => prev.map((moment) => moment._id === momentId ? { ...moment, rootCount: newCount } : moment));
          showToast({ type: 'success', title: 'Rooted', description: `Your support has been added.` });
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

  const renderDateInfo = (moment) => {
      const now = new Date();
      const startAt = moment.startAt ? new Date(moment.startAt) : null;
      const endAt = moment.endAt ? new Date(moment.endAt) : null;
      if (moment.mode === 'countup') {
          if (!startAt) return 'Count-up moment';
          const daysSince = Math.max(0, Math.floor((now - startAt) / (1000 * 60 * 60 * 24)));
          return daysSince === 0 ? 'Started today' : `${daysSince} day${daysSince === 1 ? '' : 's'} since start`;
      }

      if (!endAt) return 'No deadline set';
      const diffDays = Math.ceil((endAt - now) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? `${diffDays} day${diffDays === 1 ? '' : 's'} left` : `Ended ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ago`;
  };

  const getBackgroundStyles = (background) => {
      if (!background) return { backgroundColor: '#0f172a' };
      if (background.type === 'image') {
          return {
              backgroundImage: `linear-gradient(rgba(15,23,42,0.72), rgba(15,23,42,0.72)), url(${background.value})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          };
      }
      if (background.type === 'gradient') {
          return {
              backgroundImage: background.value,
          };
      }
      return {
          backgroundColor: background.value,
      };
  };

  return (
    <div className="min-h-screen pt-28 px-4 sm:px-6 lg:px-8 text-orange-50 max-w-7xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-headline italic mb-3 text-orange-100">The Collective</h1>
      <p className="font-light text-orange-100/60 mb-10 max-w-3xl">Witness and root for moments shared by the community. Every card shows the title, creator, mood, progress label, and root count.</p>
      
      {publicMoments.length === 0 ? (
          <p className="text-orange-100/60 font-light">No public moments yet. Be the first to share one!</p>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {publicMoments.map(moment => {
                  const cardStyles = getBackgroundStyles(moment.customization?.background);
                  const moodLabel = moment.customization?.mood || 'Unspecified mood';
                  return (
                  <div key={moment._id} className="relative overflow-hidden rounded-[28px] border border-white/10 shadow-2xl shadow-black/20 transition-all duration-300 hover:-translate-y-0.5" style={cardStyles}>
                      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" />
                      <div className="relative flex min-h-80 flex-col justify-between p-6 sm:p-7">
                          <div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 text-xs uppercase tracking-[0.23em] text-orange-100/70 font-label">
                                  <span className="inline-flex items-center gap-2">
                                      <span className="material-symbols-outlined text-sm">person</span>
                                      {moment.userId?.userName || 'Anonymous'}
                                  </span>
                                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-orange-100">
                                      <span className="text-base">{moment.mode === 'countup' ? '↑' : '↓'}</span>
                                      {moment.mode === 'countup' ? 'Count up' : 'Count down'}
                                  </span>
                              </div>

                              <h2 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-white mb-3 leading-tight">
                                  {moment.title || 'Untitled moment'}
                              </h2>

                              <p className="text-sm text-orange-100/70 mb-5 max-w-xl">{renderDateInfo(moment)}</p>

                              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-orange-100/80 font-bold border border-white/10">
                                  <span className="text-base">{moment.customization?.mood === 'hopeful' ? '🍀' : '✨'}</span>
                                  {moodLabel}
                              </div>
                          </div>

                          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3">
                                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg text-orange-100 border border-white/10">✦</span>
                                  <div>
                                      <p className="text-[11px] uppercase tracking-[0.2em] text-orange-100/60">Background</p>
                                      <p className="text-sm text-white/90 truncate max-w-45">{moment.customization?.background?.type || 'solid'}</p>
                                  </div>
                              </div>

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
                          </div>
                      </div>
                  </div>
              )})}
          </div>
      )}
    </div>
  )
}

export default Explore