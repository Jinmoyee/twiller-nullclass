import { FaSearch } from "react-icons/fa";
import React, { useEffect } from 'react';

export default function RightPanel() {
    useEffect(() => {
        // Load Twitter script dynamically
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return (
        <div className="p-3 hidden md:inline">
            <div className="flex items-center relative">
                <FaSearch className="text-xl absolute top-3 right-3" />
                <input placeholder="Search Twitter" type="text" className="px-3 py-2 rounded-full border-2 w-full" />
            </div>
            <div className="mt-2 bg-slate-200 p-3 rounded-2xl">
                <h2 className="text-xl font-bold">What's Happening</h2>
                <blockquote className="twitter-tweet">
                    <a href="https://twitter.com/Twitter/status/1816174440071241866">Tweet</a>
                </blockquote>
                <a
                    className="twitter-timeline"
                    href="https://twitter.com/Valorant"
                    data-height="400"
                >
                    Tweets by Valorant
                </a>
            </div>
        </div>
    );
}
