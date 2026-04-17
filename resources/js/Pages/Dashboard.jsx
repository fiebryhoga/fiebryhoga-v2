import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export default function Dashboard() {
    return (
        <AdminLayout>
            <Head title="Dashboard" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Ringkasan aktivitas portofolio Anda.</p>
            </div>

            {/* Contoh Grid Statistik menggunakan shadcn Card */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Proyek</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-zinc-500"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-zinc-500">+2 proyek bulan ini</p>
                    </CardContent>
                </Card>
                
                {/* Anda bisa menambahkan card lain di sini */}
            </div>
        </AdminLayout>
    );
}