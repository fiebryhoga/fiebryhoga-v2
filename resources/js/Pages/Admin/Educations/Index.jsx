import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, GraduationCap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

// DND Kit
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableEducationItem } from './Partials/SortableEducationItem';
import { SortableActivityItem } from './Partials/SortableActivityItem';

export default function Index({ educations }) {
    // --- STATE PENDIDIKAN ---
    const [isEduModalOpen, setIsEduModalOpen] = useState(false);
    const [isEduEditing, setIsEduEditing] = useState(false);
    const [selectedEduId, setSelectedEduId] = useState(null);

    // --- STATE AKTIVITAS ---
    const [isActModalOpen, setIsActModalOpen] = useState(false);
    const [currentEdu, setCurrentEdu] = useState(null);
    const [isActEditing, setIsActEditing] = useState(false);
    const [selectedActId, setSelectedActId] = useState(null);

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- FORM PENDIDIKAN ---
    const eduForm = useForm({
        institution_name: '', degree: '', field_of_study: '',
        start_date: '', end_date: '', is_active: true,
    });

    // --- FORM AKTIVITAS ---
    const actForm = useForm({
        name: '', description: '', is_active: true,
    });

    // Efek agar Data Activity Modal Selalu Update walau tidak ditutup (setelah save/delete/drag)
    useEffect(() => {
        if (currentEdu) {
            const updated = educations.find(e => e.id === currentEdu.id);
            if (updated) setCurrentEdu(updated);
        }
    }, [educations]);

    // ================= HANDLING PENDIDIKAN =================
    const openAddEduModal = () => {
        setIsEduEditing(false);
        eduForm.reset();
        eduForm.clearErrors();
        setIsEduModalOpen(true);
    };

    const openEditEduModal = (edu) => {
        setIsEduEditing(true);
        setSelectedEduId(edu.id);
        eduForm.setData({
            institution_name: edu.institution_name,
            degree: edu.degree,
            field_of_study: edu.field_of_study,
            start_date: edu.start_date.split('T')[0],
            end_date: edu.end_date ? edu.end_date.split('T')[0] : '',
            is_active: edu.is_active,
        });
        eduForm.clearErrors();
        setIsEduModalOpen(true);
    };

    const handleEduSubmit = (e) => {
        e.preventDefault();
        const routeName = isEduEditing ? route('educations.update', selectedEduId) : route('educations.store');
        eduForm.post(routeName, { onSuccess: () => setIsEduModalOpen(false) });
    };

    const handleEduDelete = (id) => {
        if (confirm('Hapus pendidikan ini? Semua aktivitas di dalamnya akan ikut terhapus.')) {
            router.delete(route('educations.destroy', id));
        }
    };

    const handleEduDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = educations.findIndex(e => e.id === active.id);
            const newIndex = educations.findIndex(e => e.id === over.id);
            const newOrder = arrayMove(educations, oldIndex, newIndex);
            router.post(route('educations.update-order'), { orders: newOrder.map(e => e.id) }, { preserveScroll: true });
        }
    };

    // ================= HANDLING AKTIVITAS =================
    const openActivityModal = (edu) => {
        setCurrentEdu(edu);
        actForm.reset();
        setIsActEditing(false);
        setIsActModalOpen(true);
    };

    const handleActSubmit = (e) => {
        e.preventDefault();
        const routeName = isActEditing 
            ? route('educations.activities.update', selectedActId) 
            : route('educations.activities.store', currentEdu.id);

        actForm.post(routeName, {
            preserveScroll: true,
            onSuccess: () => {
                actForm.reset();
                setIsActEditing(false);
            }
        });
    };

    const editActivity = (act) => {
        setIsActEditing(true);
        setSelectedActId(act.id);
        actForm.setData({ name: act.name, description: act.description || '', is_active: act.is_active });
    };

    const deleteActivity = (id) => {
        if (confirm('Hapus aktivitas ini?')) router.delete(route('educations.activities.destroy', id), { preserveScroll: true });
    };

    const handleActDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = currentEdu.activities.findIndex(a => a.id === active.id);
            const newIndex = currentEdu.activities.findIndex(a => a.id === over.id);
            const newOrder = arrayMove(currentEdu.activities, oldIndex, newIndex);
            router.post(route('educations.activities.update-order'), { orders: newOrder.map(a => a.id) }, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Riwayat Pendidikan" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Riwayat Pendidikan</h1>
                    <p className="text-sm text-muted-foreground">Kelola riwayat sekolah/kampus dan aktivitas Anda.</p>
                </div>
                <Button onClick={openAddEduModal}><Plus className="mr-2 h-4 w-4" /> Tambah Pendidikan</Button>
            </div>

            {/* AREA DRAG AND DROP PENDIDIKAN */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEduDragEnd}>
                <SortableContext items={educations} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {educations.map((edu) => (
                            <SortableEducationItem 
                                key={edu.id} education={edu} openEditModal={openEditEduModal} 
                                handleDelete={handleEduDelete} openActivityModal={openActivityModal}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* ================= MODAL FORM PENDIDIKAN ================= */}
            <Dialog open={isEduModalOpen} onOpenChange={setIsEduModalOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader><DialogTitle>{isEduEditing ? 'Edit Pendidikan' : 'Tambah Pendidikan Baru'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleEduSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Nama Lembaga / Institusi</Label>
                            <Input placeholder="Contoh: Universitas Brawijaya" value={eduForm.data.institution_name} onChange={e => eduForm.setData('institution_name', e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Jenjang</Label>
                                <Input placeholder="Contoh: Sarjana (S1), SMK" value={eduForm.data.degree} onChange={e => eduForm.setData('degree', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Jurusan / Kejuruan</Label>
                                <Input placeholder="Contoh: Teknik Informatika" value={eduForm.data.field_of_study} onChange={e => eduForm.setData('field_of_study', e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tanggal Masuk</Label>
                                <Input type="date" value={eduForm.data.start_date} onChange={e => eduForm.setData('start_date', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggal Lulus (Opsional)</Label>
                                <Input type="date" value={eduForm.data.end_date} onChange={e => eduForm.setData('end_date', e.target.value)} />
                                <span className="text-[10px] text-muted-foreground">Kosongkan jika masih menempuh pendidikan.</span>
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-lg bg-muted/50 border-border">
                            <input type="checkbox" className="accent-primary" checked={eduForm.data.is_active} onChange={e => eduForm.setData('is_active', e.target.checked)} />
                            Tampilkan di Portofolio
                        </label>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsEduModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={eduForm.processing}>Simpan Data</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ================= MODAL MANAJEMEN AKTIVITAS ================= */}
            <Dialog open={isActModalOpen} onOpenChange={setIsActModalOpen}>
                {/* Hapus bg-secondary/20 agar mengikuti background default modal */}
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                    
                    {/* Header Modal */}
                    <DialogHeader className="p-6 pb-4 border-b border-border">
                        <DialogTitle className="flex items-center gap-2 text-foreground font-semibold">
                            <GraduationCap className="text-primary h-5 w-5" />
                            Aktivitas di <span className="text-muted-foreground font-semibold">{currentEdu?.institution_name}</span>
                        </DialogTitle>
                    </DialogHeader>
                    
                    {/* Body Modal (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        
                        {/* FORM INPUT AKTIVITAS */}
                        <form onSubmit={handleActSubmit} className="bg-muted/30 p-5 rounded-xl border border-border/50 space-y-4 relative overflow-hidden">
                            {/* Dekorasi Garis Kiri */}
                            <div className={`absolute left-0 top-0 w-1 h-full ${isActEditing ? 'bg-amber-500' : 'bg-primary'}`}></div>
                            
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    {isActEditing ? 'Edit Aktivitas' : 'Tambah Aktivitas Baru'}
                                </h3>
                                {isActEditing && (
                                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Mode Edit</span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Nama Aktivitas</Label>
                                <Input placeholder="Contoh: Ketua Himpunan, Lulusan Terbaik..." value={actForm.data.name} onChange={e => actForm.setData('name', e.target.value)} required className="bg-background" />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Penjelasan / Deskripsi (Opsional)</Label>
                                <textarea className="w-full bg-background border border-input rounded-md p-3 text-sm h-20 focus:ring-2 focus:ring-ring focus:outline-none transition-shadow" value={actForm.data.description} onChange={e => actForm.setData('description', e.target.value)} placeholder="Tulis penjelasan singkat tentang aktivitas ini..." />
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                    <input type="checkbox" className="rounded border-input accent-primary h-4 w-4" checked={actForm.data.is_active} onChange={e => actForm.setData('is_active', e.target.checked)} />
                                    Tampilkan di Portofolio
                                </label>
                                <div className="flex gap-2">
                                    {isActEditing && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => { setIsActEditing(false); actForm.reset(); }}>Batal Edit</Button>
                                    )}
                                    <Button className="rounded-lg" type="submit" size="sm" disabled={actForm.processing}>
                                        {isActEditing ? 'Simpan Perubahan' : 'Tambahkan'}
                                    </Button>
                                </div>
                            </div>
                        </form>

                        {/* LIST AKTIVITAS DENGAN DRAG AND DROP */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Daftar Aktivitas Tersimpan</h3>
                            
                            {currentEdu?.activities?.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-xl text-muted-foreground bg-muted/20">
                                    <GraduationCap className="h-8 w-8 mb-2 opacity-20" />
                                    <span className="text-sm">Belum ada aktivitas. Silakan tambahkan di atas.</span>
                                </div>
                            )}

                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleActDragEnd}>
                                <SortableContext items={currentEdu?.activities || []} strategy={verticalListSortingStrategy}>
                                    <div className="flex flex-col gap-2.5">
                                        {currentEdu?.activities?.map(act => (
                                            <SortableActivityItem 
                                                key={act.id} activity={act} 
                                                editActivity={editActivity} deleteActivity={deleteActivity} 
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </AdminLayout>
    );
}