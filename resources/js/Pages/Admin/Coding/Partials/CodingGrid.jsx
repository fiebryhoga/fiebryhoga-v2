import { Link, router } from '@inertiajs/react';
import { Code2, Edit, Trash2, TerminalSquare } from 'lucide-react';

export default function CodingGrid({ notes }) {
    
    const destroy = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if(confirm('Yakin ingin menghapus catatan ini?')) {
            router.delete(route('coding.destroy', id));
        }
    };

    // Fungsi sederhana untuk menghapus tag HTML dari konten (agar preview di kotak terlihat rapi)
    const stripHtml = (html) => {
        if (!html) return '// Tidak ada konten';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    if (notes.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 pb-20">
                <Code2 size={48} className="mb-3 opacity-20" />
                <p>Belum ada catatan di folder ini.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                {notes.map(note => (
                    <Link 
                        key={note.id} 
                        href={route('coding.show', note.id)} 
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group flex flex-col h-52"
                    >
                        <div className="flex justify-between items-start mb-2">
                            {/* Tag Bahasa / Kategori */}
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md uppercase tracking-wider">
                                <TerminalSquare size={12}/> {note.language || 'Code'}
                            </div>

                            {/* Tombol Aksi Cepat (Hover) */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link 
                                    href={route('coding.edit', note.id)} 
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                    onClick={(e) => e.stopPropagation()} // Cegah klik card tembus
                                >
                                    <Edit size={14}/>
                                </Link>
                                <button 
                                    onClick={(e) => destroy(e, note.id)} 
                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-tight line-clamp-2 mt-1">{note.title}</h3>
                        <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{note.description}</p>
                        
                        {/* Preview Snippet Code / Teks (Mengambil dari Rich Text) */}
                        <div className="mt-auto pt-3">
                            <div className="bg-zinc-950 rounded-xl p-3 overflow-hidden h-14 relative border border-zinc-800">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950 z-10"></div>
                                <pre className="text-[9px] text-zinc-400 font-mono leading-relaxed truncate">
                                    {stripHtml(note.content)}
                                </pre>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}