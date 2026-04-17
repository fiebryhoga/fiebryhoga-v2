import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

// DND Kit Imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableProjectItem } from './Partials/SortableProjectItem';

export default function Index({ projects, availableTechStacks }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        type: '',
        repository_url: '',
        live_url: '',
        displayed_link: 'none',
        start_date: '',
        end_date: '',
        is_active: true,
        tech_stacks: [], 
    });

    const openAddModal = () => {
        setIsEditing(false);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (project) => {
        setIsEditing(true);
        setSelectedId(project.id);
        setData({
            name: project.name,
            description: project.description || '',
            type: project.type,
            repository_url: project.repository_url || '',
            live_url: project.live_url || '',
            displayed_link: project.displayed_link,
            start_date: project.start_date ? project.start_date.split('T')[0] : '',
            end_date: project.end_date ? project.end_date.split('T')[0] : '',
            is_active: project.is_active,
            tech_stacks: project.tech_stacks ? project.tech_stacks.map(t => t.id) : [],
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleTechToggle = (id) => {
        const current = [...data.tech_stacks];
        const index = current.indexOf(id);
        if (index > -1) current.splice(index, 1);
        else current.push(id);
        setData('tech_stacks', current);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEditing ? route('projects.update', selectedId) : route('projects.store');
        post(routeName, {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus project ini?')) {
            router.delete(route('projects.destroy', id));
        }
    };

    // Handler untuk Drag & Drop
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = projects.findIndex((p) => p.id === active.id);
            const newIndex = projects.findIndex((p) => p.id === over.id);
            const newOrder = arrayMove(projects, oldIndex, newIndex);
            
            // Kirim urutan ID ke backend
            router.post(route('projects.update-order'), {
                orders: newOrder.map(p => p.id)
            }, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Projects" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Projects Management</h1>
                    <p className="text-sm text-muted-foreground">Geser ikon pada card untuk mengatur urutan tampilan.</p>
                </div>
                <Button onClick={openAddModal}><Plus className="mr-2 h-4 w-4" /> Add Project</Button>
            </div>

            {/* DndContext Wrapping Grid */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={projects} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projects.map((project) => (
                            <SortableProjectItem 
                                key={project.id} 
                                project={project} 
                                openEditModal={openEditModal}
                                handleDelete={handleDelete}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isEditing ? 'Edit Project' : 'New Project'}</DialogTitle></DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Project Name</Label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <select className="w-full bg-background border border-input rounded-md px-3 h-10 text-sm focus:ring-2 focus:ring-ring focus:outline-none" 
                                    value={data.type} onChange={e => setData('type', e.target.value)} required>
                                    <option value="">Select Type...</option>
                                    <option value="Web App">Web App</option>
                                    <option value="Landing Page">Landing Page</option>
                                    <option value="Mobile App">Mobile App</option>
                                    <option value="UI/UX Design">UI/UX Design</option>
                                </select>
                                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <textarea className="w-full bg-background border border-input rounded-md p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-ring focus:outline-none" 
                                value={data.description} onChange={e => setData('description', e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Repo URL</Label>
                                <Input type="url" placeholder="https://github.com/..." value={data.repository_url} onChange={e => setData('repository_url', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Live URL (Domain)</Label>
                                <Input type="url" placeholder="https://..." value={data.live_url} onChange={e => setData('live_url', e.target.value)} />
                            </div>
                        </div>

                        {/* FITUR PILIHAN LINK TAMPILAN */}
                        <div className="p-3 bg-muted/50 rounded-lg space-y-3 border border-border">
                            <Label className="text-[11px] uppercase font-bold text-muted-foreground">Link Utama (Ditampilkan di Landing Page)</Label>
                            <div className="flex gap-5">
                                <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                                    <input type="radio" name="displayed_link" value="repository" checked={data.displayed_link === 'repository'} onChange={e => setData('displayed_link', e.target.value)} className="accent-primary" />
                                    Repository
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                                    <input type="radio" name="displayed_link" value="live_url" checked={data.displayed_link === 'live_url'} onChange={e => setData('displayed_link', e.target.value)} className="accent-primary" />
                                    Live Web
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                                    <input type="radio" name="displayed_link" value="none" checked={data.displayed_link === 'none'} onChange={e => setData('displayed_link', e.target.value)} className="accent-primary" />
                                    None
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date (Optional)</Label>
                                <Input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                            </div>
                        </div>

                        {/* FITUR PILIHAN TECH STACK */}
                        <div className="space-y-2">
                            <Label>Tech Stacks Used</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-border rounded-md p-3 max-h-40 overflow-y-auto bg-background">
                                {availableTechStacks.map(ts => (
                                    <label key={ts.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted p-1.5 rounded transition-colors">
                                        <input type="checkbox" className="rounded border-input accent-primary" checked={data.tech_stacks.includes(ts.id)} onChange={() => handleTechToggle(ts.id)} />
                                        {ts.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-5 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{isEditing ? 'Save Changes' : 'Add Project'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}