import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
  const [publicMoments, setPublicMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
      const fetchPublicMoments = async () => {
          const token = Cookies.get('token');
          
          if (!token) {
              alert('Please login to explore moments');
              navigate('/login');
              return;
          }

          try {
              const response = await axios.get('http://localhost:3000/api/v1/moments/public', {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setPublicMoments(response.data.data);
          } catch (error) {
              console.error("Error fetching public moments:", error);
          } finally {
              setLoading(false);
          }
      };

      fetchPublicMoments();
  }, [navigate]);

  if (loading) return <div className="text-orange-50 text-center mt-32 animate-pulse">Loading the collective...</div>;

  return (
    <div className="min-h-screen pt-32 px-8 text-orange-50 max-w-7xl mx-auto">
      <h1 className="text-4xl font-headline italic mb-2 text-orange-100">The Collective</h1>
      <p className="font-light text-orange-100/50 mb-12">Witness and root for moments shared by the community.</p>
      
      {publicMoments.length === 0 ? (
          <p className="text-orange-100/50 font-light">No public moments yet. Be the first to share one!</p>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {publicMoments.map(moment => {
                  const target = moment.endAt ? new Date(moment.endAt) : null;
                  const isCompleted = moment.mode === 'countdown' && target ? new Date() >= target : false;

                  return (
                  <div key={moment._id} className="relative glass-panel p-6 rounded-2xl border border-white/10 shadow-lg hover:bg-white/5 transition-all duration-300">
                      
                      <div className="text-xs font-label uppercase tracking-widest text-orange-200/50 mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">person</span>
                          {moment.userId?.userName || 'Anonymous'}
                      </div>

                      <h2 className="text-2xl font-headline font-bold mb-2 text-orange-50">{moment.title}</h2>
                      <p className="text-orange-100/50 text-sm mb-6 font-label uppercase tracking-widest">{moment.endAt ? new Date(moment.endAt).toLocaleDateString() : 'No Deadline'}</p>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-200/10 border border-orange-200/20">
                              <span className="text-lg">{moment.customization?.mood === 'hopeful' ? '🍀' : '✨'}</span>
                              <span className="text-xs font-label uppercase tracking-widest text-orange-200">{moment.customization?.mood}</span>
                          </div>
                          
                          <button className="flex items-center gap-2 text-orange-200/70 hover:text-orange-200 hover:bg-orange-200/20 transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10 group active:scale-95">
                              <span className="material-symbols-outlined text-sm group-hover:text-orange-300">favorite</span>
                              <span className="text-xs font-bold">{moment.rootCount || 0}</span>
                          </button>
                      </div>
                  </div>
              )})}
          </div>
      )}
    </div>
  )
}

export default Explore