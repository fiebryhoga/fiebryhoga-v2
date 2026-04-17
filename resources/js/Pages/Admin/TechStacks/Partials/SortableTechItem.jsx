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
            
            className={`bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden ${tech.is_active ? 'bg-card' : 'bg-card/10'}`}>

            <div className="flex justify-between items-start mb-4 mt-1">
                <div className="flex items-center gap-3">
                    
                    <button 
                        {...attributes} 
                        {...listeners} 
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <GripVertical size={20} />
                    </button>

                    
                    <div className="w-12 h-12 rounded-xl border border-border bg-background flex items-center justify-center p-2 shadow-sm">
                        {tech.image ? (
                            <img src={`/storage/${tech.image}`} alt={tech.name} className="w-full h-full object-contain" />
                        ) : (
                            <ImageIcon className="text-muted-foreground" size={20} />
                        )}
                    </div>
                </div>
                
                
                <button 
                    onClick={() => toggleActive(tech)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
                    ${tech.is_active ? 'bg-primary' : 'bg-input'}`}
                >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${tech.is_active ? 'translate-x-2' : '-translate-x-2'}`} />
                </button>
            </div>

            
            <div className="flex-1">
                <h3 className="font-semibold text-foreground">{tech.name}</h3>
                <span className="inline-block mt-1 py-0.5 rounded-md font-normal text-[10px] font-bold capitalize tracking-wider text-secondary-foreground">
                    {tech.type}
                </span>
            </div>

            
            <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center text-[11px] font-medium">
                    {tech.is_active ? (
                        <span className="flex items-center text-primary"><CheckCircle size={12} className="mr-1" /> Active</span>
                    ) : (
                        <span className="flex items-center text-muted-foreground"><XCircle size={12} className="mr-1" /> Hidden</span>
                    )}
                </div>
                <div className="flex gap-1">
                    <button onClick={() => openEditModal(tech)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(tech.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}