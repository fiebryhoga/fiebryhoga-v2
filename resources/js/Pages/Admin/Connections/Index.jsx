import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Users, Plus, Edit, Trash2, Tag, Phone, AtSign, MapPin, Search, User
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

export default function Index({ tagsTree, allTags, connections, currentFilter }) {
    const [activeModal, setActiveModal] = useState(null); // 'connection' atau 'newTag'
    const [selectedConn, setSelectedConn] = useState(null);
    const [searchQ, setSearchQ] = useState(currentFilter.search || '');

    // Form Kontak / Orang
    const { data: connData, setData: setConnData, post: postConn, processing: connProc, reset: connReset } = useForm({
        tag_id: currentFilter.tag_id === 'untagged' ? '' : (currentFilter.tag_id || ''),
        full_name: '', nickname: '', gender: '', whatsapp: '', instagram: '', address: '', avatar: null
    });

    // Form Pembuatan Tag Baru
    const { data: tagData, setData: setTagData, post: postTag, processing: tagProc, reset: tagReset } = useForm({
        name: '', parent_id: ''
    });

    const openConnModal = (conn = null) => {
        setSelectedConn(conn);
        if (conn) {
            setConnData({
                tag_id: conn.tag_id || '', full_name: conn.full_name, nickname: conn.nickname || '',
                gender: conn.gender || '', whatsapp: conn.whatsapp || '', instagram: conn.instagram || '',
                address: conn.address || '', avatar: null
            });
        } else {
            connReset();
        }
        setActiveModal('connection');
    };

    const submitConn = (e) => {
        e.preventDefault();
        const routeName = selectedConn ? route('connections.update', selectedConn.id) : route('connections.store');
        postConn(routeName, { onSuccess: () => { setActiveModal(null); connReset(); } });
    };

    const submitTag = (e) => {
        e.preventDefault();
        postTag(route('connection-tags.store'), { onSuccess: () => { setActiveModal(null); tagReset(); } });
    };

    const deleteConn = (id) => {
        if(confirm('Hapus kontak ini?')) router.delete(route('connections.destroy', id));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('connections.index'), { ...currentFilter, search: searchQ }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title="Koneksi & Relasi" />

            <div className="h-[calc(100vh-6rem)] w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
                
                {/* --- HEADER KONTEN --- */}
                <div className="h-16 px-4 md:px-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        {/* TOMBOL BUAT TAG BARU */}
                        <button 
                            onClick={() => setActiveModal('newTag')} 
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md text-zinc-600 dark:text-zinc-300 transition-colors" 
                            title="Buat Tag Kategori Baru"
                        >
                            <Plus size={18} />
                        </button>
                        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

                        <h1 className="font-bold text-lg">
                            {!currentFilter.tag_id ? 'Semua Kontak' : currentFilter.tag_id === 'untagged' ? 'Tanpa Tag' : allTags.find(t => t.id == currentFilter.tag_id)?.name}
                        </h1>
                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">{connections.length} orang</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearch} className="hidden sm:flex relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Cari nama..." className="h-9 pl-9 w-48 rounded-full" />
                        </form>
                        <Button onClick={() => openConnModal()} className="rounded-full shadow-md"><Plus size={16} className="mr-1"/> Tambah Orang</Button>
                    </div>
                </div>

                {/* --- GRID KONTAK --- */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
                    {connections.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
                            {connections.map(conn => (
                                <div key={conn.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group flex flex-col relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-100 flex items-center justify-center shrink-0">
                                            {conn.avatar ? <img src={`/storage/${conn.avatar}`} className="w-full h-full object-cover" /> : <User size={24} className="text-zinc-400" />}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openConnModal(conn)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit size={14}/></button>
                                            <button onClick={() => deleteConn(conn.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">{conn.full_name}</h3>
                                        <p className="text-xs text-zinc-500 mb-2">{conn.nickname ? `"${conn.nickname}"` : '-'}</p>
                                        
                                        <div className="space-y-1.5 mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                                            {conn.whatsapp && <p className="flex items-center gap-2"><Phone size={12}/> {conn.whatsapp}</p>}
                                            {conn.instagram && <p className="flex items-center gap-2"><AtSign size={12}/> @{conn.instagram}</p>}
                                            {conn.address && <p className="flex items-start gap-2"><MapPin size={12} className="mt-0.5 shrink-0"/> <span className="line-clamp-2">{conn.address}</span></p>}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${conn.gender === 'L' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : conn.gender === 'P' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'}`}>
                                            {conn.gender === 'L' ? 'Cowo' : conn.gender === 'P' ? 'Cewe' : 'N/A'}
                                        </span>
                                        {conn.tag && <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-md flex items-center gap-1"><Tag size={10}/> {conn.tag.name}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                            <Users size={48} className="mb-3 opacity-20" />
                            <p>Tidak ada koneksi ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- SEMUA MODAL DI BAWAH INI --- */}

            {/* Modal Tambah/Edit Orang */}
            <Dialog open={activeModal === 'connection'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>{selectedConn ? 'Edit Kontak' : 'Tambah Orang Baru'}</DialogTitle></DialogHeader>
                    <form onSubmit={submitConn} className="space-y-4 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Nama Lengkap</Label><Input value={connData.full_name} onChange={e => setConnData('full_name', e.target.value)} required /></div>
                            <div><Label>Nama Panggilan</Label><Input value={connData.nickname} onChange={e => setConnData('nickname', e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>WhatsApp</Label><Input value={connData.whatsapp} onChange={e => setConnData('whatsapp', e.target.value)} placeholder="08..." /></div>
                            <div><Label>Instagram</Label><Input value={connData.instagram} onChange={e => setConnData('instagram', e.target.value)} placeholder="username" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Jenis Kelamin</Label>
                                <select value={connData.gender} onChange={e => setConnData('gender', e.target.value)} className="w-full rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 text-sm mt-1">
                                    <option value="">Pilih...</option><option value="L">Cowo (L)</option><option value="P">Cewe (P)</option>
                                </select>
                            </div>
                            <div>
                                <Label>Tag (Kategori)</Label>
                                <select value={connData.tag_id} onChange={e => setConnData('tag_id', e.target.value)} className="w-full rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 text-sm mt-1">
                                    <option value="">-- Tanpa Tag --</option>
                                    {allTags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div><Label>Alamat Lengkap</Label><Input value={connData.address} onChange={e => setConnData('address', e.target.value)} /></div>
                        <div><Label>Foto Profil (Opsional)</Label><Input type="file" accept="image/*" onChange={e => setConnData('avatar', e.target.files[0])} /></div>
                        
                        <div className="flex justify-end gap-2 pt-2 border-t dark:border-zinc-800">
                            <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Batal</Button>
                            <Button type="submit" disabled={connProc}>Simpan Data</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Buat Tag Baru */}
            <Dialog open={activeModal === 'newTag'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Buat Tag Kategori Baru</DialogTitle></DialogHeader>
                    <form onSubmit={submitTag} className="space-y-4 mt-2">
                        <div>
                            <Label>Nama Tag</Label>
                            <Input value={tagData.name} onChange={e => setTagData('name', e.target.value)} required placeholder="Contoh: Teman SMA, Klien VIP..." />
                        </div>
                        <div>
                            <Label>Simpan Di Dalam (Opsional)</Label>
                            <select value={tagData.parent_id} onChange={e => setTagData('parent_id', e.target.value)} className="w-full rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 text-sm mt-1">
                                <option value="">-- Tag Utama (Root) --</option>
                                {allTags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t dark:border-zinc-800">
                            <Button type="submit" disabled={tagProc} className="w-full">Buat Tag</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

        </AdminLayout>
    );
}