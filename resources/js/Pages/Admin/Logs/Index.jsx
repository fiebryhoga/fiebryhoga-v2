import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { User, Globe, Monitor, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import UserAgentModal from './Partials/UserAgentModal'; // Import Modal

export default function Index({ logs }) {
    // State untuk mengontrol Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserAgent, setSelectedUserAgent] = useState('');

    // Fungsi membuka modal dengan data spesifik
    const openModal = (userAgent) => {
        setSelectedUserAgent(userAgent);
        setIsModalOpen(true);
    };

    // Fungsi untuk merender ikon dinamis berdasarkan tipe log
    const TypeIcon = ({ type }) => {
        if (type === 'success') return <CheckCircle size={16} />;
        if (type === 'warning' || type === 'danger') return <AlertTriangle size={16} />;
        return <Info size={16} />;
    };

    return (
        <AdminLayout>
            <Head title="Log Aktivitas" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Log Aktivitas Sistem</h1>
                <p className="text-sm text-zinc-500">Rekaman semua perubahan yang terjadi di panel admin.</p>
            </div>

            <div className="space-y-4">
                {logs.data.map((log) => (
                    <div key={log.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                            
                            <div className="flex items-start gap-4">
                                {/* Grup Avatar & Ikon Tipe (Digabung agar lebih rapi) */}
                                <div className="relative shrink-0 mt-1">
                                    <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 overflow-hidden flex items-center justify-center">
                                        {log.user?.avatar ? (
                                            <img src={`/storage/${log.user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-semibold text-zinc-500">{log.user?.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    
                                    {/* Badge Status menggantikan ikon jam raksasa */}
                                    <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                                        log.type === 'success' ? 'bg-green-500 text-white' :
                                        log.type === 'warning' ? 'bg-amber-500 text-white' :
                                        log.type === 'danger' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                                    }`}>
                                        <TypeIcon type={log.type} />
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{log.description}</p>
                                    
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1.5"><User size={14}/> {log.user?.name}</span>
                                        <span className="flex items-center gap-1.5"><Globe size={14}/> {log.ip_address}</span>
                                        
                                        {/* Bagian User Agent yang di-truncate + Tombol Modal */}
                                        <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-md">
                                            <Monitor size={14}/> 
                                            <span className="truncate max-w-[120px] sm:max-w-[200px] inline-block">
                                                {log.user_agent}
                                            </span>
                                            <button 
                                                onClick={() => openModal(log.user_agent)}
                                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium ml-1"
                                            >
                                                Lihat
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <span className="text-xs font-medium text-zinc-400 whitespace-nowrap mt-1 shrink-0">
                                {new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Navigasi Paginate */}
            <div className="mt-6 flex justify-center gap-2">
                {logs.links.map((link, i) => (
                    <button 
                        key={i}
                        onClick={() => window.location.href = link.url}
                        disabled={!link.url || link.active}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            link.active ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900' : 'bg-white dark:bg-zinc-900 border dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>

            {/* Panggil Modal Component di Sini */}
            <UserAgentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                userAgent={selectedUserAgent} 
            />

        </AdminLayout>
    );
}