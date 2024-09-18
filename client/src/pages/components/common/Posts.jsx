import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
// import { POSTS } from '../../../utils/db/dummey'
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const getPostEndPoint = () => {
        switch (feedType) {
            case 'forYou':
                return `${apiUrl}/api/post/all`;
            case `following`:
                return `${apiUrl}/api/post/following`;
            case `post`:
                return `${apiUrl}/api/post/user/${username}`;
            case `likes`:
                return `${apiUrl}/api/post/likes/${userId}`
            default:
                return `${apiUrl}/api/post/all`;
        }
    }

    const POST_ENDPOINT = getPostEndPoint()

    const { data: posts, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['posts'],
        queryFn: async () => {
            try {
                const res = await fetch(POST_ENDPOINT)
                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch posts")
                }
                return data
            } catch (error) {
                throw new Error(error)
            }
        }
    })

    useEffect(() => {
        refetch()
    }, [feedType, refetch, username])

    return (
        <>
            {(isLoading || isRefetching) && (
                <div className='flex flex-col justify-center'>
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            )}
            {!isLoading && !isRefetching && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
            {!isLoading && !isRefetching && posts && (
                <div>
                    {posts.map((post) => (
                        <Post key={post._id} post={post} />
                    ))}
                </div>
            )}
        </>
    );
};
export default Posts;