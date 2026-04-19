import { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { UploadCloud, X, Download } from 'lucide-react';

export default function GalleryModals({ 
    activeModal, setActiveModal, selectedImage, setSelectedImage, 
    allAlbums, currentFilter, imageToEdit, selectedIds, setSelectedIds 
}) {
    const [previewUrls, setPreviewUrls] = useState([]);

    // Forms
    const { data: upData, setData: setUpData, post: postUp, processing: upProc, reset: upReset } = useForm({ album_id: '', images: [] });
    const { data: albData, setData: setAlbData, post: postAlb, processing: albProc, reset: albReset } = useForm({ name: '', description: '', parent_id: '' });
    const { data: editData, setData: setEditData, put: putEdit, processing: editProc } = useForm({ name: '', album_id: '' });
    const { data: bulkData, setData: setBulkData, post: postBulk, processing: bulkProc } = useForm({ ids: [], album_id: '' });

    // Sync Initial Data
    useEffect(() => {
        if (activeModal === 'upload') setUpData('album_id', currentFilter.album_id === 'uncategorized' ? '' : (currentFilter.album_id || ''));
        if (activeModal === 'editImage' && imageToEdit) setEditData({ name: imageToEdit.name, album_id: imageToEdit.album_id || '' });
        if (activeModal === 'bulkMove') setBulkData({ ids: selectedIds, album_id: '' });
    }, [activeModal, imageToEdit, selectedIds]);

    // Cleanup Previews
    useEffect(() => {
        return () => previewUrls.forEach(url => URL.revokeObjectURL(url.url));
    }, [previewUrls]);

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
            {/* LIGHTBOX */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                    <img src={`/storage/${selectedImage.path}`} className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
                    <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 text-white bg-white/10 rounded-full hover:bg-white/20"><X size={20}/></button>
                </div>
            )}

            {/* MODAL UPLOAD */}
            <Dialog open={activeModal === 'upload'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader><DialogTitle>Unggah Media</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); postUp(route('gallery.images.store'), { onSuccess: () => {setActiveModal(null); upReset(); setPreviewUrls([]);} }); }} className="space-y-4">
                        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition relative">
                            <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <UploadCloud className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
                            <p className="text-sm font-medium">Klik atau seret banyak file ke sini</p>
                        </div>
                        {previewUrls.length > 0 && (
                            <div className="max-h-[40vh] overflow-y-auto p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-950">
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
                        <Button type="submit" className="w-full" disabled={upProc || upData.images.length === 0}>{upProc ? 'Mengunggah...' : 'Mulai Unggah'}</Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL BUAT ALBUM */}
            <Dialog open={activeModal === 'newAlbum'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Buat Album Folder</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); postAlb(route('gallery.albums.store'), { onSuccess: () => {setActiveModal(null); albReset();} }); }} className="space-y-4 mt-2">
                        <div><Label>Nama Album</Label><Input value={albData.name} onChange={e => setAlbData('name', e.target.value)} required /></div>
                        <div>
                            <Label>Simpan Di Dalam (Opsional)</Label>
                            <select value={albData.parent_id} onChange={e => setAlbData('parent_id', e.target.value)} className="w-full rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 text-sm mt-1">
                                <option value="">-- Album Utama (Root) --</option>
                                {allAlbums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <Button type="submit" disabled={albProc} className="w-full">Buat Album</Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL EDIT 1 GAMBAR */}
            <Dialog open={activeModal === 'editImage'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Info Gambar</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); putEdit(route('gallery.images.update', imageToEdit.id), { onSuccess: () => setActiveModal(null) }); }} className="space-y-4 mt-2">
                        <div><Label>Nama File</Label><Input value={editData.name} onChange={e => setEditData('name', e.target.value)} required /></div>
                        <div>
                            <Label>Pindah Album</Label>
                            <select value={editData.album_id} onChange={e => setEditData('album_id', e.target.value)} className="w-full rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 text-sm mt-1">
                                <option value="">-- Tanpa Album --</option>
                                {allAlbums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <Button type="submit" disabled={editProc} className="w-full">Simpan Perubahan</Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL PINDAH BANYAK (BULK MOVE) */}
            <Dialog open={activeModal === 'bulkMove'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Pindahkan {selectedIds.length} Gambar</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-2">
                        <select value={bulkData.album_id} onChange={e => setBulkData('album_id', e.target.value)} className="w-full rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 text-sm">
                            <option value="">-- Ke Luar Album (Root) --</option>
                            {allAlbums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <Button onClick={() => postBulk(route('gallery.images.bulk-move'), { onSuccess: () => {setActiveModal(null); setSelectedIds([]);} })} disabled={bulkProc} className="w-full">Pindahkan Sekarang</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}