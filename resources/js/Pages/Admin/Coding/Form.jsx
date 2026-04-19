import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Folder } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

// Import React Quill & CSS-nya
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Konfigurasi Toolbar Editor
const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link', 'image', 'code-block'], 
        ['clean']
    ],
};

export default function Form({ note = null, allFolders }) {
    const { data, setData, post, put, processing } = useForm({
        folder_id: note?.folder_id || '',
        title: note?.title || '',
        description: note?.description || '',
        content: note?.content || ''
    });

    const submit = (e) => {
        e.preventDefault();
        if (note) put(route('coding.update', note.id));
        else post(route('coding.store'));
    };

    return (
        <AdminLayout>
            <Head title={note ? 'Edit Catatan' : 'Tulis Catatan'} />

            {/* INJEKSI CSS KHUSUS UNTUK MENGATASI MASALAH QUILL */}
            <style dangerouslySetInnerHTML={{__html: `
                /* 1. Mencegah Scroll di dalam Editor, biarkan tumbuh mengikuti halaman */
                .quill-premium .ql-container {
                    height: auto !important;
                    min-height: 500px;
                    border: none !important;
                    font-family: inherit;
                    font-size: 1rem;
                }
                
                .quill-premium .ql-editor {
                    min-height: 500px;
                    overflow-y: visible !important; /* Hilangkan scroll internal */
                    padding: 2rem 1.5rem;
                    line-height: 1.8;
                }

                /* 2. Memperbaiki masalah gambar raksasa */
                .quill-premium .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.75rem; /* Sudut melengkung agar estetik */
                    margin: 2rem auto; /* Beri jarak atas bawah */
                    display: block;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); /* Efek bayangan */
                }

                /* 3. Toolbar Menempel di Atas (Sticky) saat di-scroll */
                .quill-premium .ql-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 40;
                    background: white;
                    border-top-left-radius: 1rem;
                    border-top-right-radius: 1rem;
                    border: none !important;
                    border-bottom: 1px solid #f4f4f5 !important;
                    padding: 1rem;
                }

                /* Dark mode untuk Toolbar (opsional jika Anda pakai tema gelap) */
                .dark .quill-premium .ql-toolbar {
                    background: #18181b;
                    border-bottom-color: #27272a !important;
                }
                .dark .quill-premium .ql-editor.ql-blank::before {
                    color: #71717a;
                }
            `}} />

            <div className="max-w-4xl mx-auto pb-24">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8 mt-4">
                    <Link href={note ? route('coding.show', note.id) : route('coding.index')} className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <ArrowLeft size={16} className="mr-2" /> Batal & Kembali
                    </Link>
                    <Button onClick={submit} disabled={processing} className="rounded-full shadow-md px-6 bg-blue-600 hover:bg-blue-700 text-white">
                        <Save size={16} className="mr-2" /> {processing ? 'Menyimpan...' : 'Simpan Catatan'}
                    </Button>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm overflow-hidden">
                    <div className="p-8 md:p-12">
                        
                        {/* Judul Teks Besar Ala Notion */}
                        <div className="mb-6">
                            <input 
                                type="text"
                                value={data.title} 
                                onChange={e => setData('title', e.target.value)} 
                                required 
                                placeholder="Judul Catatan..." 
                                className="w-full bg-transparent border-none text-4xl md:text-5xl font-extrabold focus:ring-0 p-0 text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 outline-none" 
                            />
                        </div>

                        {/* Pengaturan Kategori & Deskripsi */}
                        <div className="flex flex-col md:flex-row gap-6 mb-10 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex-1">
                                <Label className="text-zinc-500 font-medium mb-1.5 block">Deskripsi Singkat</Label>
                                <Input 
                                    value={data.description} 
                                    onChange={e => setData('description', e.target.value)} 
                                    placeholder="Tulis ringkasan tentang catatan ini (opsional)..." 
                                    className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-50/50 dark:bg-zinc-950/50 h-11" 
                                />
                            </div>
                            <div className="w-full md:w-64 shrink-0">
                                <Label className="text-zinc-500 font-medium mb-1.5 block">Simpan di Folder</Label>
                                <div className="relative">
                                    <Folder size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <select 
                                        value={data.folder_id} 
                                        onChange={e => setData('folder_id', e.target.value)} 
                                        className="w-full pl-9 pr-4 h-11 rounded-md border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-50/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="">-- Root (Tanpa Folder) --</option>
                                        {allFolders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* RICH TEXT EDITOR PREMIUM */}
                        <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
                            <ReactQuill 
                                theme="snow" 
                                value={data.content} 
                                onChange={(content) => setData('content', content)} 
                                modules={modules}
                                placeholder="Ketik '/' untuk perintah atau mulai menulis di sini..."
                                className="quill-premium"
                            />
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-xs text-zinc-400 font-medium">Tips: Blok teks dan klik ikon <b>&lt;/&gt;</b> di toolbar untuk membuat blok kode bergaya Terminal.</p>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}