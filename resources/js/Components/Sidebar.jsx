import { useState } from 'react';
import { Link } from '@inertiajs/react';

import { LayoutDashboard, Users, Layers, FolderGit2, GraduationCap, Briefcase, FileText, Share2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function Sidebar() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

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
        <aside 
            className={`${isSidebarOpen ? 'w-64' : 'w-20'} 
            hidden md:flex flex-col transition-all duration-300 ease-in-out shrink-0
            bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm`}
        >
            
            <div className="h-16 flex items-center justify-between px-4 mt-2">
                {isSidebarOpen && (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-50 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-zinc-50 dark:text-zinc-900 font-bold text-sm">P</span>
                        </div>
                        <span className="font-bold text-base tracking-tight truncate">Portofolio</span>
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
                        className={`flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center'} py-2.5 rounded-lg transition-all group
                            ${item.active 
                                ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-md shadow-zinc-900/10' 
                                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                            }`}
                    >
                        <item.icon size={18} className={isSidebarOpen ? "mr-3" : ""} />
                        {isSidebarOpen && <span className="text-sm font-medium">{item.title}</span>}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}