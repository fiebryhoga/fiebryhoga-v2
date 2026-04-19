<?php

namespace App\Http\Controllers;

use App\Models\CodingFolder;
use App\Models\CodingNote;
use App\Models\ActivityLog;
use App\Notifications\SystemActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CodingNoteController extends Controller
{
    private function logActivity($description, $type = 'info') {
        ActivityLog::create([
            'user_id' => auth()->id(), 
            'description' => $description, 
            'type' => $type, 
            'ip_address' => request()->ip(), 
            'user_agent' => request()->userAgent()
        ]);
    }

    public function index(Request $request)
    {
        $folderId = $request->input('folder_id');
        $search = $request->input('search');

        $query = CodingNote::query();

        if ($folderId === 'root') {
            $query->whereNull('folder_id');
        } elseif ($folderId) {
            $query->where('folder_id', $folderId);
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $foldersTree = CodingFolder::whereNull('parent_id')
            ->with(['children' => function($q) { 
                $q->withCount('notes')->with('children'); 
            }])
            ->withCount('notes')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Coding/Index', [
            'foldersTree' => $foldersTree,
            'allFolders' => CodingFolder::select('id', 'name')->orderBy('name')->get(),
            'notes' => $query->latest()->get(),
            'currentFilter' => ['folder_id' => $folderId, 'search' => $search]
        ]);
    }

    // ==========================================
    // MANAJEMEN FOLDER KODE
    // ==========================================

    public function storeFolder(Request $request) {
        $val = $request->validate([
            'name' => 'required|string|max:255', 
            'parent_id' => 'nullable|exists:coding_folders,id'
        ]);
        
        CodingFolder::create($val);
        
        $this->logActivity("Membuat folder coding: {$val['name']}", 'success');
        auth()->user()->notify(new SystemActivity("Folder coding '{$val['name']}' berhasil dibuat.", "success"));
        
        return redirect()->back()->with('message', 'Folder berhasil dibuat.');
    }

    // --- FITUR UPDATE DIPERBARUI UNTUK MENDUKUNG PINDAH POSISI (MOVE) ---
    public function updateFolder(Request $request, CodingFolder $folder) {
        $val = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:coding_folders,id' // Tambahan validasi parent_id
        ]);
        
        $oldName = $folder->name;
        $folder->update($val);
        
        $this->logActivity("Memperbarui/Memindahkan folder coding '{$oldName}'", 'info');
        auth()->user()->notify(new SystemActivity("Folder coding berhasil diperbarui.", "info"));
        
        return redirect()->back()->with('message', 'Folder berhasil diperbarui.');
    }

    // --- FITUR DESTROY DIPERBARUI UNTUK MENDUKUNG HAPUS PAKSA (FORCE DELETE) ---
    public function destroyFolder(Request $request, CodingFolder $folder) {
        $name = $folder->name;

        // JIKA TOMBOL "HAPUS SEMUA ISI" DITEKAN
        if ($request->boolean('force')) {
            // Hapus semua catatan di dalam folder ini
            $notes = CodingNote::where('folder_id', $folder->id)->get();
            foreach ($notes as $note) {
                $note->delete();
            }
            $this->logActivity("Menghapus folder coding '{$name}' BESERTA SELURUH ISINYA secara permanen.", 'danger');
            auth()->user()->notify(new SystemActivity("Folder '{$name}' dan seluruh catatannya telah dihapus.", "warning"));
        } else {
            // Jika hapus biasa, isi catatan aman (karena nullOnDelete di database) dan pindah ke root
            $this->logActivity("Menghapus folder coding '{$name}' (Catatan dipindahkan ke Root).", 'warning');
            auth()->user()->notify(new SystemActivity("Folder '{$name}' telah dihapus dari sistem.", "warning"));
        }

        $folder->delete(); 
        
        return redirect()->route('coding.index')->with('message', 'Folder dan isinya telah diatur ulang.');
    }

    // ==========================================
    // MANAJEMEN CATATAN KODE (CRUD)
    // ==========================================

    public function create()
    {
        return Inertia::render('Admin/Coding/Form', [
            'allFolders' => CodingFolder::select('id', 'name')->orderBy('name')->get()
        ]);
    }

    public function show(CodingNote $coding)
    {
        // Load relasi folder untuk breadcrumb/keterangan di halaman View
        $coding->load('folder'); 
        return Inertia::render('Admin/Coding/Show', [
            'note' => $coding
        ]);
    }

    public function edit(CodingNote $coding)
    {
        return Inertia::render('Admin/Coding/Form', [
            'note' => $coding,
            'allFolders' => CodingFolder::select('id', 'name')->orderBy('name')->get()
        ]);
    }

    public function store(Request $request) {
        $val = $request->validate([
            'folder_id' => 'nullable|exists:coding_folders,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string', // Menyimpan format HTML dari Editor (Quill)
        ]);
        
        $note = CodingNote::create($val);
        
        $this->logActivity("Membuat catatan coding baru: {$val['title']}", 'success');
        auth()->user()->notify(new SystemActivity("Catatan '{$val['title']}' berhasil ditambahkan.", "success"));
        
        // Setelah simpan, langsung arahkan ke halaman BACA (Show)
        return redirect()->route('coding.show', $note->id)->with('message', 'Catatan berhasil disimpan.');
    }

    public function update(Request $request, CodingNote $coding) {
        $val = $request->validate([
            'folder_id' => 'nullable|exists:coding_folders,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
        ]);
        
        $coding->update($val);
        
        $this->logActivity("Mengedit catatan coding: {$coding->title}", 'info');
        auth()->user()->notify(new SystemActivity("Catatan '{$coding->title}' telah diperbarui.", "info"));
        
        // Setelah update, arahkan ke halaman baca
        return redirect()->route('coding.show', $coding->id)->with('message', 'Catatan berhasil diperbarui.');
    }

    public function destroy(CodingNote $coding) {
        $title = $coding->title;
        $coding->delete();
        
        $this->logActivity("Menghapus catatan coding: {$title}", 'danger');
        auth()->user()->notify(new SystemActivity("Catatan '{$title}' telah dihapus.", "warning"));
        
        return redirect()->route('coding.index')->with('message', 'Catatan berhasil dihapus.');
    }
}