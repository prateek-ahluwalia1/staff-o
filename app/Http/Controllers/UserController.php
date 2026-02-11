<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'user_type' => 'required',
            'location' => 'required',
            'role_id' => 'required|integer',
            'profile' => 'nullable|array',
        ]);

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => $request->user_type,
            'location' => $request->location,
            'role_id' => $request->role_id,
            'profile' => $request->profile,
        ]);

        return response()->json($user, 200);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|min:6',
            'user_type' => 'sometimes|required',
            'location' => 'sometimes|required',
            'role_id' => 'sometimes|required|integer',
            'profile' => 'sometimes|array',
        ]);

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->update($request->only('email', 'user_type', 'location', 'role_id', 'profile'));

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
