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

    // --- FITUR UPDATE DIPERBARUI UNTUK MENDUKUNG PINDAH POSISI (MOVE) ---
    public function updateTag(Request $request, ConnectionTag $tag)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:connection_tags,id' // Tambahan validasi parent_id
        ]);
        
        $oldName = $tag->name;
        $tag->update($validated);

        // Log & Notif
        $this->logActivity("Memperbarui/Memindahkan tag koneksi '{$oldName}'", 'info');
        auth()->user()->notify(new SystemActivity("Tag berhasil diperbarui.", "info"));

        return redirect()->back()->with('message', 'Tag berhasil diperbarui.');
    }

    // --- FITUR DESTROY DIPERBARUI UNTUK MENDUKUNG HAPUS PAKSA (FORCE DELETE) ---
    public function destroyTag(Request $request, ConnectionTag $tag)
    {
        $name = $tag->name;

        // JIKA TOMBOL "HAPUS SEMUA ISI" DITEKAN
        if ($request->boolean('force')) {
            // Ambil semua kontak/koneksi di dalam tag ini
            $connections = Connection::where('tag_id', $tag->id)->get();
            
            // Hapus file fisik avatar dan data kontak di dalamnya terlebih dahulu
            foreach ($connections as $conn) {
                if ($conn->avatar) {
                    Storage::disk('public')->delete($conn->avatar);
                }
                $conn->delete();
            }
            $this->logActivity("Menghapus tag '{$name}' BESERTA SELURUH ISINYA secara permanen.", 'danger');
            auth()->user()->notify(new SystemActivity("Tag '{$name}' dan seluruh kontaknya telah dihapus.", "warning"));
        } else {
            // Jika hapus biasa, isi aman (karena nullOnDelete di database)
            $this->logActivity("Menghapus tag koneksi '{$name}' (Isi dipindahkan ke Root).", 'warning');
            auth()->user()->notify(new SystemActivity("Tag '{$name}' telah dihapus dari sistem.", "warning"));
        }

        $tag->delete();

        // Redirect ke root connections agar tidak error jika sedang berada di dalam tag yang baru saja dihapus
        return redirect()->route('connections.index')->with('message', 'Tag dan isinya telah diatur ulang.');
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

    public function bulkDestroy(Request $request)
    {
        $ids = $request->input('ids', []);
        $connections = Connection::whereIn('id', $ids)->get();
        $count = count($connections);
        
        if ($count === 0) return redirect()->back();

        foreach ($connections as $conn) {
            if ($conn->avatar) {
                Storage::disk('public')->delete($conn->avatar);
            }
            $conn->delete();
        }

        // Log & Notif
        $this->logActivity("Menghapus masal {$count} data kontak", 'danger');
        auth()->user()->notify(new SystemActivity("Sebanyak {$count} kontak telah dihapus.", "warning"));

        return redirect()->back()->with('message', "{$count} kontak berhasil dihapus.");
    }

    public function bulkMove(Request $request)
    {
        $ids = $request->input('ids', []);
        $tagId = $request->input('tag_id'); 
        $count = count($ids);
        
        if ($count === 0) return redirect()->back();

        // Pindahkan ke Tag baru (Bisa null jika ingin dikeluarkan dari Tag)
        Connection::whereIn('id', $ids)->update(['tag_id' => $tagId]);

        $tagName = "Tanpa Tag (Root)";
        if ($tagId) {
            $tag = ConnectionTag::find($tagId);
            if ($tag) $tagName = $tag->name;
        }

        // Log & Notif
        $this->logActivity("Memindahkan {$count} kontak ke tag '{$tagName}'", 'info');
        auth()->user()->notify(new SystemActivity("Berhasil memindahkan {$count} kontak.", "info"));

        return redirect()->back()->with('message', "{$count} kontak dipindahkan.");
    }
}