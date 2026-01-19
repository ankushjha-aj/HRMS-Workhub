'use client';

import React from 'react';

const LeavesPage = () => {
    return (
        <div className="bg-white dark:bg-admin-surface-dark rounded-xl border border-admin-border-light dark:border-admin-border-dark shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900 dark:text-white text-lg font-bold">Leave Requests</h3>
            </div>
            <div className="text-center py-10 text-slate-500 dark:text-[#9da6b8]">
                <p>Leave requests will appear here.</p>
            </div>
        </div>
    );
};

export default LeavesPage;
