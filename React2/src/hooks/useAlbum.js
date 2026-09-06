import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

// Same shape as useSharedMoment — one cached fetch of a moment's album,
// shared by the Album page and anything else that needs to know pin/board state.
export const useAlbum = (slug, options = {}) => {
    return useQuery({
        queryKey: ['album', slug],
        queryFn: async () => {
            const response = await api.get(`/moments/${slug}/album`)
            return response.data.data
        },
        enabled: !!slug && options.enabled !== false,
    })
}
