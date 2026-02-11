<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultCustomerSeeder extends Seeder
{
    public function run()
    {
        $user = User::firstOrCreate(
            ['email' => 'capital@security.com'],
            [
                'name' => 'Capital Security',
                'password' => Hash::make('password'),
                'user_type' => 'customer',
                'is_active' => true,
            ]
        );

        Customer::firstOrCreate(
            ['user_id' => $user->id],
            [
                'company_name' => 'Capital Security',
                'phone' => '+92-300-0000000',
                'city' => 'Lahore',
                'country' => 'Pakistan',
            ]
        );
    }
}
