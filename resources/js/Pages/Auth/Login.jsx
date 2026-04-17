import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="relative h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 overflow-hidden px-4">
            <Head title="Log in" />

            {/* Tombol Kembali di Kiri Atas */}
            <Link 
                href="/" 
                className="absolute top-6 left-6 flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
            </Link>

            <Card className="w-full max-w-[400px] border-zinc-200/60 shadow-xl dark:border-zinc-800">
                <CardHeader className="space-y-2 text-center pb-6">
                    <div className="w-12 h-12 bg-zinc-900 text-zinc-50 rounded-xl flex items-center justify-center mx-auto mb-2 dark:bg-zinc-50 dark:text-zinc-900">
                        {/* Placeholder Logo Modern */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    </div>
                    <CardTitle className="text-2xl font-semibold tracking-tight">Selamat Datang</CardTitle>
                    <CardDescription className="text-zinc-500">
                        Masuk ke dashboard admin portofolio
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}
                    
                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-2.5">
                            <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="nama@email.com"
                                className={`bg-white dark:bg-zinc-900 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Password</Label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                                    >
                                        Lupa password?
                                    </Link>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                className={`bg-white dark:bg-zinc-900 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                            <input
                                type="checkbox"
                                name="remember"
                                id="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
                            />
                            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-zinc-600 dark:text-zinc-400">Ingat sesi saya</Label>
                        </div>

                        <Button className="w-full mt-2" type="submit" disabled={processing}>
                            {processing ? 'Memverifikasi...' : 'Masuk'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}