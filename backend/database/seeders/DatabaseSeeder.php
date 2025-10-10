<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            TestSeeder::class,
            VillagesProjetsSeed::class,
            DocumentsTestSeeder::class,
            NotificationSeeder::class,
            SiteContentSeeder::class,
            SiteSettingsSeeder::class,
        ]);
    }
}
