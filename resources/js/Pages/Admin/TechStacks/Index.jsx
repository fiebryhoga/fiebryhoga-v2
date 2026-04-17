import { useState, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

// DND Kit Imports
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors 
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    rectSortingStrategy 
} from '@dnd-kit/sortable';
import { SortableTechItem } from './Partials/SortableTechItem';

export default function Index({ techStacks }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Konfigurasi Sensor Drag
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: '',
        is_active: true,
        image: null,
    });

    const openAddModal = () => {
        setIsEditing(false);
        setPhotoPreview(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (tech) => {
        setIsEditing(true);
        setSelectedId(tech.id);
        setPhotoPreview(tech.image ? `/storage/${tech.image}` : null);
        setData({
            name: tech.name,
            type: tech.type,
            is_active: tech.is_active,
            image: null,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEditing ? route('tech-stacks.update', selectedId) : route('tech-stacks.store');
        post(routeName, {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus teknologi ini?')) {
            router.delete(route('tech-stacks.destroy', id));
        }
    };

    const toggleActive = (tech) => {
        router.post(route('tech-stacks.update', tech.id), {
            _method: 'put',
            name: tech.name,
            type: tech.type,
            is_active: !tech.is_active
        }, { preserveScroll: true });
    };

    // Handler saat Drag Selesai
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = techStacks.findIndex((t) => t.id === active.id);
            const newIndex = techStacks.findIndex((t) => t.id === over.id);

            const newOrder = arrayMove(techStacks, oldIndex, newIndex);
            
            // Kirim urutan ID ke backend
            router.post(route('tech-stacks.update-order'), {
                orders: newOrder.map(t => t.id)
            }, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Tech Stack" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Tech Stack</h1>
                    <p className="text-sm text-zinc-500">Geser ikon untuk mengatur urutan tampilan.</p>
                </div>
                <Button onClick={openAddModal} className="rounded-xl">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Teknologi
                </Button>
            </div>

            {/* Area Drag and Drop */}
            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={techStacks} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {techStacks.map((tech) => (
                            <SortableTechItem 
                                key={tech.id} 
                                tech={tech} 
                                openEditModal={openEditModal}
                                handleDelete={handleDelete}
                                toggleActive={toggleActive}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Modal Dialog (Sama seperti sebelumnya) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Teknologi' : 'Tambah Teknologi Baru'}</DialogTitle>
                        <DialogDescription className="hidden">Kelola tumpukan teknologi portofolio.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 overflow-hidden cursor-pointer hover:border-zinc-500 transition-colors group"
                            >
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-contain p-2 bg-white dark:bg-zinc-800" />
                                ) : (
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto h-6 w-6 text-zinc-400 group-hover:text-zinc-600" />
                                        <span className="text-[10px] text-zinc-500 mt-1 block">Logo</span>
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            {errors.image && <span className="text-xs text-red-500">{errors.image}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Nama Teknologi</Label>
                            <Input placeholder="Contoh: Laravel" value={data.name} onChange={e => setData('name', e.target.value)} required />
                        </div>

                        <div className="space-y-2">
                            <Label>Kategori</Label>
                            <select 
                                value={data.type} 
                                onChange={e => setData('type', e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                                required
                            >
                                <option value="" disabled>Pilih Kategori...</option>
                                <option value="Framework">Framework</option>
                                <option value="Language">Bahasa Pemrograman</option>
                                <option value="Database">Database</option>
                                <option value="Styling">Styling / UI</option>
                                <option value="Tools">Tools / DevOps</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700"
                            />
                            <Label htmlFor="is_active" className="cursor-pointer text-sm font-medium">Tampilkan di Portofolio</Label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan Data</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}