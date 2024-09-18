import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const userProfile = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const queryClient = useQueryClient()
    const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
        mutationFn: async (formData) => {
            try {
                const res = await fetch(`${apiUrl}/api/users/update`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Failed to update profile");
                }
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onSuccess: () => {
            toast.success("Profile updated successfully");
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["authUser"] }),
                queryClient.invalidateQueries({ queryKey: ["userProfile"] })
            ])
        },
        onError: () => {
            toast.error("Failed to update profile");
        }
    })
    return { updateProfile, isUpdatingProfile }
}

export default userProfile;
