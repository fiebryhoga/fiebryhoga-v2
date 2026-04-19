import { usePage, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    LayoutDashboard, Users, Layers, FolderGit2, GraduationCap, 
    Briefcase, FileText, Share2, PanelLeftClose, PanelLeftOpen, 
    Image as ImageIcon, Folder, LayoutGrid, AlertTriangle, Contact2, Tag, Code2, AlertOctagon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

import ParentSelector from './Partials/ParentSelector';
import SidebarSubMenu from './Partials/SidebarSubMenu';

export default function Sidebar({ isSidebarOpen, setSidebarOpen }) {
    const { albumsTree = [], tagsTree = [], foldersTree = [], currentFilter = {} } = usePage().props;

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, entity: null, item: null });
    const [newName, setNewName] = useState('');
    const [selectedParentId, setSelectedParentId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const openModal = (type, item, entity) => {
        setModalConfig({ isOpen: true, type, entity, item });
        if (type === 'rename') setNewName(item.name);
        if (type === 'move') setSelectedParentId(item.parent_id || ''); 
        if (type === 'createSub') { setNewName(''); setSelectedParentId(item.id); } 
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, type: null, entity: null, item: null });
        setNewName(''); setSelectedParentId('');
    };

    const routeMap = {
        'album': { store: 'gallery.albums.store', update: 'gallery.albums.update', destroy: 'gallery.albums.destroy', tree: albumsTree },
        'tag': { store: 'connection-tags.store', update: 'connection-tags.update', destroy: 'connection-tags.destroy', tree: tagsTree },
        'folder_coding': { store: 'coding-folders.store', update: 'coding-folders.update', destroy: 'coding-folders.destroy', tree: foldersTree }
    };

    const getFlatOptions = (isForCreate = false) => {
        if (!modalConfig.entity) return [];
        let result = [];
        const flatten = (nodes, depth) => {
            nodes.forEach(n => {
                // Cegah item dipindahkan ke dalam dirinya sendiri atau anak-anaknya
                if (!isForCreate && modalConfig.item && n.id === modalConfig.item.id) return; 
                
                result.push({ 
                    id: n.id, 
                    name: '—'.repeat(depth) + (depth > 0 ? ' ' : '') + n.name, 
                    cleanName: n.name, 
                    depthIndicator: '—'.repeat(depth) 
                });
                if (n.children) flatten(n.children, depth + 1);
            });
        };
        flatten(routeMap[modalConfig.entity].tree, 0);
        return result;
    };

    const submitAction = (e) => {
        e.preventDefault(); setIsProcessing(true);
        if (modalConfig.type === 'rename') {
            router.put(route(routeMap[modalConfig.entity].update, modalConfig.item.id), { name: newName }, { onSuccess: () => { closeModal(); setIsProcessing(false); }, preserveScroll: true });
        } else if (modalConfig.type === 'move') {
            router.put(route(routeMap[modalConfig.entity].update, modalConfig.item.id), { name: modalConfig.item.name, parent_id: selectedParentId === '' ? null : selectedParentId }, { onSuccess: () => { closeModal(); setIsProcessing(false); }, preserveScroll: true });
        } else if (modalConfig.type === 'createSub') {
            router.post(route(routeMap[modalConfig.entity].store), { name: newName, parent_id: selectedParentId === '' ? null : selectedParentId }, { onSuccess: () => { closeModal(); setIsProcessing(false); }, preserveScroll: true });
        }
    };

    const submitDelete = (isForceDelete = false) => {
        setIsProcessing(true);
        router.delete(route(routeMap[modalConfig.entity].destroy, modalConfig.item.id), {
            data: { force: isForceDelete },
            onSuccess: () => { closeModal(); setIsProcessing(false); },
            preserveScroll: true
        });
    };

    const getActiveIcon = () => modalConfig.entity === 'tag' ? Tag : Folder;

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
        { title: 'Catatan Coding', icon: Code2, href: route('coding.index'), active: route().current('coding.*') },
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
                        const isGallery = item.title === 'Galeri Media' && route().current('gallery.*');
                        const isConnections = item.title === 'Koneksi & Relasi' && route().current('connections.*');
                        const isCoding = item.title === 'Catatan Coding' && route().current('coding.*');

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

                                {isGallery && isSidebarOpen && (
                                    <div className="mt-1.5 mb-2 ml-5 pl-2 border-l border-black/25 dark:border-white/25 flex flex-col gap-0.5">
                                        <Link href={route('gallery.index', { album_id: '' })} className={`flex items-center px-2 py-2.5 rounded-md text-xs transition-colors ${!currentFilter?.album_id ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}><LayoutGrid size={14} className="mr-2" /> Semua Media</Link>
                                        <Link href={route('gallery.index', { album_id: 'uncategorized' })} className={`flex items-center px-2 py-2.5 rounded-md text-xs transition-colors mb-2 ${currentFilter?.album_id === 'uncategorized' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}><ImageIcon size={14} className="mr-2" /> Tanpa Album</Link>
                                        {albumsTree.map(album => <SidebarSubMenu key={album.id} item={album} currentFilter={currentFilter} isSidebarOpen={isSidebarOpen} onOpenModal={openModal} config={{ idKey: 'album_id', icon: Folder, route: 'gallery.index', entity: 'album', label: 'Album' }} />)}
                                    </div>
                                )}

                                {isConnections && isSidebarOpen && (
                                    <div className="mt-1.5 mb-2 ml-5 pl-2 border-l border-black/25 dark:border-white/25 flex flex-col gap-0.5">
                                        <Link href={route('connections.index', { tag_id: '' })} className={`flex items-center px-2 py-2.5 rounded-md text-xs transition-colors ${!currentFilter?.tag_id ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}><Users size={14} className="mr-2" /> Semua Kontak</Link>
                                        <Link href={route('connections.index', { tag_id: 'untagged' })} className={`flex items-center px-2 py-2.5 rounded-md text-xs transition-colors mb-2 ${currentFilter?.tag_id === 'untagged' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}><Tag size={14} className="mr-2" /> Tanpa Tag</Link>
                                        {tagsTree.map(tag => <SidebarSubMenu key={tag.id} item={tag} currentFilter={currentFilter} isSidebarOpen={isSidebarOpen} onOpenModal={openModal} config={{ idKey: 'tag_id', icon: Tag, route: 'connections.index', entity: 'tag', label: 'Tag' }} />)}
                                    </div>
                                )}

                                {isCoding && isSidebarOpen && (
                                    <div className="mt-1.5 mb-2 ml-5 pl-2 border-l border-black/25 dark:border-white/25 flex flex-col gap-0.5">
                                        <Link href={route('coding.index', { folder_id: '' })} className={`flex items-center px-2 py-2.5 rounded-md text-xs transition-colors ${!currentFilter?.folder_id ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}><Code2 size={14} className="mr-2" /> Semua Catatan</Link>
                                        <Link href={route('coding.index', { folder_id: 'root' })} className={`flex items-center px-2 py-2.5 rounded-md text-xs transition-colors mb-2 ${currentFilter?.folder_id === 'root' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}><Folder size={14} className="mr-2" /> Tanpa Folder</Link>
                                        {foldersTree.map(folder => <SidebarSubMenu key={folder.id} item={folder} currentFilter={currentFilter} isSidebarOpen={isSidebarOpen} onOpenModal={openModal} config={{ idKey: 'folder_id', icon: Folder, route: 'coding.index', entity: 'folder_coding', label: 'Folder' }} />)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            <Dialog open={modalConfig.isOpen && modalConfig.type === 'rename'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Ganti Nama</DialogTitle></DialogHeader>
                    <form onSubmit={submitAction} className="space-y-4 mt-2">
                        <div><Label>Nama Baru</Label><Input value={newName} onChange={e => setNewName(e.target.value)} required autoFocus /></div>
                        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={closeModal}>Batal</Button><Button type="submit" disabled={isProcessing}>Simpan</Button></div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={modalConfig.isOpen && modalConfig.type === 'createSub'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Buat Kategori Bagian Dalam</DialogTitle></DialogHeader>
                    <form onSubmit={submitAction} className="space-y-4 mt-2">
                        <div><Label>Nama Kategori</Label><Input value={newName} onChange={e => setNewName(e.target.value)} required autoFocus /></div>
                        <div>
                            <Label className="mb-2 block">Berada di Bawah (Induk)</Label>
                            <ParentSelector options={getFlatOptions(true)} value={selectedParentId} onChange={setSelectedParentId} icon={getActiveIcon()} />
                        </div>
                        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={closeModal}>Batal</Button><Button type="submit" disabled={isProcessing}>Buat Sekarang</Button></div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={modalConfig.isOpen && modalConfig.type === 'move'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Pindahkan "{modalConfig.item?.name}"</DialogTitle></DialogHeader>
                    <form onSubmit={submitAction} className="space-y-4 mt-2">
                        <div>
                            <Label className="mb-2 block">Pilih Lokasi Baru</Label>
                            <ParentSelector options={getFlatOptions(false)} value={selectedParentId} onChange={setSelectedParentId} icon={getActiveIcon()} />
                        </div>
                        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={closeModal}>Batal</Button><Button type="submit" disabled={isProcessing}>Pindahkan</Button></div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={modalConfig.isOpen && modalConfig.type === 'delete'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-md border-orange-200">
                    <DialogHeader><DialogTitle className="text-orange-600 flex items-center gap-2"><AlertTriangle size={18} /> Hapus Kategori</DialogTitle>
                        <DialogDescription className="pt-2">Yakin ingin menghapus <strong>{modalConfig.item?.name}</strong>? Isi di dalamnya <b>TIDAK AKAN</b> terhapus dan akan berpindah ke kategori utama (Root).</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={closeModal}>Batal</Button><Button type="button" onClick={() => submitDelete(false)} disabled={isProcessing}>Ya, Hapus Saja</Button></div>
                </DialogContent>
            </Dialog>

            <Dialog open={modalConfig.isOpen && modalConfig.type === 'deleteAll'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-md border-red-500 bg-red-50 dark:bg-red-950/20">
                    <DialogHeader><DialogTitle className="text-red-600 flex items-center gap-2"><AlertOctagon size={18} /> Hapus Permanen & Isinya</DialogTitle>
                        <DialogDescription className="pt-2 text-red-800 dark:text-red-400">PERINGATAN! Anda akan menghapus folder <strong>{modalConfig.item?.name}</strong> beserta <b>SELURUH ISI</b> di dalamnya secara permanen. Tindakan ini tidak bisa dibatalkan.</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={closeModal}>Batal</Button><Button type="button" variant="destructive" onClick={() => submitDelete(true)} disabled={isProcessing}>Hapus Semua & Permanen</Button></div>
                </DialogContent>
            </Dialog>
        </>
    );
}