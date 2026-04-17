import { useState, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { UserPlus, Search, Edit, Trash2, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

export default function Index({ admins }) {
    // State untuk mengontrol Modal Dialog
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Setup Form Inertia
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        birth_date: '',
        gender: '',
        phone: '',
        address: '',
        avatar: null,
    });

    // Buka Modal Tambah
    const openAddModal = () => {
        setIsEditing(false);
        setPhotoPreview(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    // Buka Modal Edit
    const openEditModal = (admin) => {
        setIsEditing(true);
        setSelectedId(admin.id);
        setPhotoPreview(admin.avatar ? `/storage/${admin.avatar}` : null);
        setData({
            name: admin.name,
            email: admin.email,
            password: '', // Kosongkan agar tidak berubah jika tidak diisi
            birth_date: admin.birth_date || '',
            gender: admin.gender || '',
            phone: admin.phone || '',
            address: admin.address || '',
            avatar: null,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    // Handle Upload File & Preview
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    // Eksekusi Submit (Bisa Tambah / Edit)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            post(route('admins.update', selectedId), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('admins.store'), {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    // Eksekusi Hapus
    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus admin ini?')) {
            router.delete(route('admins.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Admin" />

            {/* Header & Tombol Tambah */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Manajemen Admin</h1>
                    <p className="text-sm text-zinc-500">Kelola data administrator sistem portofolio Anda.</p>
                </div>
                <Button onClick={openAddModal}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Tambah Admin
                </Button>
            </div>

            {/* Tabel */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-500 font-medium border-b border-zinc-200/80 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Profil</th>
                                <th className="px-6 py-4">Kontak</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                            {admins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-50 border flex items-center justify-center font-semibold text-zinc-600">
                                                {admin.avatar ? (
                                                    <img src={`/storage/${admin.avatar}`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    admin.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-zinc-900 dark:text-zinc-100">{admin.name}</div>
                                                <div className="text-xs text-zinc-500">{admin.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                                        {admin.phone || '-'}<br/>
                                        <span className="text-xs text-zinc-400">{admin.gender === 'L' ? 'Laki-laki' : admin.gender === 'P' ? 'Perempuan' : ''}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openEditModal(admin)} className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(admin.id)} className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors ml-2">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Dialog Form */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Data Admin' : 'Tambah Admin Baru'}</DialogTitle>
                    <DialogDescription className="hidden">
                        Isi formulir ini untuk menambah atau mengubah data administrator.
                    </DialogDescription>
                </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        {/* Area Upload Foto */}
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 overflow-hidden group">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload className="w-8 h-8 text-zinc-400" />
                                )}
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <span className="text-xs text-white font-medium">Ubah Foto</span>
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            {errors.avatar && <span className="text-xs text-red-500">{errors.avatar}</span>}
                        </div>

                        {/* Grid Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nama Lengkap</Label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Password {isEditing && <span className="text-zinc-400 text-xs">(Kosongkan jika tak diubah)</span>}</Label>
                                <Input type="password" value={data.password} onChange={e => setData('password', e.target.value)} required={!isEditing} />
                                {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>No. Telepon</Label>
                                <Input value={data.phone} onChange={e => setData('phone', e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Tanggal Lahir</Label>
                                <Input type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Jenis Kelamin</Label>
                                <select 
                                    value={data.gender} 
                                    onChange={e => setData('gender', e.target.value)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                                >
                                    <option value="">Pilih Gender</option>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Alamat Lengkap</Label>
                                <Input value={data.address} onChange={e => setData('address', e.target.value)} />
                            </div>
                        </div>

                        {/* Tombol Simpan */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan Data'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

        </AdminLayout>
    );
}