import { useState, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import ShareModal from '../components/ShareModal';
import SavedMoment from '../components/SavedMoment';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MyMoments = () => {
  const [shareSlug, setShareSlug] = useState(null);
  const [pendingLeave, setPendingLeave] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['moments'],
    enabled: isLoggedIn,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await api.get('/moments', { params: { page: pageParam } });
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
  });
  const moments = data?.pages.flatMap((p) => p.data) || [];
  const currentUserId = data?.pages[0]?.currentUserId || null;
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
          if (!isLoggedIn) {
              showToast({ type: 'warning', title: 'Login required', description: 'Please login to view your moments' });
              navigate('/login');
          }
  }, [isLoggedIn, navigate, showToast]);

  const deleteMoment = useMutation({
    mutationFn: (momentId) => api.delete(`/moments/${momentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['moments'] }),
    onError: () => showToast({ type: 'error', title: 'Delete failed', description: 'Failed to delete moment. Please try again.' }),
  });
  const LeaveSharedMoment = useMutation({
    mutationFn: (slug) => api.delete(`/moments/${slug}/members/${currentUserId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['moments'] }),
    onError: () => showToast({ type: 'error', title: 'Leave failed', description: 'Failed to leave moment. Please try again.' }),
  });

  const handleLeave = (slug, e) => {
      e.stopPropagation();
      setPendingLeave(slug);
  };

  const handleDelete = (id, e) => {
      e.stopPropagation(); // Prevent the card's onClick from navigating
      setPendingDelete(id);
  };

  const confirmLeave = () => {
      LeaveSharedMoment.mutate(pendingLeave, { onSettled: () => setPendingLeave(null) });
  };

  const confirmDelete = () => {
      deleteMoment.mutate(pendingDelete, { onSettled: () => setPendingDelete(null) });
  };

  if (isLoading) return <div className="text-text text-center mt-32 animate-pulse">Loading your moments...</div>;

  // Find if the currently opened modal belongs to the owner so we can pass permissions to the modal!
  const selectedMoment = moments.find(m => m.slug === shareSlug);
  const isOwner = selectedMoment && currentUserId ? selectedMoment.userId === currentUserId : false;



  return (
    <div className=" pt-32 px-8 text-text max-w-7xl mx-auto">
      <h1 className="text-4xl font-headline italic mb-12 text-text">My Archives</h1>
      
      {moments.length === 0 ? (
          <p className="text-text/50 font-light">You haven't created any moments yet.</p>
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
                    onClick={() => navigate(`/create/${moment.mode === 'countup' ? 'count-up' : 'count-down'}`, { state: { savedConfig: moment, isCompleted, isOwner: !isSharedWithMe } })}
                    headerLeft={
                        <span className="inline-flex flex-wrap items-center gap-2">
                            {/* Shared Badge */}
                            {isSharedWithMe && (
                                <span className="text-[9px] font-label px-2 py-1 rounded-sm tracking-widest bg-blue-500/20 text-blue-200 border border-blue-500/30">
                                    SHARED
                                </span>
                            )}
                            <span className={`text-[9px] font-label px-2 py-1 rounded-sm tracking-widest ${isCompleted ? 'bg-success/20 text-success border border-success/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
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
                                className="text-text/70 hover:text-primary transition-colors p-1"
                                title="Share moment"
                            >
                                <span className="material-symbols-outlined text-base">share</span>
                            </button>

                            {/* Leave Button - Only show if the user is a COLLABORATOR */}
                            {isSharedWithMe && (
                                <button
                                    onClick={(e) => handleLeave(moment.slug, e)}
                                    className="text-text/70 hover:text-error transition-colors p-1"
                                    title="Leave moment"
                                >
                                    <span className="material-symbols-outlined text-base">logout</span>
                                </button>
                            )}

                            {/* Delete Button - Only show if the user is the OWNER */}
                            {!isSharedWithMe && (
                                <button
                                    onClick={(e) => handleDelete(moment._id, e)}
                                    className="text-text/70 hover:text-error transition-colors p-1"
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

      {hasNextPage && (
          <div className="flex justify-center pb-20 -mt-12">
              <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-2.5 rounded-full border border-border-mid text-text/80 font-label text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              >
                  {isFetchingNextPage ? 'Loading...' : 'Load more'}
              </button>
          </div>
      )}

      {/* The Share Modal */}
      <ShareModal isOpen={!!shareSlug} onClose={() => setShareSlug(null)} slug={shareSlug} isOwner={isOwner} />

      <ConfirmModal
        open={!!pendingLeave}
        title="Leave this moment?"
        description="You'll lose access to this shared moment unless someone invites you back."
        confirmLabel="Leave"
        loading={LeaveSharedMoment.isPending}
        onConfirm={confirmLeave}
        onCancel={() => setPendingLeave(null)}
      />

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete this moment?"
        description="This permanently deletes the moment and can't be undone."
        confirmLabel="Delete forever"
        loading={deleteMoment.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

export default MyMoments 