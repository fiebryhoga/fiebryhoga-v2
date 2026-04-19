<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function globalSearch(Request $request)
    {
        $query = $request->input('q');

        if (!$query) {
            return response()->json([]);
        }

        $results = collect();

        // 1. Cari di tabel Users (Admin)
        $users = \App\Models\User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->take(3)->get();
            
        foreach ($users as $user) {
            $results->push([
                'id' => 'user_' . $user->id,
                'title' => $user->name,
                'subtitle' => $user->email,
                'type' => 'Admin',
                'image' => $user->avatar,
                'route' => route('admins.index', ['search' => $user->name])
            ]);
        }

        // 2. Cari di tabel Tech Stack
        if (class_exists(\App\Models\TechStack::class)) {
            $techs = \App\Models\TechStack::where('name', 'like', "%{$query}%")
                ->orWhere('type', 'like', "%{$query}%")
                ->take(3)->get();
                
            foreach ($techs as $tech) {
                $results->push([
                    'id' => 'tech_' . $tech->id,
                    'title' => $tech->name,
                    'subtitle' => 'Kategori: ' . $tech->type,
                    'type' => 'Tech Stack',
                    'image' => $tech->image,
                    'route' => route('tech-stacks.index', ['search' => $tech->name])
                ]);
            }
        }

        // 3. Cari di tabel Projects
        if (class_exists(\App\Models\Project::class)) {
            $projects = \App\Models\Project::where('name', 'like', "%{$query}%")
                ->orWhere('type', 'like', "%{$query}%")
                ->take(3)->get();
                
            foreach ($projects as $project) {
                $results->push([
                    'id' => 'proj_' . $project->id,
                    'title' => $project->name,
                    'subtitle' => 'Tipe Proyek: ' . $project->type,
                    'type' => 'Project',
                    'image' => $project->image ?? null,
                    'route' => route('projects.index', ['search' => $project->name])
                ]);
            }
        }

        // 4. Cari di tabel Education
        if (class_exists(\App\Models\Education::class)) {
            $educations = \App\Models\Education::where('institution_name', 'like', "%{$query}%")
                ->orWhere('degree', 'like', "%{$query}%")
                ->orWhere('field_of_study', 'like', "%{$query}%")
                ->take(3)->get();
                
            foreach ($educations as $edu) {
                $results->push([
                    'id' => 'edu_' . $edu->id,
                    'title' => $edu->institution_name,
                    'subtitle' => $edu->degree . ' - ' . $edu->field_of_study,
                    'type' => 'Edukasi',
                    'image' => null,
                    'route' => route('educations.index', ['search' => $edu->institution_name])
                ]);
            }
        }

        // 5. Cari di tabel Education Activity
        if (class_exists(\App\Models\EducationActivity::class)) {
            $eduActivities = \App\Models\EducationActivity::with('education')
                ->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->take(3)->get();
                
            foreach ($eduActivities as $act) {
                $results->push([
                    'id' => 'edu_act_' . $act->id,
                    'title' => $act->name,
                    'subtitle' => 'Aktivitas di ' . ($act->education->institution_name ?? 'Institusi'),
                    'type' => 'Akt. Edukasi',
                    'image' => null,
                    'route' => route('educations.index', ['search' => $act->name])
                ]);
            }
        }

        // 6. Cari di tabel Career
        if (class_exists(\App\Models\Career::class)) {
            $careers = \App\Models\Career::where('company_name', 'like', "%{$query}%")
                ->orWhere('job_title', 'like', "%{$query}%")
                ->orWhere('location', 'like', "%{$query}%")
                ->take(3)->get();
                
            foreach ($careers as $career) {
                $results->push([
                    'id' => 'career_' . $career->id,
                    'title' => $career->job_title,
                    'subtitle' => $career->company_name . ' (' . $career->location . ')',
                    'type' => 'Karir',
                    'image' => null,
                    'route' => route('careers.index', ['search' => $career->company_name])
                ]);
            }
        }

        // 7. Cari di tabel Career Activity
        if (class_exists(\App\Models\CareerActivity::class)) {
            $carActivities = \App\Models\CareerActivity::with('career')
                ->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->take(3)->get();
                
            foreach ($carActivities as $act) {
                $results->push([
                    'id' => 'car_act_' . $act->id,
                    'title' => $act->name,
                    'subtitle' => 'Tugas di ' . ($act->career->company_name ?? 'Perusahaan'),
                    'type' => 'Akt. Karir',
                    'image' => null,
                    'route' => route('careers.index', ['search' => $act->name])
                ]);
            }
        }

        // 8. Cari di tabel Articles
        if (class_exists(\App\Models\Article::class)) {
            $articles = \App\Models\Article::where('title', 'like', "%{$query}%")->take(3)->get();
            foreach ($articles as $article) {
                $results->push([
                    'id' => 'art_' . $article->id,
                    'title' => $article->title,
                    'subtitle' => 'Artikel Blog',
                    'type' => 'Artikel',
                    'image' => $article->thumbnail ?? null,
                    'route' => route('articles.index', ['search' => $article->title])
                ]);
            }
        }

        // 9. Cari di tabel Contact (Sosmed)
        if (class_exists(\App\Models\Contact::class)) {
            $contacts = \App\Models\Contact::where('platform', 'like', "%{$query}%")
                ->orWhere('value', 'like', "%{$query}%")
                ->take(3)->get();
                
            foreach ($contacts as $contact) {
                $results->push([
                    'id' => 'contact_' . $contact->id,
                    'title' => $contact->platform,
                    'subtitle' => $contact->value,
                    'type' => 'Kontak',
                    'image' => null,
                    'route' => route('contacts.index', ['search' => $contact->platform])
                ]);
            }
        }

        // ==========================================
        // 10. CARI DI TABEL ALBUM GALERI
        // ==========================================
        if (class_exists(\App\Models\Album::class)) {
            $albums = \App\Models\Album::where('name', 'like', "%{$query}%")->take(3)->get();
            foreach ($albums as $album) {
                $results->push([
                    'id' => 'album_' . $album->id,
                    'title' => $album->name,
                    'subtitle' => 'Folder Album Galeri',
                    'type' => 'Album',
                    'image' => null, // Tidak ada gambar untuk folder
                    'route' => route('gallery.index', ['album_id' => $album->id]) // Langsung mengarah masuk ke dalam album tersebut
                ]);
            }
        }

        // ==========================================
        // 11. CARI DI TABEL FOTO GALERI
        // ==========================================
        if (class_exists(\App\Models\GalleryImage::class)) {
            $images = \App\Models\GalleryImage::where('name', 'like', "%{$query}%")->take(3)->get();
            foreach ($images as $img) {
                $results->push([
                    'id' => 'img_' . $img->id,
                    'title' => $img->name,
                    'subtitle' => 'Ukuran: ' . $img->size,
                    'type' => 'Foto',
                    'image' => $img->path, // Thumbnail foto akan muncul di pencarian
                    'route' => route('gallery.index', ['album_id' => $img->album_id ?? 'uncategorized']) 
                ]);
            }
        }

        // ==========================================
        // 12. CARI DI TABEL TAG KONEKSI
        // ==========================================
        if (class_exists(\App\Models\ConnectionTag::class)) {
            $tags = \App\Models\ConnectionTag::where('name', 'like', "%{$query}%")->take(3)->get();
            foreach ($tags as $tag) {
                $results->push([
                    'id' => 'conn_tag_' . $tag->id,
                    'title' => $tag->name,
                    'subtitle' => 'Grup/Tag Koneksi',
                    'type' => 'Grup',
                    'image' => null,
                    'route' => route('connections.index', ['tag_id' => $tag->id]) // Mengarah filter ke Tag
                ]);
            }
        }

        // ==========================================
        // 13. CARI DI TABEL KONEKSI / ORANG (Multi-kolom)
        // ==========================================
        if (class_exists(\App\Models\Connection::class)) {
            $connections = \App\Models\Connection::where('full_name', 'like', "%{$query}%")
                ->orWhere('nickname', 'like', "%{$query}%")
                ->orWhere('whatsapp', 'like', "%{$query}%")
                ->orWhere('instagram', 'like', "%{$query}%")
                ->orWhere('address', 'like', "%{$query}%")
                ->take(4)->get();
                
            foreach ($connections as $conn) {
                // Tentukan info tambahan apa yang akan ditampilkan di subtitle
                $subtitleInfo = $conn->whatsapp ? "WA: {$conn->whatsapp}" : ($conn->instagram ? "IG: @{$conn->instagram}" : "Relasi / Teman");

                $results->push([
                    'id' => 'conn_' . $conn->id,
                    'title' => $conn->full_name . ($conn->nickname ? " ({$conn->nickname})" : ''),
                    'subtitle' => $subtitleInfo,
                    'type' => 'Koneksi',
                    'image' => $conn->avatar, // Foto profil relasi akan muncul di pencarian
                    'route' => route('connections.index', ['search' => $conn->full_name]) // Membuka menu koneksi dan otomatis mencari namanya
                ]);
            }
        }

        // Menambah jumlah limit pengambilan hasil agar memuat modul baru
        return response()->json($results->take(15)->values()->all());
    }
}