import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2 } from 'lucide-react';

export function SortableCareerActivityItem({ activity, editActivity, deleteActivity }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-start gap-3 p-3 rounded-lg border bg-background ${activity.is_active ? 'border-border' : 'border-dashed border-border/50 opacity-75'}`}>
            <button {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                <GripVertical size={16} />
            </button>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">{activity.name}</h4>
                    {!activity.is_active && <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">Hidden</span>}
                </div>
                {activity.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>}
            </div>
            <div className="flex flex-col gap-1 shrink-0">
                <button type="button" onClick={() => editActivity(activity)} className="p-1 text-muted-foreground hover:text-primary"><Edit size={14} /></button>
                <button type="button" onClick={() => deleteActivity(activity.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            </div>
        </div>
    );
}