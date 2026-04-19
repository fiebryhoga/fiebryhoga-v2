<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\GalleryImage;
use App\Models\ActivityLog;
use App\Notifications\SystemActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GalleryController extends Controller
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
        $albumId = $request->input('album_id');
        $sort = $request->input('sort', 'terbaru');

        $query = GalleryImage::with('album');
        
        if ($albumId === 'uncategorized') {
            $query->whereNull('album_id');
        } elseif ($albumId) {
            $query->where('album_id', $albumId);
        }

        switch ($sort) {
            case 'terlama':
                $query->oldest();
                break;
            case 'nama_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'nama_desc':
                $query->orderBy('name', 'desc');
                break;
            default:
                $query->latest();
                break;
        }

        // Ambil Album dalam bentuk hirarki (yang tidak punya parent = root)
        $albumsTree = Album::whereNull('parent_id')
            ->with(['children' => function($q) {
                // Load sub-albums dan hitung jumlah fotonya
                $q->withCount('images')->with('children');
            }])
            ->withCount('images')
            ->latest()
            ->get();

        // Ambil semua album flat (untuk pilihan dropdown)
        $allAlbums = Album::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Gallery/Index', [
            'albumsTree' => $albumsTree,
            'allAlbums' => $allAlbums,
            'images' => $query->get(),
            'currentFilter' => ['album_id' => $albumId, 'sort' => $sort]
        ]);
    }

    // ==========================================
    // MANAJEMEN ALBUM
    // ==========================================

    public function storeAlbum(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255', 
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:albums,id'
        ]);
        
        Album::create($validated);

        // Log & Notif
        $this->logActivity("Membuat album baru: {$validated['name']}", 'success');
        auth()->user()->notify(new SystemActivity("Album '{$validated['name']}' berhasil dibuat.", "success"));

        return redirect()->back()->with('message', 'Album berhasil dibuat.');
    }

    public function updateAlbum(Request $request, Album $album)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);
        
        $oldName = $album->name;
        $album->update($validated);
        
        // Log & Notif
        $this->logActivity("Mengubah nama album dari '{$oldName}' menjadi '{$validated['name']}'", 'info');
        auth()->user()->notify(new SystemActivity("Nama album berhasil diperbarui menjadi '{$validated['name']}'.", "info"));

        return redirect()->back()->with('message', 'Nama album berhasil diperbarui.');
    }

    public function destroyAlbum(Album $album)
    {
        $name = $album->name;
        $album->delete(); // Otomatis menghapus sub-album karena cascadeOnDelete
        
        // Log & Notif
        $this->logActivity("Menghapus album galeri: {$name}", 'warning');
        auth()->user()->notify(new SystemActivity("Album '{$name}' telah dihapus dari galeri.", "warning"));

        return redirect()->route('gallery.index')->with('message', 'Album dan isinya telah diatur ulang.');
    }


    // ==========================================
    // MANAJEMEN GAMBAR (SINGLE & BULK)
    // ==========================================

    public function storeImages(Request $request)
    {
        $request->validate([
            'album_id' => 'nullable|exists:albums,id',
            'images' => 'required|array',
            'images.*' => 'image|max:10240', // Max 10MB
        ]);

        $count = 0;
        foreach ($request->file('images') as $file) {
            $path = $file->store('gallery', 'public');
            $bytes = $file->getSize();
            $size = $bytes >= 1048576 ? number_format($bytes / 1048576, 2) . ' MB' : number_format($bytes / 1024, 2) . ' KB';

            GalleryImage::create([
                'album_id' => $request->album_id,
                'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'path' => $path,
                'size' => $size,
                'mime_type' => $file->getClientOriginalExtension(),
            ]);
            $count++;
        }

        // Tentukan nama album tujuan untuk notifikasi
        $albumName = "Tanpa Album";
        if ($request->album_id) {
            $album = Album::find($request->album_id);
            if ($album) $albumName = $album->name;
        }

        // Log & Notif
        $this->logActivity("Mengunggah {$count} gambar baru ke album '{$albumName}'", 'success');
        auth()->user()->notify(new SystemActivity("{$count} gambar berhasil diunggah ke galeri.", "success"));

        return redirect()->back()->with('message', "Berhasil mengunggah {$count} gambar.");
    }

    public function updateImage(Request $request, GalleryImage $image)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255', 
            'album_id' => 'nullable|exists:albums,id'
        ]);
        
        $image->update($validated);

        // Log & Notif (Hanya informatif, tanpa notifikasi bel agar tidak spam jika sering edit)
        $this->logActivity("Memperbarui info gambar: {$validated['name']}", 'info');

        return redirect()->back();
    }

    public function destroyImage(GalleryImage $image)
    {
        $name = $image->name;
        
        if ($image->path) {
            Storage::disk('public')->delete($image->path);
        }
        
        $image->delete();

        // Log Aktivitas
        $this->logActivity("Menghapus satu gambar dari galeri: {$name}", 'warning');

        return redirect()->back();
    }

    public function bulkDestroy(Request $request)
    {
        $ids = $request->input('ids', []);
        $images = GalleryImage::whereIn('id', $ids)->get();
        $count = count($images);
        
        if ($count === 0) return redirect()->back();

        foreach ($images as $img) {
            if ($img->path) {
                Storage::disk('public')->delete($img->path);
            }
            $img->delete();
        }

        // Log & Notif
        $this->logActivity("Menghapus masal {$count} gambar dari galeri", 'danger');
        auth()->user()->notify(new SystemActivity("Sebanyak {$count} gambar telah dihapus secara permanen.", "warning"));

        return redirect()->back()->with('message', "{$count} gambar berhasil dihapus.");
    }

    public function bulkMove(Request $request)
    {
        $ids = $request->input('ids', []);
        $albumId = $request->input('album_id'); 
        $count = count($ids);
        
        if ($count === 0) return redirect()->back();

        GalleryImage::whereIn('id', $ids)->update(['album_id' => $albumId]);

        // Cari nama album tujuan untuk log
        $albumName = "Luar Album (Root)";
        if ($albumId) {
            $album = Album::find($albumId);
            if ($album) $albumName = $album->name;
        }

        // Log & Notif
        $this->logActivity("Memindahkan {$count} gambar ke album '{$albumName}'", 'info');
        auth()->user()->notify(new SystemActivity("Berhasil memindahkan {$count} gambar.", "info"));

        return redirect()->back()->with('message', "{$count} gambar dipindahkan.");
    }
}