import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

// Tambahkan ikon Menu untuk tombol floating di Mobile
import { LayoutDashboard, Users, Layers, FolderGit2, GraduationCap, Briefcase, FileText, Share2, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';

export default function Sidebar() {
    // 1. STATE DENGAN LOCAL STORAGE
    // Membaca status terakhir dari penyimpanan browser agar posisi sidebar tidak kereset
    const [isSidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('sidebarState');
            return savedState !== null ? JSON.parse(savedState) : true;
        }
        return true;
    });

    // Menyimpan setiap perubahan state ke local storage
    useEffect(() => {
        localStorage.setItem('sidebarState', JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, href: route('dashboard'), active: route().current('dashboard') },
        { title: 'Manajemen Admin', icon: Users, href: route('admins.index'), active: route().current('admins.*') },
        { title: 'Tech Stack', icon: Layers, href: route('tech-stacks.index'), active: route().current('tech-stacks.*') },
        { title: 'Projects', icon: FolderGit2, href: route('projects.index'), active: route().current('projects.*') },
        { title: 'Education', icon: GraduationCap, href: route('educations.index'), active: route().current('educations.*') },
        { title: 'Karir / Pengalaman', icon: Briefcase, href: route('careers.index'), active: route().current('careers.*') },
        { title: 'Blog / Tulisan', icon: FileText, href: route('articles.index'), active: route().current('articles.*') },
        { title: 'Sosial Media & Kontak', icon: Share2, href: route('contacts.index'), active: route().current('contacts.*') },
    ];

    return (
        <>
            {/* 2. TOMBOL BUKA SIDEBAR UNTUK MOBILE */}
            {/* Tombol ini hanya muncul di HP ketika sidebar tertutup */}
            {!isSidebarOpen && (
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                    <Menu size={20} />
                </button>
            )}

            {/* 3. OVERLAY HITAM UNTUK MOBILE */}
            {/* Latar belakang gelap saat sidebar terbuka di HP */}
            {isSidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* 4. PERBAIKAN SIDEBAR (Mendukung Desktop & Mobile) */}
            <aside 
                className={`
                    ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'} 
                    fixed inset-y-0 left-0 md:relative z-50 flex flex-col shrink-0 transition-all duration-300 ease-in-out
                    bg-white dark:bg-zinc-900 md:rounded-xl border-r md:border border-zinc-200/80 dark:border-zinc-800 shadow-sm
                    h-[100dvh] md:h-auto
                `}
            >
                <div className="h-16 flex items-center justify-between px-4 mt-2">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-50 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-zinc-50 dark:text-zinc-900 font-bold text-sm">P</span>
                            </div>
                            <span className="font-bold text-base tracking-tight truncate text-zinc-900 dark:text-zinc-50">Portofolio</span>
                        </div>
                    )}
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className={`p-1.5 rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors ${!isSidebarOpen && 'mx-auto'}`}
                    >
                        {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </button>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            // Tambahkan class 'relative group' untuk sistem Tooltip
                            className={`relative group flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center'} py-2.5 rounded-lg transition-all
                                ${item.active 
                                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-md shadow-zinc-900/10' 
                                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                                }`}
                        >
                            <item.icon size={18} className={isSidebarOpen ? "mr-3" : ""} />
                            
                            {isSidebarOpen && <span className="text-sm font-medium">{item.title}</span>}

                            {/* 5. TOOLTIP CUSTOM SAAT MINIMIZE (Hanya Desktop) */}
                            {!isSidebarOpen && (
                                <div className="hidden md:block absolute left-full ml-4 px-3 py-1.5 bg-zinc-800 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-bold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md">
                                    {item.title}
                                    {/* Segitiga panah kecil pengarah Tooltip */}
                                    <div className="absolute top-1/2 -left-1 -mt-1 border-[5px] border-transparent border-r-zinc-800 dark:border-r-zinc-100"></div>
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
}