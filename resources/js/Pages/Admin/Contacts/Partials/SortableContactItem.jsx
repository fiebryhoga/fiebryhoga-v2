import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Camera, GitBranch, Briefcase, AtSign, Users, Mail, Phone, MessageCircle, PlaySquare, Globe, PenTool } from 'lucide-react';

export function SortableContactItem({ contact, openEditModal, handleDelete, toggleActive }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: contact.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.6 : 1,
    };

    const getIcon = (platform) => {
        const p = platform.toLowerCase();
        if (p.includes('instagram')) return <Camera size={20} className="text-pink-600" />;
        if (p.includes('github')) return <GitBranch size={20} className="text-zinc-800 dark:text-zinc-100" />;
        if (p.includes('linkedin')) return <Briefcase size={20} className="text-blue-600" />;
        if (p.includes('twitter') || p === 'x') return <AtSign size={20} className="text-zinc-900 dark:text-zinc-100" />;
        if (p.includes('facebook')) return <Users size={20} className="text-blue-500" />;
        if (p.includes('email') || p.includes('mail')) return <Mail size={20} className="text-red-500" />;
        if (p.includes('whatsapp') || p.includes('wa')) return <MessageCircle size={20} className="text-green-500" />;
        if (p.includes('phone') || p.includes('telepon')) return <Phone size={20} className="text-teal-500" />;
        if (p.includes('youtube')) return <PlaySquare size={20} className="text-red-600" />;
        if (p.includes('medium')) return <PenTool size={20} className="text-zinc-900 dark:text-zinc-100" />;
        return <Globe size={20} className="text-primary" />;
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`flex items-center gap-4 p-4 rounded-xl border bg-card transition-all duration-200 ${contact.is_active ? 'border-border shadow-sm' : 'border-dashed border-border/50 opacity-70 bg-muted/20'}`}
        >
            {/* Handle Drag */}
            <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground shrink-0">
                <GripVertical size={20} />
            </button>
            
            {/* Ikon Platform */}
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0 border border-border shadow-sm">
                {getIcon(contact.platform)}
            </div>

            {/* Info Kontak */}
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm leading-tight text-foreground truncate">{contact.platform}</h3>
                <p className="text-xs text-muted-foreground truncate">{contact.value}</p>
            </div>

            {/* Aksi: Toggle & Buttons */}
            <div className="flex items-center gap-3">
                {/* Switch Toggle On/Off */}
                <button 
                    onClick={() => toggleActive(contact)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${contact.is_active ? 'bg-primary' : 'bg-input'}`}
                >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-sm ring-0 transition duration-200 ease-in-out ${contact.is_active ? 'translate-x-2' : '-translate-x-2'}`} />
                </button>

                <div className="flex gap-1 border-l pl-3 border-border">
                    <button onClick={() => openEditModal(contact)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(contact.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}