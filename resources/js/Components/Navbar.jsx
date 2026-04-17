import { usePage } from '@inertiajs/react'
import { useState, useRef, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { Moon, Sun, Menu, Bell, User, LogOut, Search, Clock, CheckCircle2, Activity, Loader2, ChevronRight } from 'lucide-react';
import { useTheme } from '@/Components/theme-provider';
import axios from 'axios'; 

export default function Navbar({ user }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchContainerRef = useRef(null);
    const { theme, setTheme } = useTheme();
    const [showNotif, setShowNotif] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) setShowSearchDropdown(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    useEffect(() => {        
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim().length > 0) {
                setIsSearching(true);
                setShowSearchDropdown(true);
                axios.get(`/api/search?q=${searchQuery}`)
                    .then(res => setSearchResults(res.data))
                    .catch(err => console.error("Error pencarian:", err))
                    .finally(() => setIsSearching(false));
            } else {
                setSearchResults([]);
                setShowSearchDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowSearchDropdown(false);
        router.get(route('admins.index'), { search: searchQuery }, { preserveState: true });
    };

    const { auth } = usePage().props;
    const notifications = auth.notifications || [];
    const unreadCount = notifications.filter(n => !n.isRead).length;    
    const markAllAsRead = () => {
        router.post(route('notifications.markRead'), {}, { preserveScroll: true });
    };

    return (
        <header className="h-16 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between px-4 md:px-6 shrink-0 relative z-40">            
            <div className="flex items-center flex-1 gap-4">
                <button className="md:hidden text-zinc-500 hover:text-zinc-900 transition-colors">
                    <Menu size={20} />
                </button>

                <div className="hidden sm:block relative w-full max-w-md" ref={searchContainerRef}>
                    <form onSubmit={handleSearchSubmit} className="relative group">
                        {isSearching ? (
                            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 animate-spin" />
                        ) : (
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                        )}
            
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                            placeholder="Cari admin, nama, atau email..." 
                            className="h-10 w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 px-10 py-2 text-sm shadow-sm transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/50"
                            autoComplete="off"
                        />
                    </form>
                
                    {showSearchDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                            {isSearching ? (
                                <div className="p-4 text-center text-sm text-zinc-500">Mencari data...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="py-2">
                                    <div className="px-4 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Hasil Admin
                                    </div>
                                    {searchResults.map((result) => (
                                        <button 
                                            key={result.id}
                                            onClick={() => {
                                                setShowSearchDropdown(false);                                                
                                                router.get(route('admins.index'), { search: result.name });
                                            }}
                                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border overflow-hidden flex items-center justify-center shrink-0">
                                                    {result.avatar ? (
                                                        <img src={`/storage/${result.avatar}`} className="w-full h-full object-cover" alt="avatar"/>
                                                    ) : (
                                                        <span className="text-xs font-medium text-zinc-600">{result.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-tight">{result.name}</p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{result.email}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-zinc-500">
                                    Tidak menemukan hasil untuk "<span className="font-medium text-zinc-900 dark:text-zinc-100">{searchQuery}</span>"
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-5 ml-4">                
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setShowNotif(!showNotif)}
                        className={`p-2 rounded-full transition-colors relative ${showNotif ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50'}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotif && (
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">Notifikasi & Aktivitas</h3>
                                <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                                    Tandai semua dibaca
                                </button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="flex flex-col">
                                        {notifications.map((notif) => (
                                            <div key={notif.id} className={`flex gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 cursor-pointer ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                                                <div className="mt-0.5">
                                                    {!notif.isRead ? (
                                                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                    ) : (
                                                        <CheckCircle2 size={14} className="text-zinc-400 mt-1" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className={`text-sm leading-snug ${!notif.isRead ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                        {notif.text}
                                                    </p>
                                                    <div className="flex items-center text-[11px] text-zinc-500 dark:text-zinc-500 font-medium">
                                                        <Clock size={10} className="mr-1" /> {notif.time}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-4 py-8 text-center text-sm text-zinc-500">Belum ada notifikasi baru.</div>
                                )}
                            </div>
                            <div className="border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50 p-2">
                            <Link 
                                href={route('logs.index')} 
                                className="flex items-center justify-center w-full py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
                            >
                                <Activity size={14} className="mr-2" />
                                Lacak Semua Log Aktivitas
                            </Link>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50 transition-colors relative"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>

                
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-none mb-1 truncate max-w-[120px]">{user.name}</span>
                        <span className="text-[11px] font-base text-zinc-500 dark:text-zinc-400 leading-none tracking-wider">Admin</span>
                    </div>
                    
                    <div className="relative group">
                        
                        <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden shadow-sm transition-all group-hover:border-zinc-400 dark:group-hover:border-zinc-500">
                            {user.avatar ? (
                                <img src={`/storage/${user.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-semibold text-sm text-zinc-600 dark:text-zinc-300">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        
                        
                        <div className="absolute top-10 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pt-2 z-50">
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg p-1.5 w-48 animate-in slide-in-from-top-2">
                                
                                <div className="sm:hidden px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
                                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                </div>
                                
                                <Link 
                                    href={route('profile.edit')} 
                                    className="flex items-center px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                                >
                                    <User size={16} className="mr-2" />
                                    Profil Saya
                                </Link>
                                <Link 
                                    href={route('logout')} 
                                    method="post" 
                                    as="button"
                                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors mt-1"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Keluar
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}