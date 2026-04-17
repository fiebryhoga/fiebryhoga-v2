<?php

namespace App\Http\Controllers;

use App\Models\TechStack;
use App\Models\ActivityLog;
use App\Notifications\SystemActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TechStackController extends Controller
{
    // Helper Log
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
        return Inertia::render('Admin/TechStacks/Index', [

            'techStacks' => TechStack::orderBy('order', 'asc')->get()
        ]);

        
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'is_active' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048', // Mendukung SVG untuk logo
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('tech_stacks', 'public');
        }

        TechStack::create($validated);

        $this->logActivity("Menambahkan tech stack baru: {$validated['name']}", 'success');
        auth()->user()->notify(new SystemActivity("Tech stack {$validated['name']} berhasil ditambahkan.", "success"));

        return redirect()->back()->with('message', 'Tech Stack berhasil ditambahkan.');
    }

    public function update(Request $request, TechStack $techStack)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'is_active' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($techStack->image) Storage::disk('public')->delete($techStack->image);
            $validated['image'] = $request->file('image')->store('tech_stacks', 'public');
        }

        $techStack->update($validated);

        $this->logActivity("Memperbarui tech stack: {$techStack->name}", 'info');
        auth()->user()->notify(new SystemActivity("Data {$techStack->name} berhasil diperbarui.", "info"));

        return redirect()->back()->with('message', 'Tech Stack berhasil diperbarui.');
    }

    public function updateOrder(Request $request)
{
    $orders = $request->input('orders'); // Array berisi ID yang sudah urut

    foreach ($orders as $index => $id) {
        TechStack::where('id', $id)->update(['order' => $index]);
    }

    return redirect()->back();
}

    public function destroy(TechStack $techStack)
    {
        if ($techStack->image) Storage::disk('public')->delete($techStack->image);
        
        $name = $techStack->name;
        $techStack->delete();

        $this->logActivity("Menghapus tech stack: {$name}", 'warning');
        auth()->user()->notify(new SystemActivity("Tech stack {$name} telah dihapus.", "warning"));

        return redirect()->back()->with('message', 'Tech Stack berhasil dihapus.');
    }
}