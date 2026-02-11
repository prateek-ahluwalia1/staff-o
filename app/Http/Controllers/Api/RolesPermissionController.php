<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RolesPermissions;

class RolesPermissionController extends Controller

{
    // Show All Roles & Permessions

    public function show()
    {
        try {
            $rolespermissions = RolesPermissions::all();
            return response()->json($rolespermissions);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Store  Roles & Permessions
    public function store(Request $request)
    {

        try {
            $existingRole = RolesPermissions::where('roles', $request->roles)->first();

            if ($existingRole) {
                return response()->json([
                    'status' => 400,
                    'message' => 'Role already exists.'
                ]);
            }

            $roles_permessions = new RolesPermissions;
            $roles_permessions->roles = $request->roles;
            $roles_permessions->permissions = json_encode($request->permissions, true);
            $roles_permessions->save();

            return response()->json([
                'status' => 200,
                'message' => 'Added successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Edit Function
    public function edit(Request $request)
    {
        try {
            $id = $request->id;
            $rolespermissions = RolesPermissions::find($id);

            if ($rolespermissions) {
                return response()->json($rolespermissions);
            }

            // User not Found
            return response()->json([
                'error' => 'Not found!!'
            ], 404); // HTTP status code 404 Not Found
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Update Function
    public function update(Request $request)
    {
        try {
            // Find the roles and permissions entry by ID
            $rolesPermissions = RolesPermissions::find($request->id);

            if ($rolesPermissions) {
                // Check if the provided role name is unique among existing roles
                $existingRole = RolesPermissions::where('roles', $request->roles)
                    ->where('id', '!=', $request->id)
                    ->first();

                if ($existingRole) {
                    return response()->json([
                        'status' => 400,
                        'message' => 'Role already exists.'
                    ]);
                }

                // Validate the request data
                $request->validate([
                    'roles' => 'required',
                    'permissions' => 'required',
                ]);

                // Update the roles and permissions entry
                $rolesPermissions->roles = $request->roles;
                $rolesPermissions->permissions = json_encode($request->permissions, true);
                $rolesPermissions->update();

                return response()->json([
                    'status' => 200,
                    'message' => 'Updated successfully'
                ]);
            }

            // If the roles and permissions entry doesn't exist
            return response()->json([
                'status' => 404,
                'error' => 'Roles and permissions entry not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }



    // Delete Roles & Permessions

    public function delete(Request $request)
    {
        $delete_permision = RolesPermissions::where('id', $request->id)->first();
        if ($delete_permision) {
            $delete_permision->delete();
            return response()->json(['msg' =>  'Record Deleted Successfully!',  'code' => 200, 'success' => true]);
        } else {
            return response()->json(['msg' =>  'Record Not Found!',  'code' => 404, 'success' => false]);
        }
    }
}
