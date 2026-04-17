import { usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    LayoutDashboard, Users, Layers, FolderGit2, GraduationCap, 
    Briefcase, FileText, Share2, PanelLeftClose, PanelLeftOpen, 
    Menu, Image as ImageIcon, Folder, ChevronRight, ChevronDown, 
    LayoutGrid
} from 'lucide-react';

// --- KOMPONEN REKURSIF UNTUK SUB-MENU ALBUM (BERANAK) ---
const AlbumSubMenu = ({ album, currentFilter, isSidebarOpen, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isActive = currentFilter?.album_id == album.id;
    const hasChildren = album.children && album.children.length > 0;

    if (!isSidebarOpen) return null; // Sembunyikan saat sidebar diminimize

    return (
        <div className="flex flex-col w-full">
            <div className={`group flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-all mb-0.5 ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'}`}>
                
                {/* Area Klik untuk Pindah URL */}
                <Link 
                    href={route('gallery.index', { album_id: album.id })} 
                    className="flex items-center flex-1 overflow-hidden" 
                    style={{ paddingLeft: `${level * 12}px` }}
                >
                    <Folder size={14} className={`mr-2 shrink-0 ${isActive ? 'fill-blue-200 dark:fill-blue-900/50' : 'fill-zinc-200 dark:fill-zinc-700'}`} />
                    <span className="text-xs truncate">{album.name}</span>
                </Link>

                {/* Area Klik untuk Buka/Tutup Anak (Dropdown) */}
                {hasChildren && (
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }} 
                        className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-colors"
                    >
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                )}
            </div>

            {/* Render Anak Album (Sub-album) */}
            {hasChildren && isOpen && (
                <div className="flex flex-col">
                    {album.children.map(child => (
                        <AlbumSubMenu 
                            key={child.id} 
                            album={child} 
                            currentFilter={currentFilter} 
                            isSidebarOpen={isSidebarOpen} 
                            level={level + 1} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


export default function Sidebar({ isSidebarOpen, setSidebarOpen }) {
    // Tangkap data album dari Controller (hanya ada saat di rute Galeri)
    const { albumsTree, currentFilter } = usePage().props;

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, href: route('dashboard'), active: route().current('dashboard') },
        { title: 'Manajemen Admin', icon: Users, href: route('admins.index'), active: route().current('admins.*') },
        { title: 'Tech Stack', icon: Layers, href: route('tech-stacks.index'), active: route().current('tech-stacks.*') },
        { title: 'Projects', icon: FolderGit2, href: route('projects.index'), active: route().current('projects.*') },
        { title: 'Education', icon: GraduationCap, href: route('educations.index'), active: route().current('educations.*') },
        { title: 'Karir / Pengalaman', icon: Briefcase, href: route('careers.index'), active: route().current('careers.*') },
        { title: 'Blog / Tulisan', icon: FileText, href: route('articles.index'), active: route().current('articles.*') },
        { title: 'Sosial Media & Kontak', icon: Share2, href: route('contacts.index'), active: route().current('contacts.*') },
        { title: 'Galeri Media', icon: ImageIcon, href: route('gallery.index'), active: route().current('gallery.*') },
    ];

    return (
        <>
            {isSidebarOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setSidebarOpen(false)} />
            )}

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

                <nav className="flex-1 py-4 px-3 space-y-1.5 pb-20 md:pb-4 overflow-y-auto">
                    {menuItems.map((item, index) => {
                        // Deteksi apakah ini menu Galeri dan kita sedang berada di halaman Galeri
                        const isGallery = item.title === 'Galeri Media';
                        const showAlbumsTree = isGallery && route().current('gallery.*') && albumsTree;

                        return (
                            <div key={index} className="flex flex-col">
                                <Link
                                    href={item.href}
                                    className={`relative group flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center'} py-2.5 rounded-lg transition-all
                                        ${item.active 
                                            ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-md shadow-zinc-900/10' 
                                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                                        }`}
                                >
                                    <item.icon size={18} className={isSidebarOpen ? "mr-3" : ""} />
                                    
                                    {isSidebarOpen && <span className="text-sm font-medium">{item.title}</span>}

                                    {/* TOOLTIP */}
                                    {!isSidebarOpen && (
                                        <div className="hidden md:block absolute left-full ml-4 px-3 py-1.5 bg-zinc-800 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-bold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md">
                                            {item.title}
                                            <div className="absolute top-1/2 -left-1 -mt-1 border-[5px] border-transparent border-r-zinc-800 dark:border-r-zinc-100"></div>
                                        </div>
                                    )}
                                </Link>

                                {/* RENDER POHON ALBUM (Hanya tampil jika menu Galeri aktif & Sidebar Terbuka) */}
                                {showAlbumsTree && isSidebarOpen && (
                                    <div className="mt-1.5 mb-2 ml-5 pl-2 border-l border-zinc-200 dark:border-zinc-800 flex flex-col gap-0.5">
                                        <Link 
                                            href={route('gallery.index', { album_id: '' })}
                                            className={`flex items-center px-2 py-1.5 rounded-lg text-xs transition-colors ${!currentFilter?.album_id ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
                                        >
                                            <LayoutGrid size={14} className="mr-2" /> Semua Media
                                        </Link>
                                        <Link 
                                            href={route('gallery.index', { album_id: 'uncategorized' })}
                                            className={`flex items-center px-2 py-1.5 rounded-lg text-xs transition-colors mb-2 ${currentFilter?.album_id === 'uncategorized' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
                                        >
                                            <ImageIcon size={14} className="mr-2" /> Tanpa Album
                                        </Link>

                                        {/* Loop Album Tersarang */}
                                        {albumsTree.map(album => (
                                            <AlbumSubMenu 
                                                key={album.id} 
                                                album={album} 
                                                currentFilter={currentFilter} 
                                                isSidebarOpen={isSidebarOpen} 
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}