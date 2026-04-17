<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Contact;

class ContactSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ganti 'username_anda' dan nomor di bawah ini dengan data asli Anda nantinya
        $username = 'fiebryhoga'; 
        $phone = '081234567890'; // Gunakan awalan 0
        $phoneWa = '6281234567890'; // Gunakan awalan 62 untuk URL WA
        $email = 'hello@fiebryhoga.com';

        $contacts = [
            // --- KONTAK UTAMA ---
            ['platform' => 'Email', 'value' => $email, 'url' => 'mailto:' . $email, 'is_active' => true],
            ['platform' => 'WhatsApp', 'value' => $phone, 'url' => 'https://wa.me/' . $phoneWa, 'is_active' => true],
            ['platform' => 'Telepon', 'value' => $phone, 'url' => 'tel:' . $phone, 'is_active' => true],
            ['platform' => 'Website', 'value' => 'fiebryhoga.com', 'url' => 'https://fiebryhoga.com', 'is_active' => true],

            // --- PROFESIONAL & PORTFOLIO ---
            ['platform' => 'LinkedIn', 'value' => $username, 'url' => 'https://linkedin.com/in/' . $username, 'is_active' => true],
            ['platform' => 'GitHub', 'value' => $username, 'url' => 'https://github.com/' . $username, 'is_active' => true],
            ['platform' => 'GitLab', 'value' => $username, 'url' => 'https://gitlab.com/' . $username, 'is_active' => false],
            ['platform' => 'Medium', 'value' => $username, 'url' => 'https://medium.com/@' . $username, 'is_active' => true],
            ['platform' => 'Dribbble', 'value' => $username, 'url' => 'https://dribbble.com/' . $username, 'is_active' => false],
            ['platform' => 'Behance', 'value' => $username, 'url' => 'https://www.behance.net/' . $username, 'is_active' => false],

            // --- SOSIAL MEDIA UMUM ---
            ['platform' => 'Instagram', 'value' => $username, 'url' => 'https://instagram.com/' . $username, 'is_active' => true],
            ['platform' => 'X / Twitter', 'value' => $username, 'url' => 'https://x.com/' . $username, 'is_active' => true],
            ['platform' => 'Facebook', 'value' => $username, 'url' => 'https://facebook.com/' . $username, 'is_active' => false],
            ['platform' => 'YouTube', 'value' => $username, 'url' => 'https://youtube.com/@' . $username, 'is_active' => false],
            ['platform' => 'TikTok', 'value' => $username, 'url' => 'https://tiktok.com/@' . $username, 'is_active' => false],
            ['platform' => 'Pinterest', 'value' => $username, 'url' => 'https://pinterest.com/' . $username, 'is_active' => false],

            // --- MESSENGER & KOMUNITAS ---
            ['platform' => 'Telegram', 'value' => $username, 'url' => 'https://t.me/' . $username, 'is_active' => false],
            ['platform' => 'Discord', 'value' => $username . '#1234', 'url' => 'https://discordapp.com/users/ID_ANDA', 'is_active' => false],
            ['platform' => 'Skype', 'value' => $username, 'url' => 'skype:' . $username . '?chat', 'is_active' => false],
        ];

        // Looping untuk memasukkan data sekaligus mengatur urutan (order) otomatis
        foreach ($contacts as $index => $contact) {
            Contact::firstOrCreate(
                ['platform' => $contact['platform']], // Cek agar tidak duplikat jika di-run 2x
                array_merge($contact, [
                    'order' => $index + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}