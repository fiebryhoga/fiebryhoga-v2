import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Folder, Calendar } from 'lucide-react';
import { Button } from '@/Components/ui/button';

// Syntax Highlighter
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // Tema warna kode
import { useEffect } from 'react';

export default function Show({ note }) {
    
    // Efek untuk mewarnai kode (Syntax Highlighting) saat halaman dimuat
    useEffect(() => {
        document.querySelectorAll('pre').forEach((block) => {
            hljs.highlightElement(block);
        });
    }, [note]);

    const destroy = () => {
        if(confirm('Yakin ingin menghapus catatan ini?')) {
            router.delete(route('coding.destroy', note.id));
        }
    };

    return (
        <AdminLayout>
            <Head title={note.title} />

            <div className="max-w-4xl mx-auto pb-20">
                {/* Navigasi Atas */}
                <div className="flex items-center justify-between mb-8">
                    <Link href={route('coding.index')} className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition">
                        <ArrowLeft size={16} className="mr-2" /> Kembali ke Daftar
                    </Link>
                    <div className="flex gap-2">
                        <Link href={route('coding.edit', note.id)}>
                            <Button variant="outline" className="shadow-sm"><Edit size={14} className="mr-2"/> Edit Catatan</Button>
                        </Link>
                        <Button variant="destructive" onClick={destroy} className="shadow-sm"><Trash2 size={14} className="mr-2"/> Hapus</Button>
                    </div>
                </div>

                {/* Area Konten Utama */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-12 shadow-sm min-h-[70vh]">
                    
                    {/* Header Artikel */}
                    <header className="mb-10 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 mb-4">
                            <span className="flex items-center px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                <Folder size={12} className="mr-1.5"/> {note.folder ? note.folder.name : 'Root'}
                            </span>
                            <span className="flex items-center">
                                <Calendar size={12} className="mr-1.5"/> {new Date(note.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-4">{note.title}</h1>
                        {note.description && <p className="text-lg text-zinc-500">{note.description}</p>}
                    </header>

                    {/* ISI KONTEN (Dirender dengan Tailwind Typography 'prose') */}
                    {note.content ? (
                        <article 
                            className="prose prose-zinc dark:prose-invert max-w-none 
                                       prose-pre:bg-[#282c34] prose-pre:text-zinc-300 prose-pre:border prose-pre:border-zinc-700
                                       prose-img:rounded-xl prose-img:shadow-md
                                       prose-headings:font-bold prose-a:text-blue-600"
                            dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                    ) : (
                        <div className="text-center py-20 text-zinc-400 italic">Catatan ini masih kosong...</div>
                    )}

                </div>
            </div>
        </AdminLayout>
    );
}