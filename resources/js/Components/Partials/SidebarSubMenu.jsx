import { Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, ChevronDown, ChevronRight, MoveRight, AlertOctagon, Plus } from 'lucide-react';

export default function SidebarSubMenu({ item, currentFilter, isSidebarOpen, onOpenModal, config }) {
    const checkIfActive = (node, activeId) => {
        if (!activeId) return false;
        if (node.id == activeId) return true;
        if (node.children && node.children.length > 0) return node.children.some(c => checkIfActive(c, activeId));
        return false;
    };

    const shouldBeOpen = checkIfActive(item, currentFilter?.[config.idKey]);
    const [isOpen, setIsOpen] = useState(shouldBeOpen);
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);

    const isActive = currentFilter?.[config.idKey] == item.id;
    const hasChildren = item.children && item.children.length > 0;

    useEffect(() => { if (shouldBeOpen) setIsOpen(true); }, [shouldBeOpen]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) setShowOptions(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isSidebarOpen) return null;

    return (
        <div className="flex flex-col w-full">
            <div className={`group flex items-center justify-between py-1.5 px-2 rounded-md transition-all mb-0.2 relative ${isActive ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'}`}>
                
                <Link href={route(config.route, { [config.idKey]: item.id })} className="flex items-center flex-1 overflow-hidden py-1">
                    <config.icon size={14} className={`mr-2 shrink-0 ${isActive ? 'fill-zinc-900 dark:fill-zinc-50' : 'fill-zinc-300 dark:fill-zinc-600'}`} />
                    <span className="text-xs truncate">{item.name}</span>
                </Link>

                <div className={`flex items-center gap-0.5 transition-opacity ${showOptions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="relative" ref={optionsRef}>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(!showOptions); }} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-colors">
                            <MoreVertical size={14} />
                        </button>
                        
                        {showOptions && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95">
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(false); onOpenModal('createSub', item, config.entity); setIsOpen(true); }} className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center transition-colors font-medium text-blue-600 dark:text-blue-400">
                                    <Plus size={12} className="mr-2"/> Tambah Sub-{config.label}
                                </button>
                                <div className="h-px bg-zinc-100 dark:bg-zinc-700 my-1"></div>

                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(false); onOpenModal('rename', item, config.entity); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center transition-colors">
                                    <Edit size={12} className="mr-2"/> Ganti Nama
                                </button>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(false); onOpenModal('move', item, config.entity); }} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center transition-colors">
                                    <MoveRight size={12} className="mr-2"/> Pindahkan Posisi
                                </button>
                                <div className="h-px bg-zinc-100 dark:bg-zinc-700 my-1"></div>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(false); onOpenModal('delete', item, config.entity); }} className="w-full text-left px-3 py-2 text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 flex items-center transition-colors">
                                    <Trash2 size={12} className="mr-2"/> Hapus Folder
                                </button>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOptions(false); onOpenModal('deleteAll', item, config.entity); }} className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center transition-colors font-semibold">
                                    <AlertOctagon size={12} className="mr-2"/> Kosongkan Isi
                                </button>
                            </div>
                        )}
                    </div>

                    {hasChildren && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-colors">
                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Anak Folder & Garis Hierarki */}
            {hasChildren && isOpen && (
                <div className="flex flex-col mt-0.5 ml-3 pl-2.5 border-l border-black/20 dark:border-white/20">
                    {item.children.map(child => (
                        <SidebarSubMenu key={child.id} item={child} currentFilter={currentFilter} isSidebarOpen={isSidebarOpen} onOpenModal={onOpenModal} config={config} />
                    ))}
                </div>
            )}
        </div>
    );
}