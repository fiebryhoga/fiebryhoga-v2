<?php

namespace App\Http\Controllers;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use App\Models\Album;
use App\Models\GalleryImage;
use App\Models\ActivityLog;
use App\Notifications\SystemActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GalleryController extends Controller
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

        $albumsTree = Album::whereNull('parent_id')
            ->with(['children' => function($q) {
                $q->withCount('images')->with('children');
            }])
            ->withCount('images')
            ->latest()
            ->get();

        $allAlbums = Album::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Gallery/Index', [
            'albumsTree' => $albumsTree,
            'allAlbums' => $allAlbums,
            'images' => $query->paginate(100)->withQueryString(), 
            'currentFilter' => ['album_id' => $albumId, 'sort' => $sort]
        ]);
    }

    public function storeAlbum(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255', 
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:albums,id'
        ]);
        
        Album::create($validated);

        $this->logActivity("Membuat album baru: {$validated['name']}", 'success');
        auth()->user()->notify(new SystemActivity("Album '{$validated['name']}' berhasil dibuat.", "success"));

        return redirect()->back()->with('message', 'Album berhasil dibuat.');
    }

    // --- FITUR UPDATE DIPERBARUI UNTUK MENDUKUNG PINDAH POSISI (MOVE) ---
    public function updateAlbum(Request $request, Album $album)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:albums,id' // Tambahan validasi parent_id
        ]);
        
        $oldName = $album->name;
        $album->update($validated);
        
        $this->logActivity("Memperbarui/Memindahkan album '{$oldName}'", 'info');
        auth()->user()->notify(new SystemActivity("Album berhasil diperbarui.", "info"));

        return redirect()->back()->with('message', 'Album berhasil diperbarui.');
    }

    // --- FITUR DESTROY DIPERBARUI UNTUK MENDUKUNG HAPUS PAKSA (FORCE DELETE) ---
    public function destroyAlbum(Request $request, Album $album)
    {
        $name = $album->name;

        // JIKA TOMBOL "HAPUS SEMUA ISI" DITEKAN
        if ($request->boolean('force')) {
            // Ambil semua foto di dalam album ini
            $images = GalleryImage::where('album_id', $album->id)->get();
            
            // Hapus file fisik gambar-gambar di dalamnya terlebih dahulu
            foreach ($images as $img) {
                if ($img->path) Storage::disk('public')->delete($img->path);
                if ($img->thumbnail_path) Storage::disk('public')->delete($img->thumbnail_path);
                $img->delete();
            }
            $this->logActivity("Menghapus album '{$name}' BESERTA SELURUH ISINYA secara permanen.", 'danger');
            auth()->user()->notify(new SystemActivity("Album '{$name}' dan seluruh isinya telah dihapus.", "warning"));
        } else {
            // Jika hapus biasa, isi aman (karena nullOnDelete di database)
            $this->logActivity("Menghapus album '{$name}' (Isi dipindahkan ke Root).", 'warning');
            auth()->user()->notify(new SystemActivity("Album '{$name}' telah dihapus dari galeri.", "warning"));
        }

        $album->delete(); 
        
        return redirect()->route('gallery.index')->with('message', 'Album dan isinya telah diatur ulang.');
    }

    public function storeImages(Request $request)
    {
        $request->validate([
            'album_id' => 'nullable|exists:albums,id',
            'images' => 'required|array',
            'images.*' => 'image|max:10240', // Max 10MB
        ]);

        $manager = new ImageManager(new Driver());
        $count = 0;

        foreach ($request->file('images') as $file) {
            $originalPath = $file->store('gallery/originals', 'public');
            
            $bytes = $file->getSize();
            $size = $bytes >= 1048576 ? number_format($bytes / 1048576, 2) . ' MB' : number_format($bytes / 1024, 2) . ' KB';

            $thumbName = 'thumb_' . $file->hashName();
            $thumbPath = 'gallery/thumbnails/' . $thumbName;
            
            $image = $manager->read($file);
            $image->scale(width: 500); 
            
            Storage::disk('public')->put($thumbPath, $image->toJpeg(60)->toString());

            GalleryImage::create([
                'album_id' => $request->album_id,
                'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'path' => $originalPath,
                'thumbnail_path' => $thumbPath, 
                'size' => $size,
                'mime_type' => $file->getClientOriginalExtension(),
            ]);
            
            $count++;
        }

        $albumName = $request->album_id ? Album::find($request->album_id)?->name ?? "Tanpa Album" : "Tanpa Album";
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

        $this->logActivity("Memperbarui info gambar: {$validated['name']}", 'info');

        return redirect()->back();
    }

    public function destroyImage(GalleryImage $image)
    {
        $name = $image->name;
        
        if ($image->path) Storage::disk('public')->delete($image->path);
        if ($image->thumbnail_path) Storage::disk('public')->delete($image->thumbnail_path);
        
        $image->delete();
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
            if ($img->path) Storage::disk('public')->delete($img->path);
            if ($img->thumbnail_path) Storage::disk('public')->delete($img->thumbnail_path);
            $img->delete();
        }

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
        
        $albumName = "Luar Album (Root)";
        if ($albumId) {
            $album = Album::find($albumId);
            if ($album) $albumName = $album->name;
        }
        
        $this->logActivity("Memindahkan {$count} gambar ke album '{$albumName}'", 'info');
        auth()->user()->notify(new SystemActivity("Berhasil memindahkan {$count} gambar.", "info"));

        return redirect()->back()->with('message', "{$count} gambar dipindahkan.");
    }
}