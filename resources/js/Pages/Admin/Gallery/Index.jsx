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
    const [selectedIds, setSelectedIds] = useState([]);

    const isMultiSelecting = selectedIds.length > 0;

    // Aksi Pilih Semua
    const selectAll = () => {
        if (selectedIds.length === images.length) setSelectedIds([]);
        else setSelectedIds(images.map(img => img.id));
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

                        <h1 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                            {!currentFilter.album_id ? 'Semua Media' : currentFilter.album_id === 'uncategorized' ? 'Tanpa Album' : allAlbums.find(a => a.id == currentFilter.album_id)?.name}
                        </h1>
                        <span className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full text-zinc-600 dark:text-zinc-400">{images.length} item</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {images.length > 0 && (
                            <Button variant="outline" onClick={selectAll} className="hidden sm:flex rounded-lg shadow-sm border-zinc-200 dark:border-zinc-700">
                                <CheckSquare size={16} className="mr-2"/> {selectedIds.length === images.length ? 'Batal Pilih' : 'Pilih Semua'}
                            </Button>
                        )}
                        <Button onClick={() => setActiveModal('upload')} className="rounded-lg shadow-md bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800">
                            <UploadCloud size={16} className="md:mr-2"/> <p className='hidden md:block'>Unggah Media</p>
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
                />
            </div>
        </AdminLayout>
    );
}