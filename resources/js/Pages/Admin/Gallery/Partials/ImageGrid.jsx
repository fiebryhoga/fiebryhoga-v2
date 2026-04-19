import { CheckSquare, Edit, Download, Trash2, MoveRight, Image as ImageIcon, X } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function ImageGrid({ 
    images, selectedIds, setSelectedIds, isMultiSelecting, 
    setSelectedImage, setImageToEdit, setActiveModal 
}) {
    
    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const downloadImage = (img) => {
        const link = document.createElement('a');
        link.href = `/storage/${img.path}`;
        link.download = `${img.name}.${img.mime_type}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkDelete = () => {
        if (confirm(`Yakin ingin menghapus ${selectedIds.length} gambar permanen?`)) {
            router.post(route('gallery.images.bulk-destroy'), { ids: selectedIds }, {
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    if (!images || !images.data || images.data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 pb-20">
                <ImageIcon size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Tidak ada foto di direktori ini.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-50/50 dark:bg-zinc-950/50 relative">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-3 pb-6">
                {/* UBAH images.map MENJADI images.data.map */}
                {images.data.map(img => {
                    const isSelected = selectedIds.includes(img.id);
                    return (
                        <div key={img.id} className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all bg-zinc-100 dark:bg-zinc-800 ${isSelected ? 'border-blue-500 shadow-md scale-[0.98]' : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'}`}>
                            
                            <img 
                                
                                src={`/storage/${img.thumbnail_path || img.path}`} 
                                alt={img.name} 
                                loading="lazy"
                                className="w-full h-full object-cover cursor-pointer" 
                                onClick={() => isMultiSelecting ? toggleSelect(img.id) : setSelectedImage(img)} 
                            />
                            
                            {/* Checkbox */}
                            <div 
                                onClick={() => toggleSelect(img.id)}
                                className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all z-10 ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/70 bg-black/20 opacity-0 group-hover:opacity-100'}`}
                            >
                                {isSelected && <CheckSquare size={12} />}
                            </div>

                            {/* Hover Actions */}
                            {!isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 pointer-events-none">
                                    <div className="flex justify-end gap-1 pointer-events-auto">
                                        <button onClick={(e) => { e.stopPropagation(); setImageToEdit(img); setActiveModal('editImage'); }} className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded text-white"><Edit size={12}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); downloadImage(img); }} className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded text-white"><Download size={12}/></button>
                                    </div>
                                    <div className="pointer-events-auto truncate text-white text-[10px]">
                                        <p className="font-semibold truncate drop-shadow-md">{img.name}</p>
                                        <p className="text-zinc-300">{img.size}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* --- KOMPONEN PAGINATION --- */}
            {images.links && images.links.length > 3 && (
                <div className="flex justify-center pb-20">
                    <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                        {images.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                disabled={!link.url || link.active}
                                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                    link.active ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium' : 
                                    !link.url ? 'text-zinc-400 cursor-not-allowed' : 
                                    'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* FLOATING ACTION BAR */}
            {isMultiSelecting && (
                <div className="fixed bottom-8 left-1/2 md:left-[calc(50%+4rem)] -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 z-40 border border-zinc-700 dark:border-zinc-300">
                    <span className="text-sm font-semibold px-2">{selectedIds.length} Dipilih</span>
                    <div className="h-4 w-px bg-zinc-700 dark:bg-zinc-300"></div>
                    <button onClick={() => setActiveModal('bulkMove')} className="text-xs font-medium flex items-center hover:text-blue-400 dark:hover:text-blue-600 transition">
                        <MoveRight size={14} className="mr-1.5"/> Pindahkan
                    </button>
                    <button onClick={handleBulkDelete} className="text-xs font-medium flex items-center hover:text-red-400 dark:hover:text-red-600 transition">
                        <Trash2 size={14} className="mr-1.5"/> Hapus
                    </button>
                    <div className="h-4 w-px bg-zinc-700 dark:bg-zinc-300"></div>
                    <button onClick={() => setSelectedIds([])} className="text-zinc-400 dark:text-zinc-500 hover:text-white dark:hover:text-black transition"><X size={16}/></button>
                </div>
            )}
        </div>
    );
}