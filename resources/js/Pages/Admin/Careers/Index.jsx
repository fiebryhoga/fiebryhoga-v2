import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCareerItem } from './Partials/SortableCareerItem';
import { SortableCareerActivityItem } from './Partials/SortableCareerActivityItem';

export default function Index({ careers }) {
    const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
    const [isCareerEditing, setIsCareerEditing] = useState(false);
    const [selectedCareerId, setSelectedCareerId] = useState(null);

    const [isActModalOpen, setIsActModalOpen] = useState(false);
    const [currentCareer, setCurrentCareer] = useState(null);
    const [isActEditing, setIsActEditing] = useState(false);
    const [selectedActId, setSelectedActId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const careerForm = useForm({
        company_name: '', job_title: '', location: '',
        start_date: '', end_date: '', is_active: true,
    });

    const actForm = useForm({
        name: '', description: '', is_active: true,
    });

    useEffect(() => {
        if (currentCareer) {
            const updated = careers.find(c => c.id === currentCareer.id);
            if (updated) setCurrentCareer(updated);
        }
    }, [careers]);

    // ================= HANDLING KARIR =================
    const openAddCareerModal = () => {
        setIsCareerEditing(false);
        careerForm.reset();
        careerForm.clearErrors();
        setIsCareerModalOpen(true);
    };

    const openEditCareerModal = (career) => {
        setIsCareerEditing(true);
        setSelectedCareerId(career.id);
        careerForm.setData({
            company_name: career.company_name,
            job_title: career.job_title,
            location: career.location,
            start_date: career.start_date.split('T')[0],
            end_date: career.end_date ? career.end_date.split('T')[0] : '',
            is_active: career.is_active,
        });
        careerForm.clearErrors();
        setIsCareerModalOpen(true);
    };

    const handleCareerSubmit = (e) => {
        e.preventDefault();
        const routeName = isCareerEditing ? route('careers.update', selectedCareerId) : route('careers.store');
        careerForm.post(routeName, { onSuccess: () => setIsCareerModalOpen(false) });
    };

    const handleCareerDelete = (id) => {
        if (confirm('Hapus karir ini? Semua aktivitas di dalamnya akan ikut terhapus.')) {
            router.delete(route('careers.destroy', id));
        }
    };

    const handleCareerDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = careers.findIndex(c => c.id === active.id);
            const newIndex = careers.findIndex(c => c.id === over.id);
            const newOrder = arrayMove(careers, oldIndex, newIndex);
            router.post(route('careers.update-order'), { orders: newOrder.map(c => c.id) }, { preserveScroll: true });
        }
    };

    // ================= HANDLING AKTIVITAS =================
    const openActivityModal = (career) => {
        setCurrentCareer(career);
        actForm.reset();
        setIsActEditing(false);
        setIsActModalOpen(true);
    };

    const handleActSubmit = (e) => {
        e.preventDefault();
        const routeName = isActEditing 
            ? route('careers.activities.update', selectedActId) 
            : route('careers.activities.store', currentCareer.id);

        actForm.post(routeName, {
            preserveScroll: true,
            onSuccess: () => { actForm.reset(); setIsActEditing(false); }
        });
    };

    const editActivity = (act) => {
        setIsActEditing(true);
        setSelectedActId(act.id);
        actForm.setData({ name: act.name, description: act.description || '', is_active: act.is_active });
    };

    const deleteActivity = (id) => {
        if (confirm('Hapus aktivitas ini?')) router.delete(route('careers.activities.destroy', id), { preserveScroll: true });
    };

    const handleActDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = currentCareer.activities.findIndex(a => a.id === active.id);
            const newIndex = currentCareer.activities.findIndex(a => a.id === over.id);
            const newOrder = arrayMove(currentCareer.activities, oldIndex, newIndex);
            router.post(route('careers.activities.update-order'), { orders: newOrder.map(a => a.id) }, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Pengalaman Karir" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Pengalaman Karir</h1>
                    <p className="text-sm text-muted-foreground">Kelola riwayat pekerjaan dan aktivitas Anda.</p>
                </div>
                <Button onClick={openAddCareerModal}><Plus className="mr-2 h-4 w-4" /> Tambah Karir</Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCareerDragEnd}>
                <SortableContext items={careers} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {careers.map((career) => (
                            <SortableCareerItem 
                                key={career.id} career={career} openEditModal={openEditCareerModal} 
                                handleDelete={handleCareerDelete} openActivityModal={openActivityModal}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* MODAL FORM KARIR */}
            <Dialog open={isCareerModalOpen} onOpenChange={setIsCareerModalOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader><DialogTitle>{isCareerEditing ? 'Edit Karir' : 'Tambah Karir Baru'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleCareerSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Nama Pekerjaan / Posisi</Label>
                            <Input placeholder="Contoh: Frontend Developer" value={careerForm.data.job_title} onChange={e => careerForm.setData('job_title', e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nama Institusi / Perusahaan</Label>
                                <Input placeholder="Contoh: PT. Maju Bersama" value={careerForm.data.company_name} onChange={e => careerForm.setData('company_name', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Lokasi</Label>
                                <Input placeholder="Contoh: Bekasi Barat, Remote" value={careerForm.data.location} onChange={e => careerForm.setData('location', e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tanggal Mulai</Label>
                                <Input type="date" value={careerForm.data.start_date} onChange={e => careerForm.setData('start_date', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggal Selesai (Opsional)</Label>
                                <Input type="date" value={careerForm.data.end_date} onChange={e => careerForm.setData('end_date', e.target.value)} />
                                <span className="text-[10px] text-muted-foreground">Kosongkan jika masih bekerja di sini.</span>
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-lg bg-muted/50 border-border">
                            <input type="checkbox" className="accent-primary" checked={careerForm.data.is_active} onChange={e => careerForm.setData('is_active', e.target.checked)} />
                            Tampilkan di Portofolio
                        </label>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsCareerModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={careerForm.processing}>Simpan Data</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL MANAJEMEN AKTIVITAS (Menggunakan UI Baru) */}
            <Dialog open={isActModalOpen} onOpenChange={setIsActModalOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                    <DialogHeader className="p-6 pb-4 border-b border-border">
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <Briefcase className="text-primary h-5 w-5" />
                            Aktivitas: <span className="text-muted-foreground font-normal">{currentCareer?.company_name}</span>
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        <form onSubmit={handleActSubmit} className="bg-muted/30 p-5 rounded-xl border border-border/50 space-y-4 relative overflow-hidden">
                            <div className={`absolute left-0 top-0 w-1 h-full ${isActEditing ? 'bg-amber-500' : 'bg-primary'}`}></div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    {isActEditing ? 'Edit Aktivitas' : 'Tambah Aktivitas Baru'}
                                </h3>
                                {isActEditing && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Mode Edit</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggung Jawab / Aktivitas</Label>
                                <Input placeholder="Contoh: Mengembangkan UI, Memimpin Tim..." value={actForm.data.name} onChange={e => actForm.setData('name', e.target.value)} required className="bg-background" />
                            </div>
                            <div className="space-y-2">
                                <Label>Penjelasan Detail (Opsional)</Label>
                                <textarea className="w-full bg-background border border-input rounded-md p-3 text-sm h-20 focus:ring-2 focus:ring-ring focus:outline-none transition-shadow" value={actForm.data.description} onChange={e => actForm.setData('description', e.target.value)} placeholder="Tulis rincian teknis tugas tersebut..." />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                                    <input type="checkbox" className="rounded border-input accent-primary h-4 w-4" checked={actForm.data.is_active} onChange={e => actForm.setData('is_active', e.target.checked)} />
                                    Tampilkan di Portofolio
                                </label>
                                <div className="flex gap-2">
                                    {isActEditing && <Button type="button" variant="ghost" size="sm" onClick={() => { setIsActEditing(false); actForm.reset(); }}>Batal Edit</Button>}
                                    <Button className='rounded-lg' type="submit" size="sm" disabled={actForm.processing}>{isActEditing ? 'Simpan Perubahan' : 'Tambahkan'}</Button>
                                </div>
                            </div>
                        </form>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Daftar Aktivitas Tersimpan</h3>
                            {currentCareer?.activities?.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-xl text-muted-foreground bg-muted/20">
                                    <Briefcase className="h-8 w-8 mb-2 opacity-20" />
                                    <span className="text-sm">Belum ada aktivitas. Silakan tambahkan di atas.</span>
                                </div>
                            )}
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleActDragEnd}>
                                <SortableContext items={currentCareer?.activities || []} strategy={verticalListSortingStrategy}>
                                    <div className="flex flex-col gap-2.5">
                                        {currentCareer?.activities?.map(act => (
                                            <SortableCareerActivityItem key={act.id} activity={act} editActivity={editActivity} deleteActivity={deleteActivity} />
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