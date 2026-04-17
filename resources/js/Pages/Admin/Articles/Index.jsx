import { useState, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Image as ImageIcon, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableArticleItem } from './Partials/SortableArticleItem';

// Import Library Text Editor
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Style CSS Bawaan

export default function Index({ articles }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const { data, setData, post, processing, reset, clearErrors } = useForm({
        title: '', content: '', published_at: '', thumbnail: null,
        tags: '', meta_description: '', meta_keywords: '', is_active: true,
    });

    const openAddModal = () => {
        setIsEditing(false); setPhotoPreview(null);
        reset(); clearErrors();
        // Set tanggal hari ini otomatis
        setData('published_at', new Date().toISOString().split('T')[0]);
        setIsModalOpen(true);
    };

    const openEditModal = (article) => {
        setIsEditing(true); setSelectedId(article.id);
        setPhotoPreview(article.thumbnail ? `/storage/${article.thumbnail}` : null);
        setData({
            title: article.title,
            content: article.content,
            published_at: article.published_at.split('T')[0],
            tags: article.tags ? article.tags.join(', ') : '',
            meta_description: article.meta_description || '',
            meta_keywords: article.meta_keywords || '',
            is_active: article.is_active,
            thumbnail: null,
        });
        clearErrors(); setIsModalOpen(true);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('thumbnail', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEditing ? route('articles.update', selectedId) : route('articles.store');
        post(routeName, { onSuccess: () => setIsModalOpen(false) });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = articles.findIndex(a => a.id === active.id);
            const newIndex = articles.findIndex(a => a.id === over.id);
            const newOrder = arrayMove(articles, oldIndex, newIndex);
            router.post(route('articles.update-order'), { orders: newOrder.map(a => a.id) }, { preserveScroll: true });
        }
    };

    // Settingan Toolbar Rich Text Editor (Bisa Masukin Gambar!)
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'], // Tombol Image aktif!
            ['clean']
        ],
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Blog" />

            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tulisan / Artikel</h1>
                    <p className="text-sm text-muted-foreground">Tulis artikel, berita, atau pengalaman terbaru Anda.</p>
                </div>
                <Button onClick={openAddModal}><Plus className="mr-2 h-4 w-4" /> Tulis Artikel Baru</Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={articles} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-3">
                        {articles.map((article) => (
                            <SortableArticleItem 
                                key={article.id} article={article} 
                                openEditModal={openEditModal} 
                                handleDelete={(id) => { if (confirm('Hapus tulisan ini?')) router.delete(route('articles.destroy', id)) }}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* MODAL PENULISAN */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                    <DialogHeader className="p-6 border-b border-border bg-muted/20">
                        <DialogTitle>{isEditing ? 'Edit Tulisan' : 'Buat Tulisan Baru'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        
                        {/* Judul & Thumbnail */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-bold">Judul Tulisan <span className="text-destructive">*</span></Label>
                                    <Input placeholder="Masukkan judul yang menarik..." className="h-12 text-lg" value={data.title} onChange={e => setData('title', e.target.value)} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tanggal Publish</Label>
                                        <Input type="date" value={data.published_at} onChange={e => setData('published_at', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tags (Pisahkan dengan koma)</Label>
                                        <Input placeholder="Contoh: Laravel, React, Tutorial" value={data.tags} onChange={e => setData('tags', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-48 shrink-0 space-y-2">
                                <Label>Thumbnail Cover</Label>
                                <div onClick={() => fileInputRef.current.click()} className="w-full h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer overflow-hidden group hover:border-primary transition-colors">
                                    {photoPreview ? (
                                        <img src={photoPreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-muted-foreground"><ImageIcon className="mx-auto mb-1 opacity-50" /><span className="text-[10px]">Upload Cover</span></div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            </div>
                        </div>

                        {/* TEXT EDITOR UTAMA */}
                        <div className="space-y-2 pb-4">
                            <Label className="text-base font-bold">Isi Konten (Bisa tambah gambar) <span className="text-destructive">*</span></Label>
                            <div className="bg-background rounded-md overflow-hidden border border-input">
                                <ReactQuill 
                                    theme="snow" 
                                    value={data.content} 
                                    onChange={(val) => setData('content', val)} 
                                    modules={quillModules}
                                    className="h-[300px] pb-10" // Padding bottom karena toolbar ReactQuill
                                />
                            </div>
                        </div>

                        {/* SECTION SEO & META */}
                        <div className="p-5 bg-muted/30 rounded-xl border border-border space-y-4">
                            <h3 className="font-bold flex items-center gap-2"><Search size={16} className="text-primary"/> Pengaturan SEO (Opsional)</h3>
                            <div className="space-y-2">
                                <Label>Meta Description (Muncul di pencarian Google)</Label>
                                <textarea className="w-full bg-background border border-input rounded-md p-3 text-sm h-16" placeholder="Deskripsi singkat tentang tulisan ini..." value={data.meta_description} onChange={e => setData('meta_description', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Meta Keywords</Label>
                                <Input placeholder="Contoh: belajar react, tutorial laravel 11" value={data.meta_keywords} onChange={e => setData('meta_keywords', e.target.value)} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                                <input type="checkbox" className="accent-primary w-4 h-4" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                Terbitkan Tulisan Ini
                            </label>
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={processing}>{isEditing ? 'Update Tulisan' : 'Publish Sekarang'}</Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}