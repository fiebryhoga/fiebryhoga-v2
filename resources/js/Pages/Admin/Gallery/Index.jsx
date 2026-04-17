import { useState, useRef, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Image as ImageIcon, Folder, Plus, UploadCloud, Download, 
    Trash2, Edit, X, LayoutGrid, FolderPlus, CheckSquare, 
    ChevronRight, ChevronDown, MoveRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

// --- KOMPONEN REKURSIF UNTUK NESTED ALBUM SIDEBAR ---
const AlbumTreeNode = ({ album, currentFilter, handleFilter, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = album.children && album.children.length > 0;
    const isActive = currentFilter.album_id == album.id;

    return (
        <div className="flex flex-col">
            <div 
                className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'}`}
                style={{ paddingLeft: `${(level * 12) + 8}px` }}
            >
                <div className="flex items-center gap-1.5 flex-1 overflow-hidden" onClick={() => handleFilter('album_id', album.id)}>
                    {hasChildren ? (
                        <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-400">
                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    ) : <span className="w-[18px]"></span>}
                    
                    <Folder size={14} className={isActive ? "fill-blue-200 dark:fill-blue-900/50" : "fill-zinc-200 dark:fill-zinc-700"} />
                    <span className="text-sm truncate select-none">{album.name}</span>
                </div>
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">{album.images_count}</span>
            </div>
            
            {hasChildren && isOpen && (
                <div className="flex flex-col mt-0.5">
                    {album.children.map(child => (
                        <AlbumTreeNode key={child.id} album={child} currentFilter={currentFilter} handleFilter={handleFilter} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};


export default function Index({ albumsTree, allAlbums, images, currentFilter }) {
    const [selectedImage, setSelectedImage] = useState(null); // Mode Fullscreen
    const [activeModal, setActiveModal] = useState(null); 
    const [imageToEdit, setImageToEdit] = useState(null);
    
    // State Multi-Select
    const [selectedIds, setSelectedIds] = useState([]);
    const isMultiSelecting = selectedIds.length > 0;

    // State Preview Upload
    const [previewUrls, setPreviewUrls] = useState([]);

    const { data: upData, setData: setUpData, post: postUp, processing: upProc, reset: upReset } = useForm({
        album_id: currentFilter.album_id === 'uncategorized' ? '' : (currentFilter.album_id || ''),
        images: []
    });

    const { data: albData, setData: setAlbData, post: postAlb, processing: albProc, reset: albReset } = useForm({
        name: '', description: '', parent_id: ''
    });

    const { data: editData, setData: setEditData, put: putEdit } = useForm({ name: '', album_id: '' });
    const { data: bulkData, setData: setBulkData, post: postBulk } = useForm({ ids: [], album_id: '' });

    const handleFilter = (key, value) => {
        setSelectedIds([]); // Reset seleksi jika pindah album
        router.get(route('gallery.index'), { ...currentFilter, [key]: value }, { preserveState: true });
    };

    // Bersihkan URL Preview saat batal
    useEffect(() => {
        return () => previewUrls.forEach(url => URL.revokeObjectURL(url.url));
    }, [previewUrls]);

    // Handle Upload Files & Generate Previews
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setUpData('images', files);
        
        // Buat preview
        const urls = files.map(file => ({
            name: file.name,
            url: URL.createObjectURL(file)
        }));
        setPreviewUrls(urls);
    };

    const removePreview = (indexToRemove) => {
        const newFiles = [...upData.images];
        newFiles.splice(indexToRemove, 1);
        setUpData('images', newFiles);

        const newUrls = [...previewUrls];
        URL.revokeObjectURL(newUrls[indexToRemove].url);
        newUrls.splice(indexToRemove, 1);
        setPreviewUrls(newUrls);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedIds.length === images.length) setSelectedIds([]);
        else setSelectedIds(images.map(img => img.id));
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        postUp(route('gallery.images.store'), {
            onSuccess: () => { setActiveModal(null); upReset(); setPreviewUrls([]); }
        });
    };

    const handleBulkDelete = () => {
        if (confirm(`Yakin ingin menghapus ${selectedIds.length} gambar secara permanen?`)) {
            router.post(route('gallery.images.bulk-destroy'), { ids: selectedIds }, {
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Galeri" />

            {/* Hapus div wrapper flex dengan gap-4 yang membagi sidebar dan konten */}
            <div className="h-[calc(100vh-6rem)]">
                
                {/* KONTEN UTAMA (Kini menjadi Full Width karena sidebar internal dihapus) */}
                <div className="w-full h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
                    
                    {/* Header Konten */}
                    <div className="h-14 px-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
                        <div className="flex items-center gap-3">
                            {/* Tombol Buat Album dipindah ke sini */}
                            <button onClick={() => setActiveModal('newAlbum')} className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md text-zinc-600 dark:text-zinc-300 transition-colors" title="Buat Album Baru">
                                <FolderPlus size={16} />
                            </button>
                            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

                            <h1 className="font-bold text-lg">
                                {!currentFilter.album_id ? 'Semua Media' : currentFilter.album_id === 'uncategorized' ? 'Tanpa Album' : allAlbums.find(a => a.id == currentFilter.album_id)?.name}
                            </h1>
                            <span className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full text-zinc-600">{images.length} item</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {images.length > 0 && (
                                <Button variant="outline" size="sm" onClick={selectAll} className="hidden sm:flex">
                                    <CheckSquare size={14} className="mr-2"/> {selectedIds.length === images.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                                </Button>
                            )}
                            <Button size="sm" onClick={() => setActiveModal('upload')}>
                                <UploadCloud size={16} className="mr-2"/> Unggah Media
                            </Button>
                        </div>
                    </div>

                    {/* Grid Foto ... (biarkan sisa kode persis seperti sebelumnya) ... */}
                    {/* Grid Foto */}
                    <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50 dark:bg-zinc-950/50">
                        {images.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-20">
                                {images.map(img => {
                                    const isSelected = selectedIds.includes(img.id);
                                    return (
                                        <div key={img.id} className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${isSelected ? 'border-blue-500 shadow-md scale-[0.98]' : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'}`}>
                                            
                                            <img src={`/storage/${img.path}`} alt={img.name} className="w-full h-full object-cover cursor-pointer" onClick={() => isMultiSelecting ? toggleSelect(img.id) : setSelectedImage(img)} />
                                            
                                            {/* Checkbox Sudut Kiri */}
                                            <div 
                                                onClick={() => toggleSelect(img.id)}
                                                className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all z-10 
                                                ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/70 bg-black/20 opacity-0 group-hover:opacity-100'}`}
                                            >
                                                {isSelected && <CheckSquare size={12} />}
                                            </div>

                                            {/* Overlay Info Bawah */}
                                            {!isSelected && (
                                                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end pointer-events-none">
                                                    <div className="truncate text-white text-[10px] pr-2">
                                                        <p className="font-semibold truncate">{img.name}</p>
                                                        <p className="text-zinc-300">{img.size}</p>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); setImageToEdit(img); setEditData({name: img.name, album_id: img.album_id||''}); setActiveModal('editImage'); }} className="pointer-events-auto p-1.5 hover:bg-white/30 rounded text-white"><Edit size={12}/></button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                                <ImageIcon size={40} className="mb-3 opacity-20" />
                                <p className="text-sm">Folder ini kosong.</p>
                            </div>
                        )}
                    </div>

                    {/* 3. FLOATING ACTION BAR (Muncul saat ada yang dipilih) */}
                    {isMultiSelecting && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 z-20">
                            <span className="text-sm font-semibold px-2">{selectedIds.length} Dipilih</span>
                            <div className="h-4 w-px bg-zinc-700"></div>
                            <button onClick={() => { setBulkData('ids', selectedIds); setActiveModal('bulkMove'); }} className="text-xs flex items-center hover:text-blue-400 transition">
                                <MoveRight size={14} className="mr-1.5"/> Pindahkan
                            </button>
                            <button onClick={handleBulkDelete} className="text-xs flex items-center hover:text-red-400 transition">
                                <Trash2 size={14} className="mr-1.5"/> Hapus
                            </button>
                            <div className="h-4 w-px bg-zinc-700"></div>
                            <button onClick={() => setSelectedIds([])} className="text-zinc-400 hover:text-white transition"><X size={16}/></button>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= MODALS ================= */}

            {/* Modal Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                    <img src={`/storage/${selectedImage.path}`} className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
                    <div className="absolute top-4 right-4"><button onClick={() => setSelectedImage(null)} className="p-2 text-white bg-white/10 rounded-full hover:bg-white/20"><X size={20}/></button></div>
                </div>
            )}

            {/* Modal Unggah (Dengan Preview) */}
            <Dialog open={activeModal === 'upload'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader><DialogTitle>Unggah Media</DialogTitle></DialogHeader>
                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition relative">
                            <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <UploadCloud className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
                            <p className="text-sm font-medium">Klik atau seret banyak file ke sini</p>
                        </div>

                        {/* Grid Preview Foto yang akan diupload */}
                        {previewUrls.length > 0 && (
                            <div className="max-h-[40vh] overflow-y-auto p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-950">
                                <p className="text-xs font-bold text-zinc-500 mb-2">{previewUrls.length} File siap diunggah</p>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                    {previewUrls.map((preview, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border shadow-sm group">
                                            <img src={preview.url} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removePreview(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Batal</Button>
                            <Button type="submit" disabled={upProc || upData.images.length === 0}>Mulai Unggah</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Pindah Banyak (Bulk Move) */}
            <Dialog open={activeModal === 'bulkMove'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Pindahkan {selectedIds.length} Gambar</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-2">
                        <select value={bulkData.album_id} onChange={e => setBulkData('album_id', e.target.value)} className="w-full rounded-md border-zinc-200 py-2 text-sm">
                            <option value="">-- Ke Luar Album (Root) --</option>
                            {allAlbums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <Button onClick={() => postBulk(route('gallery.images.bulk-move'), { onSuccess: () => {setActiveModal(null); setSelectedIds([]);} })} className="w-full">Pindahkan Sekarang</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal Tambah Album Bersarang */}
            <Dialog open={activeModal === 'newAlbum'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Buat Album Folder</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); postAlb(route('gallery.albums.store'), { onSuccess: () => {setActiveModal(null); albReset();} }); }} className="space-y-4">
                        <div>
                            <Label>Nama Album</Label>
                            <Input value={albData.name} onChange={e => setAlbData('name', e.target.value)} required />
                        </div>
                        <div>
                            <Label>Simpan Di Dalam (Opsional)</Label>
                            <select value={albData.parent_id} onChange={e => setAlbData('parent_id', e.target.value)} className="w-full rounded-md border-zinc-200 py-2 text-sm mt-1">
                                <option value="">-- Album Utama (Root) --</option>
                                {allAlbums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <Button type="submit" className="w-full">Buat Album</Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Nama/Pindah 1 Gambar */}
            {activeModal === 'editImage' && (
                <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Edit Info Gambar</DialogTitle></DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); putEdit(route('gallery.images.update', imageToEdit.id), { onSuccess: () => setActiveModal(null) }); }} className="space-y-4">
                            <div><Label>Nama File</Label><Input value={editData.name} onChange={e => setEditData('name', e.target.value)} required /></div>
                            <div>
                                <Label>Album</Label>
                                <select value={editData.album_id} onChange={e => setEditData('album_id', e.target.value)} className="w-full rounded-md border-zinc-200 py-2 text-sm mt-1">
                                    <option value="">-- Tanpa Album --</option>
                                    {allAlbums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <Button type="submit" className="w-full">Simpan Perubahan</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

        </AdminLayout>
    );
}