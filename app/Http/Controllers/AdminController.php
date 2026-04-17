<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Notifications\SystemActivity;
use Inertia\Inertia;

class AdminController extends Controller
{

    public function index(Request $request)
    {
        $query = User::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%");
        }

        return Inertia::render('Admin/Admins/Index', [
            'admins' => $query->latest()->get()
        ]);
    }

    private function logActivity($description, $type = 'info')
    {
        \App\Models\ActivityLog::create([
            'user_id' => auth()->id(),
            'description' => $description,
            'type' => $type,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:L,P',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', 
        ]);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        auth()->user()->notify(new SystemActivity("Admin baru ({$validated['name']}) berhasil ditambahkan.", "success"));
        $this->logActivity("Menambahkan admin baru: " . $validated['name'], 'success');

        return redirect()->back()->with('message', 'Admin berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:L,P',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:8']);
            $validated['password'] = Hash::make($request->password);
        }

        // ==========================================
        // PERBAIKAN BUG FOTO MENGHILANG
        // ==========================================
        if ($request->hasFile('avatar')) {       
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        } else {
            // Hapus field avatar dari $validated agar data lama tidak ditimpa null
            unset($validated['avatar']);
        }

        $user->update($validated);

        auth()->user()->notify(new SystemActivity("Data admin ({$user->name}) berhasil diperbarui.", "info"));
        $this->logActivity("Memperbarui data admin: " . $user->name, 'info');

        return redirect()->back()->with('message', 'Data Admin berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();

        auth()->user()->notify(new SystemActivity("Admin ({$user->name}) telah dihapus dari sistem.", "warning"));
        $this->logActivity("Menghapus admin: " . $user->name, 'warning');

        return redirect()->back()->with('message', 'Admin berhasil dihapus.');
    }

    public function globalSearch(Request $request)
    {
        $query = $request->input('q');

        if (!$query) {
            return response()->json([]);
        }

        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->take(5)
            ->get(['id', 'name', 'email', 'avatar']);

        return response()->json($users);
    }

    public function profileEdit()
    {
        return Inertia::render('Admin/Profile/Edit', [
            'user' => auth()->user(),
        ]);
    }

    public function profileUpdate(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:L,P',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'password' => 'nullable|string|min:8|confirmed', 
        ]);

        // ==========================================
        // PERBAIKAN BUG FOTO MENGHILANG DI HALAMAN PROFIL
        // ==========================================
        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        } else {
            // Hapus field avatar dari $validated agar data lama tidak ditimpa null
            unset($validated['avatar']);
        }

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);
        
        $this->logActivity("Memperbarui profil pribadi", 'info');
        auth()->user()->notify(new SystemActivity("Profil Anda berhasil diperbarui.", "info"));

        return redirect()->back()->with('message', 'Profil Anda berhasil diperbarui.');
    }
}