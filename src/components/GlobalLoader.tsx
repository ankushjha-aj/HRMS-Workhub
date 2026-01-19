'use client';

import React from 'react';


export const GlobalLoader = () => {
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm animate-in fade-in duration-500 fill-mode-backwards"
            style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="relative size-12">
                    <span className="absolute inset-0 border-4 border-admin-primary/20 rounded-full"></span>
                    <span className="absolute inset-0 border-4 border-admin-primary border-t-transparent rounded-full animate-spin"></span>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 animate-pulse">Loading...</p>
            </div>
        </div>
    );
};