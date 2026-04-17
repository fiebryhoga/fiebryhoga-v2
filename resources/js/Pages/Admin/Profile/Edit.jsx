import { useState, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Calendar, Camera, ShieldCheck, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

export default function Edit({ user }) {
    const fileInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(user.avatar ? `/storage/${user.avatar}` : null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        birth_date: user.birth_date || '',
        gender: user.gender || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: null,
        password: '',
        password_confirmation: '',
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // Bisa tambahkan toast atau notifikasi sukses di sini
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Profil Saya" />

            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Pengaturan Profil</h1>
                    <p className="text-zinc-500">Kelola informasi publik dan keamanan akun Anda.</p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* Kolom Kiri: Foto & Ringkasan */}
                        <div className="space-y-6">
                            <Card className="border-zinc-200/80 pt-0 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="h-24 bg-zinc-900 dark:bg-zinc-800 w-full" />
                                <CardContent className="pt-0 -mt-12 text-center">
                                    <div className="relative inline-block group">
                                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900 bg-white overflow-hidden shadow-md">
                                            {photoPreview ? (
                                                <img src={photoPreview} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-zinc-400">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            className="absolute bottom-0 right-0 p-1.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Camera size={14} />
                                        </button>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                    </div>
                                    <h3 className="mt-4 font-bold text-lg">{user.name}</h3>
                                    <p className="text-sm text-zinc-500">{user.email}</p>
                                    <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                                        Administrator
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                                <p className="text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
                                    <ShieldCheck size={16} className="shrink-0" />
                                    Informasi ini digunakan untuk keperluan identitas dalam sistem log aktivitas.
                                </p>
                            </div>
                        </div>

                        {/* Kolom Kanan: Form Detail */}
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Informasi Dasar</CardTitle>
                                    <CardDescription>Detail yang akan muncul di navbar dan profil.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nama Lengkap</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                                <Input className="pl-9" value={data.name} onChange={e => setData('name', e.target.value)} />
                                            </div>
                                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                                <Input className="pl-9" type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                                            </div>
                                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>No. Telepon</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                                <Input className="pl-9" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tanggal Lahir</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                                <Input className="pl-9" type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Alamat</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                            <textarea 
                                                className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-9 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950"
                                                value={data.address}
                                                onChange={e => setData('address', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Ubah Kata Sandi</CardTitle>
                                    <CardDescription>Biarkan kosong jika Anda tidak ingin mengubahnya.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Kata Sandi Baru</Label>
                                            <Input type="password" value={data.password} onChange={e => setData('password', e.target.value)} />
                                            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Konfirmasi Kata Sandi</Label>
                                            <Input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-end gap-4">
                                {recentlySuccessful && (
                                    <p className="text-sm text-green-600 animate-in fade-in slide-in-from-right-2">Profil berhasil disimpan!</p>
                                )}
                                <Button type="submit" disabled={processing} className="rounded-xl px-8 shadow-md">
                                    {processing ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                                    ) : (
                                        <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}