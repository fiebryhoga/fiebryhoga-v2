import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Plus, Search, FolderPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

// Import komponen kotak grid yang barusan dibuat
import CodingGrid from './Partials/CodingGrid.jsx'; 

export default function Index({ allFolders, notes, currentFilter }) {
    const [activeModal, setActiveModal] = useState(null); // Hanya untuk 'newFolder'
    const [searchQ, setSearchQ] = useState(currentFilter.search || '');

    const { data: folderData, setData: setFolderData, post: postFolder, processing: folderProc, reset: folderReset } = useForm({ 
        name: '', parent_id: '' 
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('coding.index'), { ...currentFilter, search: searchQ }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title="Catatan Coding" />

            <div className="h-[calc(100vh-6rem)] w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
                
                {/* --- HEADER KONTEN --- */}
                <div className="h-16 px-4 md:px-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900 z-10">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setActiveModal('newFolder')} 
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md text-zinc-600 dark:text-zinc-300 transition-colors"
                            title="Buat Folder Baru"
                        >
                            <FolderPlus size={18} />
                        </button>
                        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
                        
                        <h1 className="font-bold text-lg hidden sm:block">
                            {!currentFilter.folder_id ? 'Semua Catatan' : currentFilter.folder_id === 'root' ? 'Tanpa Folder' : allFolders.find(f => f.id == currentFilter.folder_id)?.name}
                        </h1>
                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full text-zinc-600 dark:text-zinc-400">{notes.length} item</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="hidden lg:flex relative mr-2">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input 
                                value={searchQ} 
                                onChange={e => setSearchQ(e.target.value)} 
                                placeholder="Cari snippet..." 
                                className="h-9 pl-9 w-48 rounded-full border-zinc-200 dark:border-zinc-700" 
                            />
                        </form>
                        
                        {/* TOMBOL BERUBAH MENJADI LINK KE HALAMAN CREATE */}
                        <Link href={route('coding.create')}>
                            <Button size="sm" className="rounded-full shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus size={16} className="mr-1"/> Buat Catatan
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* --- GRID CATATAN (DARI PARTIAL) --- */}
                <CodingGrid notes={notes} />
                
            </div>

            {/* --- MODAL HANYA UNTUK BUAT FOLDER --- */}
            <Dialog open={activeModal === 'newFolder'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Buat Folder Coding Baru</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); postFolder(route('coding-folders.store'), { onSuccess: () => {setActiveModal(null); folderReset();} }); }} className="space-y-4 mt-2">
                        <div>
                            <Label>Nama Folder</Label>
                            <Input value={folderData.name} onChange={e => setFolderData('name', e.target.value)} required placeholder="Misal: Snippet React, Cheatsheet..." autoFocus/>
                        </div>
                        <div>
                            <Label>Simpan di Dalam (Opsional)</Label>
                            <select value={folderData.parent_id} onChange={e => setFolderData('parent_id', e.target.value)} className="w-full rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 text-sm mt-1">
                                <option value="">-- Folder Utama (Root) --</option>
                                {allFolders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t dark:border-zinc-800 mt-4">
                            <Button type="submit" className="w-full" disabled={folderProc}>Buat Folder</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

        </AdminLayout>
    );
}