import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Link2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableContactItem } from './Partials/SortableContactItem';

export default function Index({ contacts }) {
    // 1. STATE & SENSORS
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const { data, setData, post, processing, reset } = useForm({
        platform: '', value: '', url: '', is_active: true,
    });

    const platforms = [
        "Email", "WhatsApp", "Instagram", "LinkedIn", "GitHub", 
        "X / Twitter", "Facebook", "Medium", "YouTube", "Website", "Telepon"
    ];

    // 2. EFFECTS (Smart URL)
    useEffect(() => {
        if (data.value && !isEditing) {
            let autoUrl = "";
            const p = data.platform.toLowerCase();
            const val = data.value.trim().replace('@', ''); 
            
            if (p === 'email') autoUrl = `mailto:${val}`;
            else if (p === 'whatsapp') {
                let phone = val.replace(/\D/g, '');
                if (phone.startsWith('0')) phone = '62' + phone.substring(1);
                autoUrl = `https://wa.me/${phone}`;
            }
            else if (p === 'instagram') autoUrl = `https://instagram.com/${val}`;
            else if (p === 'github') autoUrl = `https://github.com/${val}`;
            else if (p === 'x / twitter') autoUrl = `https://x.com/${val}`;
            else if (p === 'linkedin') autoUrl = `https://linkedin.com/in/${val}`;
            else if (p === 'facebook') autoUrl = `https://facebook.com/${val}`;
            else if (p === 'youtube') autoUrl = `https://youtube.com/@${val}`;
            else if (p === 'medium') autoUrl = `https://medium.com/@${val}`;
            else if (p === 'telepon') autoUrl = `tel:${val}`;

            setData('url', autoUrl);
        }
    }, [data.platform, data.value]);

    // 3. SEMUA FUNGSI (Harus dideklarasikan sebelum Return)
    const openAddModal = () => {
        setIsEditing(false); 
        reset(); 
        setIsModalOpen(true);
    };

    const openEditModal = (contact) => {
        setIsEditing(true); 
        setSelectedId(contact.id);
        setData({
            platform: contact.platform, 
            value: contact.value,
            url: contact.url || '', 
            is_active: contact.is_active,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Hapus kontak ini?')) {
            router.delete(route('contacts.destroy', id), { preserveScroll: true });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEditing ? route('contacts.update', selectedId) : route('contacts.store');
        post(routeName, { onSuccess: () => setIsModalOpen(false) });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = contacts.findIndex(c => c.id === active.id);
            const newIndex = contacts.findIndex(c => c.id === over.id);
            const newOrder = arrayMove(contacts, oldIndex, newIndex);
            router.post(route('contacts.update-order'), { orders: newOrder.map(c => c.id) }, { preserveScroll: true });
        }
    };

    const toggleActive = (contact) => {
        router.post(route('contacts.update', contact.id), {
            _method: 'put',
            platform: contact.platform,
            value: contact.value,
            url: contact.url || '',
            is_active: !contact.is_active 
        }, { 
            preserveScroll: true
        });
    };

    // 4. RETURN JSX RENDERING
    return (
        <AdminLayout>
            <Head title="Kontak & Sosial Media" />

            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Sosial Media & Kontak</h1>
                    <p className="text-sm text-muted-foreground">Atur urutan dan visibilitas tautan untuk pengunjung Anda.</p>
                </div>
                <Button onClick={openAddModal}><Plus className="mr-2 h-4 w-4" /> Tambah Kontak</Button>
            </div>

            <div className="bg-muted/30 p-5 rounded-2xl border border-border min-h-[400px]">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={contacts} strategy={verticalListSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {contacts.map((contact) => (
                                <SortableContactItem 
                                    key={contact.id} 
                                    contact={contact} 
                                    openEditModal={openEditModal} 
                                    handleDelete={handleDelete}
                                    toggleActive={toggleActive}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
                
                {contacts.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
                        <Link2 className="h-10 w-10 mb-3 opacity-20" />
                        <p>Belum ada link sosial media. Tambahkan sekarang!</p>
                    </div>
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="border-b border-border pb-4">
                        <DialogTitle>{isEditing ? 'Edit Kontak' : 'Tambah Kontak Baru'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                        <div className="space-y-2">
                            <Label>Jenis Platform</Label>
                            <select 
                                className="w-full bg-background border border-input rounded-md px-3 h-10 text-sm focus:ring-2 focus:ring-ring focus:outline-none" 
                                value={data.platform} onChange={e => setData('platform', e.target.value)} required
                            >
                                <option value="" disabled>Pilih Platform...</option>
                                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                                <option value="Lainnya">Lainnya...</option>
                            </select>
                        </div>

                        {data.platform === 'Lainnya' && (
                            <div className="space-y-2">
                                <Label>Ketik Nama Platform</Label>
                                <Input placeholder="Contoh: Discord, Telegram..." onChange={e => setData('platform', e.target.value)} required />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Username / Nomor / Email</Label>
                            <Input placeholder="Contoh: fiebryhoga atau 081234..." value={data.value} onChange={e => setData('value', e.target.value)} required />
                        </div>

                        <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <Label className="text-primary flex items-center gap-2"><Link2 size={14}/> Tautan URL Tujuan</Label>
                            <Input type="url" placeholder="https://..." value={data.url} onChange={e => setData('url', e.target.value)} />
                            <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                                Tautan akan dibuat otomatis jika Anda memasukkan Username/Nomor di atas. Anda juga bisa mengeditnya manual jika kurang pas.
                            </p>
                        </div>

                        {/* TOGGLE ON/OFF MODERN DI FORM (Opsional tapi rapi) */}
                        <div className="flex items-center justify-between pt-1 pb-2">
                            <div className="flex flex-col">
                                <Label className="text-sm font-semibold cursor-pointer" onClick={() => setData('is_active', !data.is_active)}>
                                    Tampilkan di Portofolio
                                </Label>
                                <span className="text-[10px] text-muted-foreground mt-0.5">
                                    {data.is_active ? 'Kontak ini akan terlihat oleh publik.' : 'Kontak ini disembunyikan.'}
                                </span>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setData('is_active', !data.is_active)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.is_active ? 'bg-primary' : 'bg-input'}`}
                            >
                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-sm ring-0 transition duration-200 ease-in-out ${data.is_active ? 'translate-x-2' : '-translate-x-2'}`} />
                            </button>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan Kontak</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}