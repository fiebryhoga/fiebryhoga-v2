import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Folder } from 'lucide-react';

export default function ParentSelector({ options, value, onChange, placeholder = "-- Luar (Root) --", icon: Icon = Folder }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // Menutup dropdown saat klik di luar area
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.id == value);

    return (
        <div className="relative w-full" ref={ref}>
            {/* Tombol Utama */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between rounded-md border bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm cursor-pointer transition-all ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-400'}`}
            >
                <div className="flex items-center gap-2 truncate">
                    <Icon size={16} className={selectedOption ? 'text-blue-500' : 'text-zinc-400'} />
                    <span className={selectedOption ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-500"}>
                        {selectedOption ? selectedOption.name : placeholder}
                    </span>
                </div>
                <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* List Pilihan */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95">
                    
                    {/* Opsi Root (Tanpa Induk) */}
                    <div 
                        onClick={() => { onChange(''); setIsOpen(false); }}
                        className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors ${value === '' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                        <Icon size={14} className={value === '' ? 'opacity-100' : 'opacity-40'} />
                        <span>{placeholder}</span>
                        {value === '' && <Check size={14} className="ml-auto" />}
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>

                    {/* Opsi Folder Anak */}
                    {options.map(opt => (
                        <div 
                            key={opt.id} 
                            onClick={() => { onChange(opt.id); setIsOpen(false); }}
                            className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors ${value === opt.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                            <span className="opacity-30">{opt.depthIndicator}</span>
                            <Icon size={14} className={value === opt.id ? 'opacity-100' : 'opacity-40'} />
                            <span className="truncate">{opt.cleanName}</span>
                            {value === opt.id && <Check size={14} className="ml-auto shrink-0" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}