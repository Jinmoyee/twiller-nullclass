/* eslint-disable react/prop-types */
import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../../utils/dates";

const Post = ({ post }) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [comment, setComment] = useState("");
    const { data: authUser } = useQuery({ queryKey: ["authUser"] })
    const queryClient = useQueryClient()

    const { mutate: deletePost, isPending } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch(`${apiUrl}/api/post/${post._id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Failed to delete post');
                }
                toast.success("Post deleted successfully");
                return data;
            }
            catch (error) {
                throw new Error(error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] })
        }
    })

    const { mutate: likePost, isPending: isLiking } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch(`${apiUrl}/api/post/like/${post._id}`, {
                    method: 'POST',
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Something went wrong');
                }
                // toast.success("Post deleted successfully");
                return data;
            }
            catch (error) {
                throw new Error(error);
            }
        },
        onSuccess: (updatedLikes) => {
            // queryClient.invalidateQueries({ queryKey: ["posts"] })
            queryClient.setQueryData(['posts'], (oldData) => {
                return oldData.map(p => {
                    if (p._id === post._id) {
                        return { ...p, likes: updatedLikes }
                    }
                    return p;
                })
            })
            // toast.success("Post liked successfully");
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const { mutate: commentPost, isPending: isCommenting } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch(`${apiUrl}/api/post/comment/${post._id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: comment }),
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Something went wrong');
                }
                return data;
            } catch (error) {
                toast.error(error.message)
            }
        },
        onSuccess: (updatedComments) => {
            toast.success("Comment posted successfully")
            setComment("")
            // queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.setQueryData(['posts'], (oldData) => {
                return oldData.map(p => {
                    if (p._id === post._id) {
                        return { ...p, comments: updatedComments }
                    }
                    return p;
                })
            })
        },
        onError: (error) => {
            toast.error(error.message)
        }
    },
    )

    const postOwner = post.user;
    const isLiked = post.likes.includes(authUser._id);

    const isMyPost = authUser._id === post.user._id;

    const formattedDate = formatPostDate(post.createdAt);

    // const isCommenting = false;

    const handleDeletePost = () => {
        deletePost()
    };

    const handlePostComment = (e) => {
        e.preventDefault();
        if (isCommenting) return
        commentPost();
    };

    const handleLikePost = () => {
        if (isLiking) return
        likePost()
    };

    return (
        <>
            <div className='flex gap-2 items-start p-4 border-b'>
                <div className='avatar'>
                    <Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden border-2 border-black'>
                        <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
                    </Link>
                </div>
                <div className='flex flex-col flex-1'>
                    <div className='flex gap-2 items-center'>
                        <Link to={`/profile/${postOwner.username}`} className='font-bold'>
                            {postOwner.fullName}
                        </Link>
                        <span className='text-gray-700 flex gap-1 text-sm'>
                            <Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
                            <span>·</span>
                            <span>{formattedDate}</span>
                        </span>
                        {isMyPost && (
                            <span className='flex justify-end flex-1'>
                                {!isPending && (<FaTrash className='cursor-pointer text-neutral hover:text-red-500' onClick={handleDeletePost} />)}

                                {isPending && (<LoadingSpinner size="sm" />)}
                            </span>
                        )}
                    </div>
                    <div className='flex flex-col gap-3 overflow-hidden'>
                        <span>{post.text}</span>
                        {post.img && (
                            <img
                                src={post.img}
                                className='h-80 object-contain rounded-lg border-2'
                                alt=''
                            />
                        )}
                    </div>
                    <div className='flex justify-between mt-3'>
                        <div className='flex gap-4 items-center w-2/3 justify-between'>
                            <div
                                className='flex gap-1 items-center cursor-pointer group'
                                onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
                            >
                                <FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
                                <span className='text-sm text-slate-500 group-hover:text-sky-400'>
                                    {post.comments.length}
                                </span>
                            </div>
                            {/* We're using Modal Component from DaisyUI */}
                            <dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
                                <div className='modal-box rounded border-[0.15rem]'>
                                    <h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
                                    <div className='flex flex-col gap-3 max-h-60 overflow-auto'>
                                        {post.comments.length === 0 && (
                                            <p className='text-sm text-slate-500'>
                                                No comments yet 🤔 Be the first one 😉
                                            </p>
                                        )}
                                        {post.comments.map((comment) => (
                                            <div key={comment._id} className='flex gap-2 items-start'>
                                                <div className='avatar'>
                                                    <div className='w-8 rounded-full'>
                                                        <img
                                                            src={comment.user.profileImg || "/avatar-placeholder.png"}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='flex flex-col'>
                                                    <div className='flex items-center gap-1'>
                                                        <span className='font-bold'>{comment.user.fullName}</span>
                                                        <span className='text-gray-700 text-sm'>
                                                            @{comment.user.username}
                                                        </span>
                                                    </div>
                                                    <div className='text-sm'>{comment.text}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <form
                                        className='flex gap-2 items-center mt-4 border-t pt-2'
                                        onSubmit={handlePostComment}
                                    >
                                        <textarea
                                            className='textarea w-full p-2 px-4 rounded-full text-md border border-neutral focus:outline-none'
                                            placeholder='Add a comment...'
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            style={{ lineHeight: '2', height: '40px', overflow: 'hidden' }}
                                        />
                                        <button className='btn text-white border hover:border-neutral bg-neutral hover:text-black hover:opacity-90 rounded-full btn-sm'>
                                            {isCommenting ? (
                                                <span className='loading loading-spinner loading-md'></span>
                                            ) : (
                                                "Post"
                                            )}
                                        </button>
                                    </form>
                                </div>
                                <form method='dialog' className='modal-backdrop'>
                                    <button className='outline-none'>close</button>
                                </form>
                            </dialog>
                            <div className='flex gap-1 items-center group cursor-pointer'>
                                <BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
                                <span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
                            </div>
                            <div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
                                {!isLiked && !isLiking && (
                                    <FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
                                )}
                                {isLiked && !isLiking && <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />}

                                <span
                                    className={`text-sm group-hover:text-pink-500 ${isLiked ? "text-pink-500" : "text-slate-500"
                                        }`}
                                >
                                    {post.likes.length}
                                </span>
                            </div>
                        </div>
                        <div className='flex w-1/3 justify-end gap-2 items-center'>
                            <FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Post;