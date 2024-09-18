import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const CreatePost = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [text, setText] = useState("");
    const [img, setImg] = useState(null);

    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    const queryClient = useQueryClient();

    const { mutate: createPost, isPending } = useMutation({
        mutationFn: async ({ text, img }) => {
            try {
                const res = await fetch(`${apiUrl}/api/post/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authUser.token}`,
                    },
                    body: JSON.stringify({ text, img }),
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Failed to create post");
                }
                return data;
            } catch (error) {
                throw new Error(error);
            }
        },
        onSuccess: () => {
            setText("");
            setImg(null);
            toast.success('Post created successfully');
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create post');
        },
    });

    const imgRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if the user has an active subscription and within tweet limit
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const userPlan = authUser?.subscriptionPlan;
        const tweetCount = authUser?.tweetCount;
        const tweetLimit = authUser?.tweetLimit;
        const subscriptionExpiration = new Date(authUser?.subscriptionExpiration);

        if (!userPlan || subscriptionExpiration < currentTime) {
            toast.error("Your subscription has expired. Please renew to continue posting.");
            return;
        }

        if (currentHour < 10 || currentHour > 11) {
            toast.error("You can only post between 10:00 AM and 11:00 AM IST.");
            return;
        }

        if (tweetCount >= tweetLimit) {
            toast.error(`You have reached your tweet limit for the ${userPlan} plan. Upgrade your plan or wait for the next period.`);
            return;
        }

        createPost({ text, img });
    };

    const handleImgChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className='flex p-4 items-start gap-4 border-b-2'>
            <div className='avatar'>
                <div className='w-8 rounded-full border-2 border-black'>
                    <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
                </div>
            </div>
            <form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
                <textarea
                    className='textarea w-full p-1 text-lg resize-none border-none focus:outline-none border placeholder:text-gray-500'
                    placeholder='What is happening?!'
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                {img && (
                    <div className='relative w-72 mx-auto'>
                        <IoCloseSharp
                            className='absolute top-0 right-0 text-white bg-neutral rounded-full w-5 h-5 cursor-pointer'
                            onClick={() => {
                                setImg(null);
                                imgRef.current.value = null;
                            }}
                        />
                        <img src={img} className='w-full mx-auto h-72 object-contain rounded' />
                    </div>
                )}

                <div className='flex justify-between border-t py-2'>
                    <div className='flex gap-1 items-center'>
                        <CiImageOn
                            className='fill-neutral w-6 h-6 cursor-pointer'
                            onClick={() => imgRef.current.click()}
                        />
                    </div>
                    <input type='file' hidden ref={imgRef} onChange={handleImgChange} />
                    <button className='btn bg-blue-300 text-white hover:bg-blue-400 hover:opacity-90 rounded-full btn-sm'>
                        {isPending ? "Posting..." : "Tweet"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
