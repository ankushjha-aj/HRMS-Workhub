'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

type DashboardContextType = {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams();
    const urlDate = searchParams.get('date');

    // Initialize with URL date or Today
    const [selectedDate, _setSelectedDate] = useState<Date>(
        urlDate ? new Date(urlDate) : new Date()
    );

    const setSelectedDate = (date: Date) => {
        _setSelectedDate(date);
        const dateStr = date.toLocaleDateString('en-CA');
        window.history.replaceState(null, '', `?date=${dateStr}`);
    };

    return (
        <DashboardContext.Provider value={{ selectedDate, setSelectedDate }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
