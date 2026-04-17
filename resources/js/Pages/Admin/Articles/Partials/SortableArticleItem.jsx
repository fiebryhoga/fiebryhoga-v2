import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Eye, CalendarDays, User as UserIcon } from 'lucide-react';

export function SortableArticleItem({ article, openEditModal, handleDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: article.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.6 : 1,
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div ref={setNodeRef} style={style} className={`flex items-start gap-4 p-4 rounded-xl border bg-card ${article.is_active ? 'border-border' : 'border-dashed border-border/50 opacity-75'}`}>
            <button {...attributes} {...listeners} className="mt-2 cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical size={20} />
            </button>
            
            {/* Thumbnail */}
            <div className="w-24 h-24 rounded-lg bg-muted border border-border overflow-hidden shrink-0 hidden sm:block">
                {article.thumbnail ? (
                    <img src={`/storage/${article.thumbnail}`} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-1">{article.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center"><UserIcon size={12} className="mr-1"/> {article.author?.name}</span>
                    <span className="flex items-center"><CalendarDays size={12} className="mr-1"/> {formatDate(article.published_at)}</span>
                    <span className="flex items-center text-primary"><Eye size={12} className="mr-1"/> {article.views} Kali Dilihat</span>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags?.map((tag, i) => (
                        <span key={i} className="text-[9px] bg-secondary px-2 py-0.5 rounded border border-border">#{tag}</span>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => openEditModal(article)} className="p-2 bg-secondary rounded-md text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"><Edit size={16} /></button>
                <button onClick={() => handleDelete(article.id)} className="p-2 bg-secondary rounded-md text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"><Trash2 size={16} /></button>
            </div>
        </div>
    );
}