import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Users, Plus, Edit, Trash2, Tag, Phone, AtSign, MapPin, Search, User, CheckSquare, MoveRight, X, Folder
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

// Import Custom Dropdown untuk Hierarki
import ParentSelector from '@/Components/Partials/ParentSelector';

export default function Index({ tagsTree, allTags, connections, currentFilter }) {
    const [activeModal, setActiveModal] = useState(null); 
    const [selectedConn, setSelectedConn] = useState(null);
    
    // --- LIVE SEARCH STATE ---
    const [searchQ, setSearchQ] = useState(currentFilter.search || '');

    // --- STATE MULTI-SELECT ---
    const [selectedIds, setSelectedIds] = useState([]);
    const isMultiSelecting = selectedIds.length > 0;

    // Forms
    const { data: connData, setData: setConnData, post: postConn, processing: connProc, reset: connReset } = useForm({
        tag_id: currentFilter.tag_id === 'untagged' ? '' : (currentFilter.tag_id || ''),
        full_name: '', nickname: '', gender: '', whatsapp: '', instagram: '', address: '', avatar: null
    });

    const { data: tagData, setData: setTagData, post: postTag, processing: tagProc, reset: tagReset } = useForm({ name: '', parent_id: '' });
    const { data: bulkData, setData: setBulkData, post: postBulk, processing: bulkProc } = useForm({ ids: [], tag_id: '' });

    // --- EFEK LIVE SEARCH (Debounce) ---
    useEffect(() => {
        // Mencegah pencarian saat pertama kali halaman dimuat (jika sama dengan URL)
        if (searchQ === (currentFilter.search || '')) return;

        const delayDebounceFn = setTimeout(() => {
            router.get(route('connections.index'), { ...currentFilter, search: searchQ }, { preserveState: true, replace: true });
        }, 300); // Tunggu 300ms setelah user berhenti mengetik

        return () => clearTimeout(delayDebounceFn);
    }, [searchQ]);

    // --- FUNGSI MULTI SELECT ---
    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedIds.length === connections.length) setSelectedIds([]);
        else setSelectedIds(connections.map(c => c.id));
    };

    const handleBulkDelete = () => {
        if (confirm(`Yakin ingin menghapus ${selectedIds.length} kontak secara permanen?`)) {
            router.post(route('connections.bulk-destroy'), { ids: selectedIds }, {
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    // --- FUNGSI STANDAR ---
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

    // --- FUNGSI BANTUAN UNTUK DROPDOWN HIERARKI ---
    const getFlatOptions = () => {
        let result = [];
        const flatten = (nodes, depth) => {
            nodes.forEach(n => {
                result.push({ 
                    id: n.id, 
                    name: '—'.repeat(depth) + (depth > 0 ? ' ' : '') + n.name, 
                    cleanName: n.name, 
                    depthIndicator: '—'.repeat(depth) 
                });
                if (n.children) flatten(n.children, depth + 1);
            });
        };
        flatten(tagsTree, 0);
        return result;
    };

    return (
        <AdminLayout>
            <Head title="Koneksi & Relasi" />

            <div className="h-[calc(100vh-6rem)] w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
                
                {/* --- HEADER KONTEN --- */}
                <div className="h-16 px-4 md:px-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900 z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveModal('newTag')} className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md text-zinc-600 dark:text-zinc-300 transition-colors" title="Buat Tag Baru">
                            <Plus size={18} />
                        </button>
                        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

                        <h1 className="font-bold text-lg hidden sm:block">
                            {!currentFilter.tag_id ? 'Semua Kontak' : currentFilter.tag_id === 'untagged' ? 'Tanpa Tag' : allTags.find(t => t.id == currentFilter.tag_id)?.name}
                        </h1>
                        <span className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full text-zinc-600 dark:text-zinc-400">{connections.length} orang</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* LIVE SEARCH BAR */}
                        <div className="hidden lg:flex relative mr-2 w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input 
                                value={searchQ} 
                                onChange={e => setSearchQ(e.target.value)} 
                                placeholder="Cari nama..." 
                                className="h-9 pl-9 pr-8 rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 focus:bg-white dark:bg-zinc-950 dark:focus:bg-zinc-900 transition-colors" 
                            />
                            {/* TOMBOL CLEAR (X) */}
                            {searchQ && (
                                <button 
                                    onClick={() => setSearchQ('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        
                        {connections.length > 0 && (
                            <Button variant="outline" size="sm" onClick={selectAll} className="hidden sm:flex rounded-lg shadow-sm border-zinc-200 dark:border-zinc-700">
                                <CheckSquare size={14} className="mr-2"/> {selectedIds.length === connections.length ? 'Batal Pilih' : 'Pilih Semua'}
                            </Button>
                        )}
                        {/* TOMBOL TAMBAH DIPERBARUI: WARNA HITAM/ZINC, BENTUK ROUNDED-LG */}
                        <Button size="sm" onClick={() => openConnModal()} className="rounded-lg shadow-md bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                            <Plus size={16} className="mr-1"/> <span className="hidden sm:inline">Tambah Orang</span>
                        </Button>
                    </div>
                </div>

                {/* --- GRID KONTAK --- */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
                    {connections.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
                            {connections.map(conn => {
                                const isSelected = selectedIds.includes(conn.id);
                                return (
                                    <div 
                                        key={conn.id} 
                                        onClick={() => isMultiSelecting && toggleSelect(conn.id)}
                                        className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 transition-all group flex flex-col relative ${isMultiSelecting ? 'cursor-pointer' : ''} ${isSelected ? 'border-zinc-900 dark:border-zinc-100 shadow-md scale-[0.98]' : 'border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                                    >
                                        {/* CHECKBOX */}
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); toggleSelect(conn.id); }}
                                            className={`absolute top-4 right-4 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all z-10 ${isSelected ? 'bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100 text-white dark:text-zinc-900' : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 opacity-0 group-hover:opacity-100'}`}
                                        >
                                            {isSelected && <CheckSquare size={12} />}
                                        </div>

                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-100 flex items-center justify-center shrink-0">
                                                {conn.avatar ? <img src={`/storage/${conn.avatar}`} className="w-full h-full object-cover" /> : <User size={24} className="text-zinc-400" />}
                                            </div>
                                            
                                            {!isMultiSelecting && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-6">
                                                    <button onClick={(e) => { e.stopPropagation(); openConnModal(conn); }} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit size={14}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); deleteConn(conn.id); }} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 size={14}/></button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight pr-6">{conn.full_name}</h3>
                                            <p className="text-xs text-zinc-500 mb-2">{conn.nickname ? `"${conn.nickname}"` : '-'}</p>
                                            
                                            <div className="space-y-1.5 mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                                                {conn.whatsapp && <p className="flex items-center gap-2"><Phone size={12}/> {conn.whatsapp}</p>}
                                                {conn.instagram && <p className="flex items-center gap-2"><AtSign size={12}/> @{conn.instagram}</p>}
                                                {conn.address && <p className="flex items-start gap-2"><MapPin size={12} className="mt-0.5 shrink-0"/> <span className="line-clamp-2">{conn.address}</span></p>}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${conn.gender === 'L' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : conn.gender === 'P' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'}`}>
                                                {conn.gender === 'L' ? 'Laki-laki' : conn.gender === 'P' ? 'Perempuan' : 'N/A'}
                                            </span>
                                            {conn.tag && <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-md flex items-center gap-1"><Tag size={10}/> {conn.tag.name}</span>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                            <Users size={48} className="mb-3 opacity-20" />
                            <p className="text-sm">{searchQ ? 'Pencarian tidak ditemukan.' : 'Tidak ada koneksi ditemukan.'}</p>
                        </div>
                    )}
                </div>

                {/* --- FLOATING ACTION BAR --- */}
                {isMultiSelecting && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 z-40 border border-zinc-700 dark:border-zinc-300">
                        <span className="text-sm font-semibold px-2">{selectedIds.length} Dipilih</span>
                        <div className="h-4 w-px bg-zinc-700 dark:bg-zinc-300"></div>
                        <button onClick={() => { setBulkData('ids', selectedIds); setActiveModal('bulkMove'); }} className="text-xs font-medium flex items-center hover:text-blue-400 dark:hover:text-blue-600 transition">
                            <MoveRight size={14} className="mr-1.5"/> Pindahkan Tag
                        </button>
                        <button onClick={handleBulkDelete} className="text-xs font-medium flex items-center hover:text-red-400 dark:hover:text-red-600 transition">
                            <Trash2 size={14} className="mr-1.5"/> Hapus
                        </button>
                        <div className="h-4 w-px bg-zinc-700 dark:bg-zinc-300"></div>
                        <button onClick={() => setSelectedIds([])} className="text-zinc-400 dark:text-zinc-500 hover:text-white dark:hover:text-black transition"><X size={16}/></button>
                    </div>
                )}
            </div>

            {/* --- SEMUA MODAL FORM --- */}

            <Dialog open={activeModal === 'connection'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader><DialogTitle>{selectedConn ? 'Edit Kontak' : 'Tambah Orang Baru'}</DialogTitle></DialogHeader>
                    <form onSubmit={submitConn} className="space-y-5 mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Nama Lengkap</Label><Input value={connData.full_name} onChange={e => setConnData('full_name', e.target.value)} required className="mt-1" /></div>
                            <div><Label>Nama Panggilan</Label><Input value={connData.nickname} onChange={e => setConnData('nickname', e.target.value)} className="mt-1" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>WhatsApp</Label><Input value={connData.whatsapp} onChange={e => setConnData('whatsapp', e.target.value)} placeholder="08..." className="mt-1" /></div>
                            <div><Label>Instagram</Label><Input value={connData.instagram} onChange={e => setConnData('instagram', e.target.value)} placeholder="username" className="mt-1" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-1 block">Jenis Kelamin</Label>
                                <select value={connData.gender} onChange={e => setConnData('gender', e.target.value)} className="w-full rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 transition-all outline-none">
                                    <option value="">-- Pilih Gender --</option><option value="L">Laki-laki (L)</option><option value="P">Perempuan (P)</option>
                                </select>
                            </div>
                            <div>
                                <Label className="mb-1 block">Kategori (Tag)</Label>
                                {/* CUSTOM DROPDOWN */}
                                <ParentSelector 
                                    options={getFlatOptions()} 
                                    value={connData.tag_id} 
                                    onChange={(val) => setConnData('tag_id', val)} 
                                    placeholder="-- Tanpa Tag --"
                                    icon={Tag} 
                                />
                            </div>
                        </div>
                        <div><Label>Alamat Lengkap</Label><Input value={connData.address} onChange={e => setConnData('address', e.target.value)} className="mt-1" /></div>
                        
                        <div>
                            <Label className="mb-1 block">Foto Profil (Opsional)</Label>
                            <Input type="file" accept="image/*" onChange={e => setConnData('avatar', e.target.files[0])} className="cursor-pointer file:text-zinc-600 file:bg-zinc-100 hover:file:bg-zinc-200 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 dark:file:bg-zinc-800 dark:file:text-zinc-300" />
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Batal</Button>
                            <Button type="submit" disabled={connProc} className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                {connProc ? 'Menyimpan...' : 'Simpan Data'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={activeModal === 'newTag'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Buat Tag Kategori Baru</DialogTitle></DialogHeader>
                    <form onSubmit={submitTag} className="space-y-4 mt-2">
                        <div>
                            <Label>Nama Tag</Label>
                            <Input value={tagData.name} onChange={e => setTagData('name', e.target.value)} required placeholder="Contoh: Teman SMA, Klien VIP..." className="mt-1" />
                        </div>
                        <div>
                            <Label className="mb-1 block">Simpan Di Dalam (Opsional)</Label>
                            {/* CUSTOM DROPDOWN */}
                            <ParentSelector 
                                options={getFlatOptions()} 
                                value={tagData.parent_id} 
                                onChange={(val) => setTagData('parent_id', val)} 
                                placeholder="-- Tag Utama (Root) --"
                                icon={Tag} 
                            />
                        </div>
                        <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
                            <Button type="submit" disabled={tagProc} className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                Buat Tag
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={activeModal === 'bulkMove'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Pindahkan {selectedIds.length} Kontak</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <Label className="mb-1 block">Pindah ke Tag</Label>
                            {/* CUSTOM DROPDOWN */}
                            <ParentSelector 
                                options={getFlatOptions()} 
                                value={bulkData.tag_id} 
                                onChange={(val) => setBulkData('tag_id', val)} 
                                placeholder="-- Hapus dari Tag (Keluarkan) --"
                                icon={Tag} 
                            />
                        </div>
                        <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
                            <Button onClick={() => postBulk(route('connections.bulk-move'), { onSuccess: () => {setActiveModal(null); setSelectedIds([]);} })} disabled={bulkProc} className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                {bulkProc ? 'Memindahkan...' : 'Pindahkan Sekarang'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </AdminLayout>
    );
}