import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

// A single cached fetch of `/moments/shared/:slug`, shared by every place that
// needs it (ShareModal's member list, the public SharedMoment view, JoinMoment's
// invite preview) — replaces three independent copies of the same request.
export const useSharedMoment = (slug, options = {}) => {
    return useQuery({
        queryKey: ['shared-moment', slug],
        queryFn: async () => {
            const response = await api.get(`/moments/shared/${slug}`)
            return response.data.data
        },
        enabled: !!slug && options.enabled !== false,
    })
}
