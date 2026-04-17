import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, GitBranch, ExternalLink, CalendarDays } from 'lucide-react';

export function SortableProjectItem({ project, openEditModal, handleDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.6 : 1,
        scale: isDragging ? 1.02 : 1,
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Present';
        return new Date(dateString).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col relative"
        >
            {/* Header: Drag Handle, Title, Actions */}
            <div className="flex justify-between items-start mb-3 gap-2">
                <div className="flex items-start gap-3">
                    <button 
                        {...attributes} 
                        {...listeners} 
                        className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <GripVertical size={20} />
                    </button>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">{project.name}</h3>
                        <p className="text-xs text-primary mt-1 font-medium">{project.type}</p>
                    </div>
                </div>
                <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditModal(project)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 pl-8">
                {project.description || 'Tidak ada deskripsi.'}
            </p>

            {/* Date */}
            <div className="pl-8 mb-4">
                <span className="text-[10px] flex items-center text-muted-foreground bg-muted w-fit px-2 py-1 rounded-md border border-border/50">
                    <CalendarDays size={10} className="mr-1" />
                    {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </span>
            </div>

            {/* Tech Stack Badges */}
            <div className="flex flex-wrap gap-1.5 mb-5 pl-8">
                {project.tech_stacks && project.tech_stacks.length > 0 ? (
                    project.tech_stacks.map(ts => (
                        <span key={ts.id} className="text-[10px] bg-secondary px-2 py-0.5 rounded border border-border text-secondary-foreground">
                            {ts.name}
                        </span>
                    ))
                ) : (
                    <span className="text-[10px] text-muted-foreground italic">No tech stack</span>
                )}
            </div>

            {/* Footer Links */}
            <div className="mt-auto flex items-center gap-4 border-t border-border pt-4 pl-8">
                {project.repository_url && (
                    <a 
                        href={project.repository_url} target="_blank" rel="noopener noreferrer" 
                        className={`flex items-center gap-1.5 text-xs transition-colors hover:underline ${project.displayed_link === 'repository' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <GitBranch size={15} /> Repository
                    </a>
                )}
                {project.live_url && (
                    <a 
                        href={project.live_url} target="_blank" rel="noopener noreferrer" 
                        className={`flex items-center gap-1.5 text-xs transition-colors hover:underline ${project.displayed_link === 'live_url' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <ExternalLink size={15} /> Live Web
                    </a>
                )}
                {!project.repository_url && !project.live_url && (
                    <span className="text-xs text-muted-foreground italic">Tidak ada tautan</span>
                )}
            </div>
        </div>
    );
}