import { usePage, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { 
    LayoutDashboard, Users, Layers, FolderGit2, GraduationCap, 
    Briefcase, FileText, Share2, PanelLeftClose, PanelLeftOpen, 
    Image as ImageIcon, Folder, ChevronRight, ChevronDown, LayoutGrid, 
    MoreVertical, Edit, Trash2, AlertTriangle, Contact2, Tag
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

// --- KOMPONEN REKURSIF UNTUK ALBUM ---
const AlbumSubMenu = ({ album, currentFilter, isSidebarOpen, level = 0, onOpenModal }) => {
    const checkIfActive = (alb, activeId) => {
        if (!activeId) return false;
        if (alb.id == activeId) return true;
        if (alb.children && alb.children.length > 0) return alb.children.some(child => checkIfActive(child, activeId));
        return false;
    };

    const shouldBeOpen = checkIfActive(album, currentFilter?.album_id);
    const [isOpen, setIsOpen] = useState(shouldBeOpen);
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);

    useEffect(() => { if (shouldBeOpen) setIsOpen(true); }, [shouldBeOpen]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) setShowOptions(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isSidebarOpen) return null;

    return (
        <div className="flex flex-col w-full">
            <div className={`group flex items-center justify-between py-1.5 px-2 rounded-md transition-all mb-0.5 relative ${currentFilter?.album_id == album.id ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'}`}>
                <Link href={route('gallery.index', { album_id: album.id })} className="flex items-center flex-1 overflow-hidden py-1" style={{ paddingLeft: `${level * 12}px` }}>
                    <Folder size={14} className={`mr-2 shrink-0 ${currentFilter?.album_id == album.id ? 'fill-zinc-900 dark:fill-zinc-50' : 'fill-zinc-300 dark:fill-zinc-600'}`} />
                    <span className="text-xs truncate">{album.name}</span>
                </Link>

                <div className={`flex items-center gap-0.5 transition-opacity ${showOptions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="relative" ref={optionsRef}>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(!showOptions); }} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-colors">
                            <MoreVertical size={14} />
                        </button>
                        {showOptions && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95">
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(false); onOpenModal('rename', album, 'album'); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center transition-colors">
                                    <Edit size={12} className="mr-2"/> Ganti Nama
                                </button>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(false); onOpenModal('delete', album, 'album'); }} className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center transition-colors">
                                    <Trash2 size={12} className="mr-2"/> Hapus Album
                                </button>
                            </div>
                        )}
                    </div>
                    {album.children && album.children.length > 0 && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400">
                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    )}
                </div>
            </div>
            {album.children && isOpen && (
                <div className="flex flex-col mt-0.5">
                    {album.children.map(child => <AlbumSubMenu key={child.id} album={child} currentFilter={currentFilter} isSidebarOpen={isSidebarOpen} level={level + 1} onOpenModal={onOpenModal} />)}
                </div>
            )}
        </div>
    );
};

// --- KOMPONEN REKURSIF UNTUK TAG (KONEKSI) ---
const TagSubMenu = ({ tag, currentFilter, isSidebarOpen, level = 0, onOpenModal }) => {
    const checkIfActive = (t, activeId) => {
        if (!activeId) return false;
        if (t.id == activeId) return true;
        if (t.children && t.children.length > 0) return t.children.some(c => checkIfActive(c, activeId));
        return false;
    };

    const shouldBeOpen = checkIfActive(tag, currentFilter?.tag_id);
    const [isOpen, setIsOpen] = useState(shouldBeOpen);
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);

    useEffect(() => { if (shouldBeOpen) setIsOpen(true); }, [shouldBeOpen]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) setShowOptions(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isSidebarOpen) return null;

    return (
        <div className="flex flex-col w-full">
            <div className={`group flex items-center justify-between py-1.5 px-2 rounded-md transition-all mb-0.5 relative ${currentFilter?.tag_id == tag.id ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'}`}>
                
                <Link href={route('connections.index', { tag_id: tag.id })} className="flex items-center flex-1 overflow-hidden py-1" style={{ paddingLeft: `${level * 12}px` }}>
                    <Tag size={12} className="mr-2 shrink-0" />
                    <span className="text-xs truncate">{tag.name}</span>
                </Link>

                <div className={`flex items-center gap-0.5 transition-opacity ${showOptions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="relative" ref={optionsRef}>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(!showOptions); }} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-colors">
                            <MoreVertical size={14} />
                        </button>
                        {showOptions && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95">
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(false); onOpenModal('rename', tag, 'tag'); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center transition-colors">
                                    <Edit size={12} className="mr-2"/> Ganti Nama
                                </button>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(false); onOpenModal('delete', tag, 'tag'); }} className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center transition-colors">
                                    <Trash2 size={12} className="mr-2"/> Hapus Tag
                                </button>
                            </div>
                        )}
                    </div>
                    {tag.children && tag.children.length > 0 && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400">
                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    )}
                </div>
            </div>
            {tag.children && isOpen && (
                <div className="flex flex-col mt-0.5">
                    {tag.children.map(child => <TagSubMenu key={child.id} tag={child} currentFilter={currentFilter} isSidebarOpen={isSidebarOpen} level={level + 1} onOpenModal={onOpenModal} />)}
                </div>
            )}
        </div>
    );
};

// --- SIDEBAR UTAMA ---
export default function Sidebar({ isSidebarOpen, setSidebarOpen }) {
    const { albumsTree = [], tagsTree = [], currentFilter = {} } = usePage().props;

    // Entity akan mendeteksi apakah kita sedang mengedit 'album' atau 'tag'
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, entity: null, item: null });
    const [newName, setNewName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const openModal = (type, item, entity) => {
        setModalConfig({ isOpen: true, type, entity, item });
        if (type === 'rename') setNewName(item.name);
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, type: null, entity: null, item: null });
        setNewName('');
    };

    const submitRename = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        const routeName = modalConfig.entity === 'album' ? 'gallery.albums.update' : 'connection-tags.update';
        
        router.put(route(routeName, modalConfig.item.id), { name: newName }, {
            onSuccess: () => { closeModal(); setIsProcessing(false); },
            onError: () => setIsProcessing(false),
            preserveScroll: true
        });
    };

    const submitDelete = () => {
        setIsProcessing(true);
        const routeName = modalConfig.entity === 'album' ? 'gallery.albums.destroy' : 'connection-tags.destroy';
        
        router.delete(route(routeName, modalConfig.item.id), {
            onSuccess: () => { closeModal(); setIsProcessing(false); },
            onError: () => setIsProcessing(false),
            preserveScroll: true
        });
    };

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
        { title: 'Koneksi & Relasi', icon: Contact2, href: route('connections.index'), active: route().current('connections.*') },
    ];

    return (
        <>
            {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setSidebarOpen(false)} />}

            <aside className={`${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'} fixed inset-y-0 left-0 md:relative z-50 flex flex-col shrink-0 transition-all duration-300 ease-in-out bg-white dark:bg-zinc-900 md:rounded-xl border-r md:border border-zinc-200/80 dark:border-zinc-800 shadow-sm h-[100dvh] md:h-auto`}>
                
                <div className="h-16 flex items-center justify-between px-4 mt-2">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-50 rounded-lg flex items-center justify-center shrink-0"><span className="text-zinc-50 dark:text-zinc-900 font-bold text-sm">P</span></div>
                            <span className="font-bold text-base tracking-tight truncate text-zinc-900 dark:text-zinc-50">Portofolio</span>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-1.5 rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors ${!isSidebarOpen && 'mx-auto'}`}>
                        {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </button>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1.5 pb-20 md:pb-4 overflow-y-auto">
                    {menuItems.map((item, index) => {
                        const isGalleryActive = item.title === 'Galeri Media' && route().current('gallery.*');
                        const isConnectionsActive = item.title === 'Koneksi & Relasi' && route().current('connections.*');

                        return (
                            <div key={index} className="flex flex-col">
                                <Link href={item.href} className={`relative group flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center'} py-2.5 rounded-lg transition-all ${item.active ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-md shadow-zinc-900/10' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'}`}>
                                    <item.icon size={18} className={isSidebarOpen ? "mr-3" : ""} />
                                    {isSidebarOpen && <span className="text-sm font-medium">{item.title}</span>}
                                    {!isSidebarOpen && (
                                        <div className="hidden md:block absolute left-full ml-4 px-3 py-1.5 bg-zinc-800 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-bold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 shadow-md">
                                            {item.title}
                                            <div className="absolute top-1/2 -left-1 -mt-1 border-[5px] border-transparent border-r-zinc-800 dark:border-r-zinc-100"></div>
                                        </div>
                                    )}
                                </Link>

                                {/* RENDER POHON ALBUM (Galeri) */}
                                {isGalleryActive && isSidebarOpen && (
                                    <div className="mt-1.5 mb-2 ml-5 pl-2 border-l-2 border-zinc-100 dark:border-zinc-800 flex flex-col gap-0.5">
                                        <Link href={route('gallery.index', { album_id: '' })} className={`flex items-center px-2 py-1.5 rounded-md text-xs transition-colors ${!currentFilter?.album_id ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}><LayoutGrid size={14} className="mr-2" /> Semua Media</Link>
                                        <Link href={route('gallery.index', { album_id: 'uncategorized' })} className={`flex items-center px-2 py-1.5 rounded-md text-xs transition-colors mb-2 ${currentFilter?.album_id === 'uncategorized' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}><ImageIcon size={14} className="mr-2" /> Tanpa Album</Link>
                                        {albumsTree.map(album => <AlbumSubMenu key={album.id} album={album} currentFilter={currentFilter} isSidebarOpen={isSidebarOpen} onOpenModal={openModal} />)}
                                    </div>
                                )}

                                {/* RENDER POHON TAG (Koneksi) */}
                                {isConnectionsActive && isSidebarOpen && (
                                    <div className="mt-1.5 mb-2 ml-5 pl-2 border-l-2 border-zinc-100 dark:border-zinc-800 flex flex-col gap-0.5">
                                        <Link href={route('connections.index', { tag_id: '' })} className={`flex items-center px-2 py-1.5 rounded-md text-xs transition-colors ${!currentFilter?.tag_id ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}><Users size={14} className="mr-2" /> Semua Kontak</Link>
                                        <Link href={route('connections.index', { tag_id: 'untagged' })} className={`flex items-center px-2 py-1.5 rounded-md text-xs transition-colors mb-2 ${currentFilter?.tag_id === 'untagged' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}><Tag size={14} className="mr-2" /> Tanpa Tag</Link>
                                        {tagsTree.map(tag => <TagSubMenu key={tag.id} tag={tag} currentFilter={currentFilter} isSidebarOpen={isSidebarOpen} onOpenModal={openModal} />)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* ================= MODAL AKSI (ALBUM / TAG) SIDEBAR ================= */}
            
            <Dialog open={modalConfig.isOpen && modalConfig.type === 'rename'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Ganti Nama {modalConfig.entity === 'album' ? 'Album' : 'Tag'}</DialogTitle></DialogHeader>
                    <form onSubmit={submitRename} className="space-y-4 mt-2">
                        <div>
                            <Label>Nama Baru</Label>
                            <Input value={newName} onChange={e => setNewName(e.target.value)} required autoFocus />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
                            <Button type="submit" disabled={isProcessing}>{isProcessing ? 'Menyimpan...' : 'Simpan Nama'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={modalConfig.isOpen && modalConfig.type === 'delete'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-md border-red-200 dark:border-red-900/50">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-500 flex items-center gap-2">
                            <AlertTriangle size={18} /> Hapus {modalConfig.entity === 'album' ? 'Album' : 'Tag'}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-zinc-700 dark:text-zinc-300">
                            Yakin ingin menghapus {modalConfig.entity === 'album' ? 'album' : 'tag'} <strong>{modalConfig.item?.name}</strong>?
                            <br/><br/>
                            <span className="block p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg text-amber-800 dark:text-amber-500 text-xs font-medium">
                                Jangan khawatir, data ({modalConfig.entity === 'album' ? 'foto' : 'orang'}) di dalamnya tidak akan terhapus dan akan dikembalikan ke kategori "Tanpa {modalConfig.entity === 'album' ? 'Album' : 'Tag'}".
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
                        <Button type="button" variant="destructive" onClick={submitDelete} disabled={isProcessing}>
                            {isProcessing ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}