import React from 'react';
import { Link } from 'react-router-dom';

const Error = () => {
    return (
        <div className='flex-[4_4_0] border-x min-h-screen w-full'>
            <div className="flex justify-center items-center h-full">
                <div className='border-2 rounded-lg p-3 border-red-500 flex items-center flex-col gap-2 m-5'>
                    <h3 className='text-red-500 p-3 text-3xl'>Payment failed</h3>
                    <Link to="/">
                        <button className='btn bg-blue-500 text-white p-2 rounded-lg'>Back to Home Page</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Error;
