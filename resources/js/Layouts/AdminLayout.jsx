import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Navbar from '@/Components/Navbar';

export default function AdminLayout({ children }) {
    // Ambil data user dari Inertia shared props
    const { auth } = usePage().props;

    return (
        <div className="flex h-screen bg-zinc-100 dark:bg-zinc-950 p-3 md:p-4 gap-3 md:gap-4 font-sans overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 gap-3 md:gap-4">                
                <Navbar user={auth.user} />
                <main className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm p-4 md:p-6 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}