import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, CalendarDays, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export function SortableEducationItem({ education, openEditModal, handleDelete, openActivityModal }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: education.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.6 : 1,
        scale: isDragging ? 1.02 : 1,
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sekarang';
        return new Date(dateString).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={`bg-card text-card-foreground border ${education.is_active ? 'border-border' : 'border-dashed border-border/50 opacity-80'} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col relative`}
        >
            <div className="flex justify-between items-start mb-2 gap-2">
                <div className="flex items-start gap-3">
                    <button {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                        <GripVertical size={20} />
                    </button>
                    <div>
                        <h3 className="font-bold text-lg leading-tight text-foreground">{education.institution_name}</h3>
                        <p className="text-sm font-medium text-primary mt-0.5">{education.degree} - {education.field_of_study}</p>
                    </div>
                </div>
            </div>

            <div className="pl-8 mb-4 flex items-center gap-2">
                <span className="text-[10px] flex items-center text-muted-foreground bg-muted w-fit px-2 py-1 rounded-md border border-border/50">
                    <CalendarDays size={12} className="mr-1" />
                    {formatDate(education.start_date)} - {formatDate(education.end_date)}
                </span>
                {education.is_active ? (
                    <span className="text-[10px] flex items-center text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md"><CheckCircle size={12} className="mr-1"/> Ditampilkan</span>
                ) : (
                    <span className="text-[10px] flex items-center text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md"><XCircle size={12} className="mr-1"/> Disembunyikan</span>
                )}
            </div>

            {/* Actions */}
            <div className="mt-auto flex items-center justify-between border-t border-border pt-4 pl-8">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs bg-secondary/50"
                    onClick={() => openActivityModal(education)}
                >
                    <Activity size={14} className="mr-2 text-primary" /> 
                    Kelola Aktivitas ({education.activities?.length || 0})
                </Button>

                <div className="flex gap-1">
                    <button onClick={() => openEditModal(education)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(education.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}