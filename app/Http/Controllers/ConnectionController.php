<?php

namespace App\Http\Controllers;

use App\Models\Connection;
use App\Models\ConnectionTag;
use App\Models\ActivityLog;
use App\Notifications\SystemActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ConnectionController extends Controller
{
    // --- HELPER UNTUK LOG AKTIVITAS ---
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

    public function index(Request $request)
    {
        $tagId = $request->input('tag_id');
        $search = $request->input('search');

        $query = Connection::with('tag');

        // Filter Tag
        if ($tagId === 'untagged') {
            $query->whereNull('tag_id');
        } elseif ($tagId) {
            $query->where('tag_id', $tagId);
        }

        // Pencarian Nama
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('nickname', 'like', "%{$search}%");
            });
        }

        // Ambil Tag berbentuk Tree (Pohon) untuk Sidebar
        $tagsTree = ConnectionTag::whereNull('parent_id')
            ->with(['children' => function($q) {
                $q->withCount('connections')->with('children');
            }])
            ->withCount('connections')
            ->orderBy('name')
            ->get();

        $allTags = ConnectionTag::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Connections/Index', [
            'tagsTree' => $tagsTree,
            'allTags' => $allTags,
            'connections' => $query->latest()->get(),
            'currentFilter' => ['tag_id' => $tagId, 'search' => $search]
        ]);
    }

    // ==========================================
    // MANAJEMEN TAG
    // ==========================================
    
    public function storeTag(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255', 
            'parent_id' => 'nullable|exists:connection_tags,id'
        ]);
        
        ConnectionTag::create($validated);

        // Log & Notif
        $this->logActivity("Membuat tag koneksi baru: {$validated['name']}", 'success');
        auth()->user()->notify(new SystemActivity("Tag '{$validated['name']}' berhasil dibuat.", "success"));

        return redirect()->back()->with('message', 'Tag berhasil dibuat.');
    }

    public function updateTag(Request $request, ConnectionTag $tag)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);
        
        $tag->update($validated);

        // Log & Notif
        $this->logActivity("Memperbarui nama tag koneksi menjadi: {$validated['name']}", 'info');
        auth()->user()->notify(new SystemActivity("Nama tag berhasil diperbarui.", "info"));

        return redirect()->back()->with('message', 'Tag berhasil diperbarui.');
    }

    public function destroyTag(ConnectionTag $tag)
    {
        $name = $tag->name;
        $tag->delete();

        // Log & Notif
        $this->logActivity("Menghapus tag koneksi: {$name}", 'warning');
        auth()->user()->notify(new SystemActivity("Tag '{$name}' telah dihapus dari sistem.", "warning"));

        return redirect()->back()->with('message', 'Tag berhasil dihapus.');
    }

    // ==========================================
    // MANAJEMEN KONEKSI / ORANG
    // ==========================================

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tag_id' => 'nullable|exists:connection_tags,id',
            'full_name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:255',
            'gender' => 'nullable|in:L,P',
            'whatsapp' => 'nullable|string|max:20',
            'instagram' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('connections', 'public');
        }

        Connection::create($validated);

        // Log & Notif
        $this->logActivity("Menambahkan kontak baru: {$validated['full_name']}", 'success');
        auth()->user()->notify(new SystemActivity("Kontak '{$validated['full_name']}' berhasil ditambahkan.", "success"));

        return redirect()->back()->with('message', 'Kontak berhasil ditambahkan.');
    }

    public function update(Request $request, Connection $connection)
    {
        $validated = $request->validate([
            'tag_id' => 'nullable|exists:connection_tags,id',
            'full_name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:255',
            'gender' => 'nullable|in:L,P',
            'whatsapp' => 'nullable|string|max:20',
            'instagram' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            if ($connection->avatar) {
                Storage::disk('public')->delete($connection->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('connections', 'public');
        } else {
            // Hapus dari array validated agar tidak menimpa foto lama menjadi null
            unset($validated['avatar']);
        }

        $connection->update($validated);

        // Log & Notif
        $this->logActivity("Memperbarui data kontak: {$connection->full_name}", 'info');
        auth()->user()->notify(new SystemActivity("Data kontak '{$connection->full_name}' diperbarui.", "info"));

        return redirect()->back()->with('message', 'Data kontak berhasil diperbarui.');
    }

    public function destroy(Connection $connection)
    {
        $name = $connection->full_name;

        if ($connection->avatar) {
            Storage::disk('public')->delete($connection->avatar);
        }
        
        $connection->delete();

        // Log & Notif
        $this->logActivity("Menghapus kontak: {$name}", 'danger');
        auth()->user()->notify(new SystemActivity("Kontak '{$name}' telah dihapus secara permanen.", "warning"));

        return redirect()->back()->with('message', 'Kontak berhasil dihapus.');
    }
}