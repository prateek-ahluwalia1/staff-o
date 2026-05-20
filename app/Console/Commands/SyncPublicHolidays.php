<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class SyncPublicHolidays extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-public-holidays';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Australia public holidays';

    /**
     * Execute the console command.
     */
    public function handle()
    { 
        $year = now()->addMonths(7)->year;

        $url = "https://date.nager.at/api/v3/PublicHolidays/$year/AU";

        $this->info("Fetching public holidays for {$year}...");

        $response = Http::get($url);

        if (!$response->successful()) {

            $this->error('API Failed');

            return Command::FAILURE;
        }

        $holidays = $response->json();

        $states = [
            'AU-NSW' => 'nsw',
            'AU-VIC' => 'vic',
            'AU-QLD' => 'qld',
            'AU-SA'  => 'sa',
            'AU-WA'  => 'wa',
            'AU-TAS' => 'tas',
            'AU-ACT' => 'act',
            'AU-NT'  => 'nt',
        ];

        $inserted = 0;

        foreach ($holidays as $holiday) {

            $date = date('Ymd', strtotime($holiday['date']));
            $holidayName = $holiday['localName'];

            // Global Holiday
            if (empty($holiday['counties'])) {

                DB::table('public_holidays')->updateOrInsert(
                    [
                        'date' => $date,
                        'state' => 'all'
                    ],
                    [
                        'information' => $holidayName,
                        'holiday_name' => $holidayName,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );

                $inserted++;

            } else {

                // State holidays
                foreach ($holiday['counties'] as $county) {

                    $state = $states[$county] ?? strtolower($county);

                    DB::table('public_holidays')->updateOrInsert(
                        [
                            'date' => $date,
                            'state' => $state
                        ],
                        [
                            'information' => $holidayName,
                            'holiday_name' => $holidayName,
                            'updated_at' => now(),
                            'created_at' => now(),
                        ]
                    );

                    $inserted++;
                }
            }
        }

        $this->info("{$inserted} public holidays synced successfully.");

        return Command::SUCCESS;
    }
}