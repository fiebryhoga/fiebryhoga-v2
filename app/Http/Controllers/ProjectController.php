<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\TechStack;
use App\Notifications\SystemActivity;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProjectController extends Controller
{
    private function logActivity($description, $type = 'info')
    {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'description' => $description,
            'type' => $type,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function index()
    {
        return Inertia::render('Admin/Projects/Index', [
            // Load project dengan relasi tech_stacks
            'projects' => Project::with('techStacks')->orderBy('order', 'asc')->get(),
            'availableTechStacks' => TechStack::where('is_active', true)->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string',
            'repository_url' => 'nullable|url',
            'live_url' => 'nullable|url',
            'displayed_link' => 'required|in:repository,live_url,none',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048',
            'tech_stacks' => 'array',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('projects', 'public');
        }

        $project = Project::create($validated);
        
        if ($request->has('tech_stacks')) {
            $project->techStacks()->sync($request->tech_stacks);
        }

        $this->logActivity("Menambah project: {$project->name}", 'success');
        auth()->user()->notify(new SystemActivity("Project {$project->name} berhasil dibuat.", "success"));

        return redirect()->back()->with('message', 'Project berhasil ditambahkan.');
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string',
            'repository_url' => 'nullable|url',
            'live_url' => 'nullable|url',
            'displayed_link' => 'required|in:repository,live_url,none',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048',
            'tech_stacks' => 'array',
        ]);

        if ($request->hasFile('image')) {
            if ($project->image) Storage::disk('public')->delete($project->image);
            $validated['image'] = $request->file('image')->store('projects', 'public');
        }

        $project->update($validated);
        $project->techStacks()->sync($request->tech_stacks ?? []);

        // SEKARANG SUDAH ADA NOTIFIKASI
        $this->logActivity("Memperbarui project: {$project->name}", 'info');
        auth()->user()->notify(new SystemActivity("Data project {$project->name} telah diperbarui.", "info"));

        return redirect()->back()->with('message', 'Project berhasil diperbarui.');
    }

        public function updateOrder(Request $request)
    {
        $orders = $request->input('orders'); 

        foreach ($orders as $index => $id) {
            Project::where('id', $id)->update(['order' => $index]);
        }

        // Jika ingin pakai log
        $this->logActivity("Mengubah urutan Projects", 'info');

        return redirect()->back();
    }

    public function destroy(Project $project)
    {
        $name = $project->name;
        if ($project->image) Storage::disk('public')->delete($project->image);
        $project->delete();

        // SEKARANG SUDAH ADA NOTIFIKASI
        $this->logActivity("Menghapus project: {$name}", 'warning');
        auth()->user()->notify(new SystemActivity("Project {$name} telah dihapus dari sistem.", "warning"));

        return redirect()->back()->with('message', 'Project berhasil dihapus.');
    }
}