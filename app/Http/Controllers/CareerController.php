<?php

namespace App\Http\Controllers;

use App\Models\Career;
use App\Models\CareerActivity;
use App\Models\ActivityLog;
use App\Notifications\SystemActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CareerController extends Controller
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
        return Inertia::render('Admin/Careers/Index', [
            'careers' => Career::with('activities')->orderBy('order', 'asc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        $validated['order'] = Career::max('order') + 1;
        $career = Career::create($validated);

        $this->logActivity("Menambahkan karir: {$career->company_name}", 'success');
        auth()->user()->notify(new SystemActivity("Karir di {$career->company_name} ditambahkan.", "success"));

        return redirect()->back()->with('message', 'Karir berhasil ditambahkan.');
    }

    public function update(Request $request, Career $career)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        $career->update($validated);

        $this->logActivity("Memperbarui karir: {$career->company_name}", 'info');
        auth()->user()->notify(new SystemActivity("Data karir di {$career->company_name} diperbarui.", "info"));

        return redirect()->back();
    }

    public function destroy(Career $career)
    {
        $name = $career->company_name;
        $career->delete(); 

        $this->logActivity("Menghapus karir: {$name}", 'warning');
        auth()->user()->notify(new SystemActivity("Karir di {$name} telah dihapus.", "warning"));

        return redirect()->back();
    }

    public function updateOrder(Request $request)
    {
        foreach ($request->orders as $index => $id) {
            Career::where('id', $id)->update(['order' => $index]);
        }
        $this->logActivity("Mengubah urutan karir", 'info');
        return redirect()->back();
    }

    // --- LOGIKA AKTIVITAS KARIR ---
    public function storeActivity(Request $request, Career $career)
    {
        $validated = $request->validate(['name' => 'required|string|max:255', 'description' => 'nullable|string', 'is_active' => 'boolean']);
        $validated['order'] = $career->activities()->max('order') + 1;
        $activity = $career->activities()->create($validated);

        $this->logActivity("Menambah aktivitas {$activity->name} di {$career->company_name}", 'success');
        auth()->user()->notify(new SystemActivity("Aktivitas {$activity->name} ditambahkan.", "success"));
        return redirect()->back();
    }

    public function updateActivity(Request $request, CareerActivity $activity)
    {
        $validated = $request->validate(['name' => 'required|string|max:255', 'description' => 'nullable|string', 'is_active' => 'boolean']);
        $activity->update($validated);

        $this->logActivity("Memperbarui aktivitas karir: {$activity->name}", 'info');
        auth()->user()->notify(new SystemActivity("Aktivitas {$activity->name} diperbarui.", "info"));
        return redirect()->back();
    }

    public function destroyActivity(CareerActivity $activity)
    {
        $name = $activity->name;
        $activity->delete();

        $this->logActivity("Menghapus aktivitas karir: {$name}", 'warning');
        auth()->user()->notify(new SystemActivity("Aktivitas {$name} dihapus.", "warning"));
        return redirect()->back();
    }

    public function updateActivityOrder(Request $request)
    {
        foreach ($request->orders as $index => $id) {
            CareerActivity::where('id', $id)->update(['order' => $index]);
        }
        $this->logActivity("Mengubah urutan aktivitas karir", 'info');
        return redirect()->back();
    }
}