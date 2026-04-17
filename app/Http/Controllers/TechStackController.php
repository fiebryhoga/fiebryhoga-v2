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
    private function logActivity($description, $type = 'info')
    {
        // Pastikan model ActivityLog memiliki fillable: user_id, description, type, ip_address, user_agent
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('tech_stacks', 'public');
        }

        // Set default order ke urutan terakhir
        $validated['order'] = TechStack::max('order') + 1;

        $techStack = TechStack::create($validated);

        // Logging & Notification
        $this->logActivity("Menambahkan tech stack baru: {$techStack->name}", 'success');
        auth()->user()->notify(new SystemActivity("Tech stack {$techStack->name} berhasil ditambahkan.", "success"));

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
            // Hapus gambar lama jika ada
            if ($techStack->image) {
                Storage::disk('public')->delete($techStack->image);
            }
            $validated['image'] = $request->file('image')->store('tech_stacks', 'public');
        } else {
            // Jika tidak upload gambar baru, tetap gunakan gambar lama
            unset($validated['image']);
        }

        $techStack->update($validated);

        // Logging & Notification
        $this->logActivity("Memperbarui tech stack: {$techStack->name}", 'info');
        auth()->user()->notify(new SystemActivity("Data {$techStack->name} berhasil diperbarui.", "info"));

        return redirect()->back()->with('message', 'Tech Stack berhasil diperbarui.');
    }

    // Perbaikan logic urutan agar lebih aman
    public function updateOrder(Request $request)
    {
        $orders = $request->input('orders'); 

        foreach ($orders as $index => $id) {
            TechStack::where('id', $id)->update(['order' => $index]);
        }

        $this->logActivity("Mengubah urutan Tech Stacks", 'info');

        return redirect()->back()->with('message', 'Urutan diperbarui.');
    }

    public function destroy(TechStack $techStack)
    {
        $name = $techStack->name;

        if ($techStack->image) {
            Storage::disk('public')->delete($techStack->image);
        }
        
        $techStack->delete();

        // Logging & Notification
        $this->logActivity("Menghapus tech stack: {$name}", 'warning');
        auth()->user()->notify(new SystemActivity("Tech stack {$name} telah dihapus.", "warning"));

        return redirect()->back()->with('message', 'Tech Stack berhasil dihapus.');
    }
}