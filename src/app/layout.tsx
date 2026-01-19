import './globals.css';
import { Providers } from './providers';
import React from 'react';

export const metadata = {
    title: 'OpsBee WorkHub',
    description: 'WorkHub Application',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
