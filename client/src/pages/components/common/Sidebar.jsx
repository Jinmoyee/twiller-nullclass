import React from 'react'
import { Link } from 'react-router-dom'
import { MdHomeFilled } from "react-icons/md";
import { MdNotifications } from "react-icons/md";
import { FaRegUser } from "react-icons/fa6";
import { MdOutlineExitToApp } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { MdOutlineMessage } from "react-icons/md";
import { FaRegBookmark } from "react-icons/fa";
import { FaRegListAlt } from "react-icons/fa";
import { MdMore } from "react-icons/md";
import { AiFillDollarCircle } from "react-icons/ai";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import twitter from "../../../../public/twitter.png"

export default function Sidebar() {
    const queryClient = useQueryClient()

    const { mutate: loggedOut, isError, isPending, error } = useMutation({
        mutationFn: async () => {
            try {
                // Simulate a server request
                const res = await fetch("/api/auth/logout", {
                    method: 'POST',
                })
                const data = await res.json()
                toast.success('Logged out successfully')
            } catch (error) {
                console.log(error)
                toast.error('Failed to log out')
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authUser'] })
        }
    })

    const { data: userData } = useQuery({ queryKey: ['authUser'] })
    return (
        <div className='h-screen sticky top-0 left-0'>
            <div className='flex flex-col gap-8 mt-[1rem] ml-[1rem] mr-[1rem] lg:ml-[2rem] lg:mr-[2rem] xl:ml-[5rem] xl:mr-[2rem]'>
                <img src={twitter} alt="" className='h-[30px] w-[30px] ml-2' />
                <Link to="/">
                    <div className='transition transform flex justify-left items-center gap-4 ml-[3px] text-center text-xl hover:text-blue-400'>
                        <MdHomeFilled className='w-6 h-6' />
                        <div className='hidden lg:block'>Home</div>
                    </div>
                </Link>
                <Link to="/explorer">
                    <div className='transition transform flex justify-left items-center gap-4 ml-[5px] text-center text-xl hover:text-blue-400'>
                        <FaSearch />
                        <div className='hidden lg:block'>Explorer</div>
                    </div>
                </Link>
                <Link to="/notifications">
                    <div className='transition transform flex justify-left items-center gap-3 ml-[2px] text-center text-xl hover:text-blue-400'>
                        <MdNotifications className='w-7 h-7' />
                        <div className='hidden lg:block'>Notification</div>
                    </div>
                </Link>
                <Link to="/messages">
                    <div className='transition transform flex justify-left items-center gap-4 ml-[6px] text-center text-xl hover:text-blue-400'>
                        <MdOutlineMessage />
                        <div className='hidden lg:block'>Messages</div>
                    </div>
                </Link>
                <Link to="/bookmarks">
                    <div className='transition transform flex justify-left items-center gap-4 ml-[6px] text-center text-xl hover:text-blue-400'>
                        <FaRegBookmark />
                        <div className='hidden lg:block'>Bookmarks</div>
                    </div>
                </Link>
                <Link to="/lists">
                    <div className='transition transform flex justify-left items-center gap-4 ml-[7px] text-center text-xl hover:text-blue-400'>
                        <FaRegListAlt />
                        <div className='hidden lg:block'>Lists</div>
                    </div>
                </Link>
                <Link to={`/profile/${userData?.username}`}>
                    <div className='transition transform flex justify-left items-center gap-4 ml-[7px] text-center text-xl hover:text-blue-400'>
                        <FaRegUser />
                        <div className='hidden lg:block'>Profile</div>
                    </div>
                </Link>
                <Link to="/subscribe">
                    <div className='transition transform flex justify-left items-center gap-4 ml-[6px] text-center text-xl hover:text-blue-400'>
                        <AiFillDollarCircle />
                        <div className='hidden lg:block'>Subscribe</div>
                    </div>
                </Link>
                <Link to="/more">
                    <div className='transition transform flex justify-left items-center gap-4 ml-[6px] text-center text-xl hover:text-blue-400'>
                        <MdMore />
                        <div className='hidden lg:block'>More</div>
                    </div>
                </Link>
            </div>

            <div className='absolute bottom-3 mr-auto ml-auto left-0 right-0 w-[100%] overflow-hidden'>
                <div className='flex justify-center lg:justify-around item-center h-full border-none p-0 lg:p-2 rounded-lg lg:flex-row flex-col'>
                    <Link to={`/profile/${userData?.username}`}>
                        <div className='flex gap-2'>
                            <div>
                                <img src={userData.profileImg || "/avatar-placeholder.png"} alt="" className='rounded-full w-12 h-12 border-2 border-black' />
                            </div>
                            <div>
                                <p className='w-[80%] overflow-hidden truncate font-medium hidden lg:block'>{userData.fullName}</p>
                                <p className='w-[80%] overflow-hidden truncate hidden lg:block'>@{userData.username}</p>
                            </div>
                        </div>
                    </Link>
                    <div
                        className='cursor-pointer ml-2 lg:ml-0 hover:text-blue-400'
                        onClick={
                            (e) => {
                                e.preventDefault()
                                loggedOut()
                            }
                        }
                    >
                        <MdOutlineExitToApp className='w-6 h-6 mt-3' />
                    </div>
                </div>
            </div>
        </div>
    )
}
