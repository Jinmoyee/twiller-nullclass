import { useState } from "react";
import Posts from "../components/common/Posts";
import CreatePosts from "./CreatePosts";

const HomePage = () => {
    const [feedType, setFeedType] = useState("forYou");

    return (
        <div className="flex-[4_4_0] min-h-screen w-full border-x pt-1">
            <div className='flex w-full'>
                <div
                    className={
                        "flex justify-center flex-1 p-3 transition duration-300 cursor-pointer relative text-lg font-semibold"
                    }
                    onClick={() => setFeedType("forYou")}
                >
                    For you
                    {feedType === "forYou" && (
                        <div className='absolute bottom-0 w-32 h-1.5 bg-blue-300 rounded-lg'></div>
                    )}
                </div>
                <div
                    className='flex justify-center flex-1 p-3 transition duration-300 cursor-pointer relative text-lg font-semibold'
                    onClick={() => setFeedType("following")}
                >
                    Following
                    {feedType === "following" && (
                        <div className='absolute bottom-0 w-32 h-1.5 bg-blue-300 rounded-lg'></div>
                    )}
                </div>
            </div>
            <div className="border-b"></div>
            <div className="text-left">
                <CreatePosts />
                <Posts feedType={feedType} />
            </div>
        </div>
    );
};
export default HomePage;