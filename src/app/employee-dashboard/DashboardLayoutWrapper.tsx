'use client';

import { DashboardProvider } from '../../contexts/DashboardContext';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <DashboardProvider>
            {children}
        </DashboardProvider>
    );
}
