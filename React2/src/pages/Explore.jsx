import Cookies from 'js-cookie';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import SavedMoment from '../components/SavedMoment';

const Explore = () => {
  const { showToast } = useToast();
  const token = Cookies.get('token');
  const queryClient = useQueryClient();

  // Public moments are viewable without an account:
  // no `enabled` gate, no redirect side effect (the shared client only
  // attaches an auth header when a token exists).
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['moments', 'public'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await api.get('/moments/public', { params: { page: pageParam } });
      return response.data;               // { message, data: [...], hasMore }
    },
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
  });
  const publicMoments = data?.pages.flatMap((p) => p.data) || [];

  const rootMoment = useMutation({
    // The root route is a POST; needs a body (`{}`) since there's nothing to send.
    mutationFn: (momentId) => api.post(`/moments/${momentId}/root`, {}),
    onSuccess: (res) => {
      // The toggle endpoint tells us whether we just rooted or unrooted.
      const didRoot = res.data.rooted;
      showToast({
        type: didRoot ? 'success' : 'warning',
        title: didRoot ? 'Rooted' : 'Unrooted',
        description: didRoot ? 'Your support has been added.' : 'Your support has been removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['moments', 'public'] });
    },
    onError: () => showToast({ type: 'error', title: 'Root failed', description: 'Failed to root moment. Please try again.' }),
  });

  const handleRoot = (momentId) => {
    if (!token) {
      showToast({ type: 'warning', title: 'Login required', description: 'Log in to root a moment.' });
      return;
    }
    rootMoment.mutate(momentId);
  };

  if (isLoading) return <div className="text-text text-center mt-32 animate-pulse">Loading the collective...</div>;

  return (
    <div className="min-h-screen pt-28 px-4 sm:px-6 lg:px-8 text-text max-w-7xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-headline italic mb-3 text-text">The Collective</h1>
      <p className="font-light text-text/60 mb-10 max-w-3xl">Witness and root for moments shared by the community. Every card shows the title, creator, mood, progress label, and root count.</p>

      {publicMoments.length === 0 ? (
          <p className="text-text/60 font-light">No public moments yet. Be the first to share one!</p>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {publicMoments.map(moment => {
                  // Is THIS card's root request the one currently in flight?
                  const isRooting = rootMoment.isPending && rootMoment.variables === moment._id;
                  return (
                  <SavedMoment
                      key={moment._id}
                      moment={moment}
                      footer={
                          <button
                              onClick={() => handleRoot(moment._id)}
                              disabled={isRooting}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm font-semibold text-text transition hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              {isRooting ? (
                                  <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-transparent" />
                              ) : (
                                  <span className="material-symbols-outlined text-base">favorite</span>
                              )}
                              {moment.rootCount || 0}
                          </button>
                      }
                  />
              )})}
          </div>
      )}

      {hasNextPage && (
          <div className="flex justify-center pb-20 -mt-12">
              <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-2.5 rounded-full border border-white/15 text-text/80 font-label text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              >
                  {isFetchingNextPage ? 'Loading...' : 'Load more'}
              </button>
          </div>
      )}
    </div>
  )
}

export default Explore
