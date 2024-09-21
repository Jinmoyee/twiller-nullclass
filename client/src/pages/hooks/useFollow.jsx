import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import toast from 'react-hot-toast'

export default function useFollow() {
    const queryClient = useQueryClient()

    const { mutate: follow } = useMutation({
        mutationFn: async (userId) => {
            try {
                const res = await fetch(`/api/users/follow/${userId}`, {
                    method: 'POST',
                })
                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.error || 'Failed to follow user')
                }
                return
            } catch (error) {
                throw new Error(error.message)
            }
        },
        onSuccess: () => {
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['suggestedUsers'] }),
                queryClient.invalidateQueries({ queryKey: ['authUser'] })
            ])
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })
    return { follow }
}
