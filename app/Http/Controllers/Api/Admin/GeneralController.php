<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GeneralController extends Controller
{
    public function getAdmins()
    {
        $admins = User::where('user_type', 'admin')->get();

        return response()->json([
            'success' => true,
            'data' => $admins
        ], 200);
    }
}
