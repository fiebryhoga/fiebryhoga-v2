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

        // 2. Cari di tabel Tech Stack (Nama & Jenis)
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

        // 3. Cari di tabel Projects (Nama & Jenis Proyek)
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

        // 4. Cari di tabel Education (Institusi, Gelar, Jurusan)
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

        // 5. Cari di tabel Education Activity (Nama Aktivitas & Deskripsi)
        if (class_exists(\App\Models\EducationActivity::class)) {
            // Gunakan with('education') untuk menghindari N+1 Query Problem
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

        // 6. Cari di tabel Career (Perusahaan, Jabatan, Lokasi)
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

        // 7. Cari di tabel Career Activity (Nama Aktivitas & Deskripsi Pekerjaan)
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

        // 8. Cari di tabel Articles / Blog
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

        // 9. Cari di tabel Contact (Platform & Value/Username)
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

        // Ambil maksimal 12 hasil paling relevan agar dropdown tidak meledak ke bawah
        return response()->json($results->take(12)->values()->all());
    }
}