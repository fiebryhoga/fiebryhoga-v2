import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { UploadCloud, CheckSquare, FolderPlus } from 'lucide-react';
import { Button } from '@/Components/ui/button';

// Import Partials
import ImageGrid from './Partials/ImageGrid';
import GalleryModals from './Partials/GalleryModals';

export default function Index({ allAlbums, images, currentFilter }) {
    // States Induk
    const [activeModal, setActiveModal] = useState(null); 
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageToEdit, setImageToEdit] = useState(null);
    
    // --- STATE MULTI-SELECT ---
    const [selectedIds, setSelectedIds] = useState([]);
    const isMultiSelecting = selectedIds.length > 0;

    const selectAll = () => {
        // Cek jika jumlah yang dipilih sama dengan jumlah gambar yang TAMPIL di halaman saat ini
        if (selectedIds.length === images.data.length) {
            setSelectedIds([]); // Batal pilih semua
        } else {
            // Pilih semua ID gambar yang ada di halaman ini
            setSelectedIds(images.data.map(img => img.id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Galeri" />

            <div className="h-[calc(100vh-6rem)] w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
                
                {/* --- HEADER KONTEN --- */}
                <div className="h-16 px-4 md:px-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900 z-10">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setActiveModal('newAlbum')} 
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md text-zinc-600 dark:text-zinc-300 transition-colors" 
                            title="Buat Album Baru"
                        >
                            <FolderPlus size={18} />
                        </button>
                        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

                        <h1 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 hidden sm:block">
                            {!currentFilter.album_id ? 'Semua Media' : currentFilter.album_id === 'uncategorized' ? 'Tanpa Album' : allAlbums.find(a => a.id == currentFilter.album_id)?.name}
                        </h1>
                        {/* PERBAIKAN: Gunakan images.total karena pagination */}
                        <span className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full text-zinc-600 dark:text-zinc-400">
                            {images.total} item
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* --- TOMBOL PILIH SEMUA --- */}
                        {/* Munculkan jika ada minimal 1 gambar di halaman ini */}
                        {images.data && images.data.length > 0 && (
                            <Button 
                                variant="outline" 
                                onClick={selectAll} 
                                className="hidden sm:flex rounded-lg shadow-sm border-zinc-200 dark:border-zinc-700"
                            >
                                <CheckSquare size={16} className="mr-2"/> 
                                {selectedIds.length === images.data.length ? 'Batal Pilih' : 'Pilih Semua'}
                            </Button>
                        )}

                        <Button onClick={() => setActiveModal('upload')} className="rounded-lg shadow-md bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800">
                            <UploadCloud size={16} className="mr-2"/> <span className="hidden sm:inline">Unggah Media</span>
                        </Button>
                    </div>
                </div>

                {/* --- GRID GAMBAR (Dari Partial) --- */}
                <ImageGrid 
                    images={images}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    isMultiSelecting={isMultiSelecting}
                    setSelectedImage={setSelectedImage}
                    setImageToEdit={setImageToEdit}
                    setActiveModal={setActiveModal}
                />

                {/* --- SEMUA MODALS DI SINI (Dari Partial) --- */}
                {/* <GalleryModals 
                    activeModal={activeModal}
                    setActiveModal={setActiveModal}
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    allAlbums={allAlbums}
                    currentFilter={currentFilter}
                    imageToEdit={imageToEdit}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                /> */}

                <GalleryModals 
                    activeModal={activeModal}
                    setActiveModal={setActiveModal}
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    allAlbums={allAlbums}
                    currentFilter={currentFilter}
                    imageToEdit={imageToEdit}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    images={images.data}
                />
            </div>
        </AdminLayout>
    );
}