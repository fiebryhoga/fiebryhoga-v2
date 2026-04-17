import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';

export function SortableTechItem({ tech, openEditModal, handleDelete, toggleActive }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: tech.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.6 : 1,
        scale: isDragging ? 1.02 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden"
        >
            {/* Status Bar Atas */}
            <div className={`absolute top-0 left-0 w-full h-1 ${tech.is_active ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>

            <div className="flex justify-between items-start mb-4 mt-1">
                <div className="flex items-center gap-3">
                    {/* Handle Drag */}
                    <button 
                        {...attributes} 
                        {...listeners} 
                        className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-600 dark:text-zinc-700 dark:hover:text-zinc-400 transition-colors"
                    >
                        <GripVertical size={20} />
                    </button>

                    {/* Logo */}
                    <div className="w-12 h-12 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-2 shadow-sm">
                        {tech.image ? (
                            <img src={`/storage/${tech.image}`} alt={tech.name} className="w-full h-full object-contain" />
                        ) : (
                            <ImageIcon className="text-zinc-400" size={20} />
                        )}
                    </div>
                </div>
                
                {/* Toggle Switch */}
                <button 
                    onClick={() => toggleActive(tech)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
                    ${tech.is_active ? 'bg-zinc-900 dark:bg-zinc-50' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${tech.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
            </div>

            {/* Info Teks */}
            <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{tech.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                    {tech.type}
                </span>
            </div>

            {/* Aksi Bawah */}
            <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center text-[11px] text-zinc-500 font-medium">
                    {tech.is_active ? (
                        <span className="flex items-center text-green-600 dark:text-green-400"><CheckCircle size={12} className="mr-1" /> Active</span>
                    ) : (
                        <span className="flex items-center text-zinc-400"><XCircle size={12} className="mr-1" /> Hidden</span>
                    )}
                </div>
                <div className="flex gap-1">
                    <button onClick={() => openEditModal(tech)} className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(tech.id)} className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}