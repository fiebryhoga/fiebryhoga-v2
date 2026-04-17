<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\GalleryImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GalleryController extends Controller
{
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

        match ($sort) {
            'terlama' => $query->oldest(),
            'nama_asc' => $query->orderBy('name', 'asc'),
            'nama_desc' => $query->orderBy('name', 'desc'),
            default => $query->latest(),
        };

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

    public function storeAlbum(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255', 
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:albums,id' // Validasi parent
        ]);
        Album::create($validated);
        return redirect()->back()->with('message', 'Album berhasil dibuat.');
    }

    public function destroyAlbum(Album $album)
    {
        $album->delete(); // Otomatis menghapus sub-album karena cascadeOnDelete
        return redirect()->route('gallery.index')->with('message', 'Album dan isinya telah diatur ulang.');
    }

    public function storeImages(Request $request)
    {
        $request->validate([
            'album_id' => 'nullable|exists:albums,id',
            'images' => 'required|array',
            'images.*' => 'image|max:10240',
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
        return redirect()->back()->with('message', "Berhasil mengunggah {$count} gambar.");
    }

    public function updateImage(Request $request, GalleryImage $image)
    {
        $validated = $request->validate(['name' => 'required|string|max:255', 'album_id' => 'nullable|exists:albums,id']);
        $image->update($validated);
        return redirect()->back();
    }

    public function destroyImage(GalleryImage $image)
    {
        if ($image->path) Storage::disk('public')->delete($image->path);
        $image->delete();
        return redirect()->back();
    }

    public function bulkDestroy(Request $request)
    {
        $ids = $request->input('ids', []);
        $images = GalleryImage::whereIn('id', $ids)->get();
        
        foreach ($images as $img) {
            if ($img->path) Storage::disk('public')->delete($img->path);
            $img->delete();
        }
        return redirect()->back()->with('message', count($ids) . ' gambar berhasil dihapus.');
    }

    public function bulkMove(Request $request)
    {
        $ids = $request->input('ids', []);
        $albumId = $request->input('album_id'); 
        
        GalleryImage::whereIn('id', $ids)->update(['album_id' => $albumId]);
        return redirect()->back()->with('message', count($ids) . ' gambar dipindahkan.');
    }
}