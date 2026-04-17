import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Navbar from '@/Components/Navbar';

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;

    // State Sidebar sekarang dikelola oleh Layout Utama
    const [isSidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('sidebarState');
            return savedState !== null ? JSON.parse(savedState) : true;
        }
        return true;
    });

    useEffect(() => {
        localStorage.setItem('sidebarState', JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    return (
        <div className="flex h-screen bg-zinc-100 dark:bg-zinc-950 p-3 md:p-4 gap-3 md:gap-4 font-sans overflow-hidden">
            {/* Kirim state ke Sidebar */}
            <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            <div className="flex-1 flex flex-col min-w-0 gap-3 md:gap-4">                
                {/* Kirim trigger tombol ke Navbar */}
                <Navbar user={auth.user} setSidebarOpen={setSidebarOpen} />
                
                <main className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm p-4 md:p-6 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}