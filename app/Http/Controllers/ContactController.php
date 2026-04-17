<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\ActivityLog;
use App\Notifications\SystemActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
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
        return Inertia::render('Admin/Contacts/Index', [
            'contacts' => Contact::orderBy('order', 'asc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'platform' => 'required|string|max:255',
            'value' => 'required|string|max:255',
            'url' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $validated['order'] = Contact::max('order') + 1;
        $contact = Contact::create($validated);

        $this->logActivity("Menambahkan kontak baru: {$contact->platform}", 'success');
        auth()->user()->notify(new SystemActivity("Kontak {$contact->platform} berhasil ditambahkan.", "success"));

        return redirect()->back();
    }

    public function update(Request $request, Contact $contact)
    {
        $validated = $request->validate([
            'platform' => 'required|string|max:255',
            'value' => 'required|string|max:255',
            'url' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $contact->update($validated);

        $this->logActivity("Memperbarui kontak: {$contact->platform}", 'info');
        auth()->user()->notify(new SystemActivity("Kontak {$contact->platform} diperbarui.", "info"));

        return redirect()->back();
    }

    public function destroy(Contact $contact)
    {
        $platform = $contact->platform;
        $contact->delete();

        $this->logActivity("Menghapus kontak: {$platform}", 'warning');
        auth()->user()->notify(new SystemActivity("Kontak {$platform} telah dihapus.", "warning"));

        return redirect()->back();
    }

    public function updateOrder(Request $request)
    {
        foreach ($request->orders as $index => $id) {
            Contact::where('id', $id)->update(['order' => $index]);
        }
        $this->logActivity("Mengubah urutan tampilan kontak", 'info');
        return redirect()->back();
    }
}