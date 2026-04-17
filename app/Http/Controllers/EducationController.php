<?php

namespace App\Http\Controllers;

use App\Models\Education;
use App\Models\EducationActivity;
use App\Models\ActivityLog;
use App\Notifications\SystemActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EducationController extends Controller
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
        return Inertia::render('Admin/Educations/Index', [
            // Load education beserta aktivitasnya
            'educations' => Education::with('activities')->orderBy('order', 'asc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'institution_name' => 'required|string|max:255',
            'degree' => 'required|string|max:255',
            'field_of_study' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        $validated['order'] = Education::max('order') + 1;
        $edu = Education::create($validated);

        $this->logActivity("Menambahkan pendidikan: {$edu->institution_name}", 'success');
        auth()->user()->notify(new SystemActivity("Pendidikan {$edu->institution_name} berhasil ditambahkan.", "success"));

        return redirect()->back()->with('message', 'Pendidikan berhasil ditambahkan.');
    }

    public function update(Request $request, Education $education)
    {
        $validated = $request->validate([
            'institution_name' => 'required|string|max:255',
            'degree' => 'required|string|max:255',
            'field_of_study' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        $education->update($validated);

        $this->logActivity("Memperbarui pendidikan: {$education->institution_name}", 'info');
        auth()->user()->notify(new SystemActivity("Data pendidikan {$education->institution_name} berhasil diperbarui.", "info"));

        return redirect()->back()->with('message', 'Pendidikan diperbarui.');
    }

    public function destroy(Education $education)
    {
        $name = $education->institution_name;
        $education->delete(); // Aktivitas otomatis terhapus karena cascadeOnDelete

        $this->logActivity("Menghapus pendidikan: {$name}", 'warning');
        auth()->user()->notify(new SystemActivity("Pendidikan {$name} telah dihapus.", "warning"));

        return redirect()->back()->with('message', 'Pendidikan dihapus.');
    }

    public function updateOrder(Request $request)
    {
        foreach ($request->orders as $index => $id) {
            Education::where('id', $id)->update(['order' => $index]);
        }

        $this->logActivity("Mengubah urutan tampilan Pendidikan", 'info');
        auth()->user()->notify(new SystemActivity("Urutan pendidikan berhasil diperbarui.", "info"));

        return redirect()->back();
    }

    // --- LOGIKA UNTUK AKTIVITAS PENDIDIKAN ---

    public function storeActivity(Request $request, Education $education)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['order'] = $education->activities()->max('order') + 1;
        $activity = $education->activities()->create($validated);

        $this->logActivity("Menambahkan aktivitas {$activity->name} di {$education->institution_name}", 'success');
        auth()->user()->notify(new SystemActivity("Aktivitas {$activity->name} berhasil ditambahkan di {$education->institution_name}.", "success"));

        return redirect()->back();
    }

    public function updateActivity(Request $request, EducationActivity $activity)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $activity->update($validated);

        $this->logActivity("Memperbarui aktivitas: {$activity->name}", 'info');
        auth()->user()->notify(new SystemActivity("Aktivitas {$activity->name} berhasil diperbarui.", "info"));

        return redirect()->back();
    }

    public function destroyActivity(EducationActivity $activity)
    {
        $name = $activity->name;
        $activity->delete();

        $this->logActivity("Menghapus aktivitas: {$name}", 'warning');
        auth()->user()->notify(new SystemActivity("Aktivitas {$name} telah dihapus.", "warning"));

        return redirect()->back();
    }

    public function updateActivityOrder(Request $request)
    {
        foreach ($request->orders as $index => $id) {
            EducationActivity::where('id', $id)->update(['order' => $index]);
        }

        $this->logActivity("Mengubah urutan aktivitas pendidikan", 'info');
        auth()->user()->notify(new SystemActivity("Urutan aktivitas berhasil diperbarui.", "info"));

        return redirect()->back();
    }
}