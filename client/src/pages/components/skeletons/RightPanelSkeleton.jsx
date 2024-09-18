import React from 'react'

export default function RightPanelSkeleton() {
    return (
        <div className='flex gap-4 items-center p-3'>
            <div className='w-8 rounded-full'>
                <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
            </div>
            <div className='flex flex-col gap-1'>
                <div className="skeleton h-4 min-w-24"></div>
                <div className="skeleton h-4 min-w-20 w-20"></div>
            </div>
            <div>
                <div className="skeleton h-8 w-16"></div>
            </div>
        </div>
    )
}
