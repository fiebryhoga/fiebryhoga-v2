<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ActivityLog;
use App\Notifications\SystemActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ArticleController extends Controller
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
        return Inertia::render('Admin/Articles/Index', [
            // Load artikel beserta nama penulisnya
            'articles' => Article::with('author')->orderBy('order', 'asc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'published_at' => 'required|date',
            'thumbnail' => 'nullable|image|max:2048',
            'tags' => 'nullable|string', // Kita terima sebagai comma-separated string dari React
            'meta_description' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid(); // Pastikan URL unik
        $validated['order'] = Article::max('order') + 1;
        
        // Format Tags (Pisahkan dengan koma menjadi array)
        if ($request->filled('tags')) {
            $validated['tags'] = array_map('trim', explode(',', $request->tags));
        }

        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('articles', 'public');
        }

        $article = Article::create($validated);

        $this->logActivity("Membuat tulisan baru: {$article->title}", 'success');
        auth()->user()->notify(new SystemActivity("Tulisan '{$article->title}' berhasil dipublikasikan.", "success"));

        return redirect()->back();
    }

    public function update(Request $request, Article $article)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'published_at' => 'required|date',
            'thumbnail' => 'nullable|image|max:2048',
            'tags' => 'nullable|string',
            'meta_description' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Update slug jika judul berubah
        if ($request->title !== $article->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();
        }

        if ($request->filled('tags')) {
            $validated['tags'] = array_map('trim', explode(',', $request->tags));
        } else {
            $validated['tags'] = []; 
        }

        // ==========================================
        // PERBAIKAN BUG GAMBAR HILANG DI SINI
        // ==========================================
        if ($request->hasFile('thumbnail')) {
            // Jika ada file baru, hapus file lama dan simpan yang baru
            if ($article->thumbnail) {
                Storage::disk('public')->delete($article->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('articles', 'public');
        } else {
            // JIKA TIDAK ADA FILE BARU, BUANG THUMBNAIL DARI $validated 
            // AGAR GAMBAR LAMA TIDAK DITIMPA MENJADI NULL
            unset($validated['thumbnail']);
        }

        $article->update($validated);

        $this->logActivity("Memperbarui tulisan: {$article->title}", 'info');
        auth()->user()->notify(new SystemActivity("Tulisan '{$article->title}' diperbarui.", "info"));

        return redirect()->back();
    }

    public function destroy(Article $article)
    {
        $title = $article->title;
        if ($article->thumbnail) Storage::disk('public')->delete($article->thumbnail);
        $article->delete();

        $this->logActivity("Menghapus tulisan: {$title}", 'warning');
        auth()->user()->notify(new SystemActivity("Tulisan '{$title}' telah dihapus.", "warning"));

        return redirect()->back();
    }

    public function updateOrder(Request $request)
    {
        foreach ($request->orders as $index => $id) {
            Article::where('id', $id)->update(['order' => $index]);
        }
        return redirect()->back();
    }
}