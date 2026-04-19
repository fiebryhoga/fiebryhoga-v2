import { useEffect, useState } from 'react';
import { usePage, useForm, router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { UploadCloud, X, Folder, ChevronLeft, ChevronRight, Download } from 'lucide-react';

import ParentSelector from '@/Components/Partials/ParentSelector';

export default function GalleryModals({ 
    activeModal, setActiveModal, selectedImage, setSelectedImage, 
    allAlbums, currentFilter, imageToEdit, selectedIds, setSelectedIds,
    images = [] // Array gambar yang sedang tampil di halaman
}) {
    const { albumsTree = [] } = usePage().props;
    const [previewUrls, setPreviewUrls] = useState([]);

    // --- LOGIKA LIGHTBOX (SLIDER PREMIUM) ---
    const currentIndex = images.findIndex(img => img.id === selectedImage?.id);
    const hasNext = currentIndex !== -1 && currentIndex < images.length - 1;
    const hasPrev = currentIndex !== -1 && currentIndex > 0;

    // State untuk deteksi Swipe di HP
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const handleNext = (e) => { e?.stopPropagation(); if (hasNext) setSelectedImage(images[currentIndex + 1]); };
    const handlePrev = (e) => { e?.stopPropagation(); if (hasPrev) setSelectedImage(images[currentIndex - 1]); };

    // Deteksi Keyboard Kiri/Kanan & ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedImage) return;
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') setSelectedImage(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, currentIndex, images]);

    // Fungsi deteksi Swipe Jari
    const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50; // Geser jari ke kiri (Next)
        const isRightSwipe = distance < -50; // Geser jari ke kanan (Prev)
        if (isLeftSwipe) handleNext();
        if (isRightSwipe) handlePrev();
    };

    // --- LOGIKA FORM LAINNYA ---
    const { data: upData, setData: setUpData, post: postUp, processing: upProc, reset: upReset } = useForm({ album_id: '', images: [] });
    const { data: albData, setData: setAlbData, post: postAlb, processing: albProc, reset: albReset } = useForm({ name: '', description: '', parent_id: '' });
    const { data: editData, setData: setEditData, put: putEdit, processing: editProc } = useForm({ name: '', album_id: '' });
    const { data: bulkData, setData: setBulkData, post: postBulk, processing: bulkProc } = useForm({ ids: [], album_id: '' });

    useEffect(() => {
        if (activeModal === 'upload') setUpData('album_id', currentFilter.album_id === 'uncategorized' ? '' : (currentFilter.album_id || ''));
        if (activeModal === 'editImage' && imageToEdit) setEditData({ name: imageToEdit.name, album_id: imageToEdit.album_id || '' });
        if (activeModal === 'bulkMove') setBulkData({ ids: selectedIds, album_id: '' });
    }, [activeModal, imageToEdit, selectedIds]);

    useEffect(() => {
        return () => previewUrls.forEach(url => URL.revokeObjectURL(url.url));
    }, [previewUrls]);

    const getFlatOptions = () => {
        let result = [];
        const flatten = (nodes, depth) => {
            nodes.forEach(n => {
                result.push({ id: n.id, name: '—'.repeat(depth) + (depth > 0 ? ' ' : '') + n.name, cleanName: n.name, depthIndicator: '—'.repeat(depth) });
                if (n.children) flatten(n.children, depth + 1);
            });
        };
        flatten(albumsTree, 0);
        return result;
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setUpData('images', files);
        setPreviewUrls(files.map(file => ({ name: file.name, url: URL.createObjectURL(file) })));
    };

    const removePreview = (index) => {
        const newFiles = [...upData.images]; newFiles.splice(index, 1); setUpData('images', newFiles);
        const newUrls = [...previewUrls]; URL.revokeObjectURL(newUrls[index].url); newUrls.splice(index, 1); setPreviewUrls(newUrls);
    };

    return (
        <>
            {/* ========================================== */}
            {/* LIGHTBOX PREMIUM (FULLSCREEN SLIDER)       */}
            {/* ========================================== */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300 select-none" 
                    onClick={() => setSelectedImage(null)}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Top Bar (Counter & Close) */}
                    <div className="absolute top-0 inset-x-0 h-20 flex items-center justify-between px-6 z-50 bg-gradient-to-b from-black/80 to-transparent text-white">
                        <span className="text-sm font-medium opacity-80 tracking-widest">
                            {currentIndex + 1} <span className="opacity-50">/</span> {images.length}
                        </span>
                        <div className="flex items-center gap-2">
                            <a href={`/storage/${selectedImage.path}`} download onClick={(e) => e.stopPropagation()} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md" title="Download Asli">
                                <Download size={18}/>
                            </a>
                            <button onClick={() => setSelectedImage(null)} className="p-2.5 bg-white/10 hover:bg-red-500/80 rounded-full transition-colors backdrop-blur-md">
                                <X size={18}/>
                            </button>
                        </div>
                    </div>

                    {/* Tombol Kiri (Desktop) */}
                    {hasPrev && (
                        <button onClick={handlePrev} className="absolute left-6 md:left-10 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all z-50 hidden sm:block hover:scale-110">
                            <ChevronLeft size={32} strokeWidth={1.5} />
                        </button>
                    )}

                    {/* Foto Utama (Ditambah atribut key agar animasi ter-trigger tiap gambar ganti) */}
                    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden">
                        <img 
                            key={selectedImage.id}
                            src={`/storage/${selectedImage.path}`} 
                            alt={selectedImage.name}
                            className="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-200 drop-shadow-2xl" 
                            onClick={(e) => e.stopPropagation()} 
                            draggable="false"
                        />
                    </div>

                    {/* Tombol Kanan (Desktop) */}
                    {hasNext && (
                        <button onClick={handleNext} className="absolute right-6 md:right-10 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all z-50 hidden sm:block hover:scale-110">
                            <ChevronRight size={32} strokeWidth={1.5} />
                        </button>
                    )}

                    {/* Bottom Bar (Info Gambar) */}
                    <div className="absolute bottom-0 inset-x-0 pb-8 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none flex flex-col items-center justify-end">
                        <h3 className="text-white font-semibold tracking-wide drop-shadow-md text-base md:text-lg px-6 text-center line-clamp-1">{selectedImage.name}</h3>
                        <p className="text-white/50 text-xs mt-1.5 uppercase tracking-widest">{selectedImage.size} • {selectedImage.mime_type}</p>
                    </div>
                </div>
            )}


            {/* ========================================== */}
            {/* SEMUA MODAL LAINNYA TETAP SAMA             */}
            {/* ========================================== */}

            {/* MODAL UPLOAD */}
            <Dialog open={activeModal === 'upload'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader><DialogTitle>Unggah Media</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); postUp(route('gallery.images.store'), { onSuccess: () => {setActiveModal(null); upReset(); setPreviewUrls([]);} }); }} className="space-y-4 mt-2">
                        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition relative">
                            <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <UploadCloud className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
                            <p className="text-sm font-medium">Klik atau seret banyak file ke sini</p>
                        </div>
                        {previewUrls.length > 0 && (
                            <div className="max-h-[40vh] overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950">
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                    {previewUrls.map((preview, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm group">
                                            <img src={preview.url} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removePreview(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={upProc || upData.images.length === 0}>{upProc ? 'Mengunggah...' : 'Mulai Unggah'}</Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL BUAT ALBUM */}
            <Dialog open={activeModal === 'newAlbum'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Buat Album Folder</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); postAlb(route('gallery.albums.store'), { onSuccess: () => {setActiveModal(null); albReset();} }); }} className="space-y-4 mt-2">
                        <div><Label>Nama Album</Label><Input value={albData.name} onChange={e => setAlbData('name', e.target.value)} required /></div>
                        <div>
                            <Label className="mb-2 block">Simpan Di Dalam (Opsional)</Label>
                            <ParentSelector options={getFlatOptions()} value={albData.parent_id} onChange={(val) => setAlbData('parent_id', val)} placeholder="-- Album Utama (Root) --" icon={Folder} />
                        </div>
                        <div className="flex justify-end pt-2 border-t dark:border-zinc-800 mt-4">
                            <Button type="submit" disabled={albProc} className="w-full">Buat Album</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL EDIT 1 GAMBAR */}
            <Dialog open={activeModal === 'editImage'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Edit Info Gambar</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); putEdit(route('gallery.images.update', imageToEdit.id), { onSuccess: () => setActiveModal(null) }); }} className="space-y-4 mt-2">
                        <div><Label>Nama File</Label><Input value={editData.name} onChange={e => setEditData('name', e.target.value)} required /></div>
                        <div>
                            <Label className="mb-2 block">Pindah Album</Label>
                            <ParentSelector options={getFlatOptions()} value={editData.album_id} onChange={(val) => setEditData('album_id', val)} placeholder="-- Tanpa Album --" icon={Folder} />
                        </div>
                        <div className="flex justify-end pt-2 border-t dark:border-zinc-800 mt-4">
                            <Button type="submit" disabled={editProc} className="w-full">Simpan Perubahan</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL PINDAH BANYAK (BULK MOVE) */}
            <Dialog open={activeModal === 'bulkMove'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Pindahkan {selectedIds.length} Gambar</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <Label className="mb-2 block">Pindah ke Album</Label>
                            <ParentSelector options={getFlatOptions()} value={bulkData.album_id} onChange={(val) => setBulkData('album_id', val)} placeholder="-- Ke Luar Album (Root) --" icon={Folder} />
                        </div>
                        <div className="flex justify-end pt-2 border-t dark:border-zinc-800 mt-4">
                            <Button onClick={() => postBulk(route('gallery.images.bulk-move'), { onSuccess: () => {setActiveModal(null); setSelectedIds([]);} })} disabled={bulkProc} className="w-full">
                                {bulkProc ? 'Memindahkan...' : 'Pindahkan Sekarang'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}