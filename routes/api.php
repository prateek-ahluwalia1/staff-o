<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RolesPermissionController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserRoleController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register/customer', [AuthController::class, 'registerCustomer']);
Route::post('/register/contractor', [AuthController::class, 'registerContractor']);
Route::post('/register/staff', [AuthController::class, 'registerStaff']);

Route::post('/login', [AuthController::class, 'login']);


Route::prefix('user')->group(function () {
    Route::get('/all', [UserController::class, 'index']);
    Route::get('show/{id}', [UserController::class, 'show']);    
    Route::post('/store', [UserController::class, 'store']);      
    Route::post('update/{id}', [UserController::class, 'update']);  
    Route::delete('delete/{id}', [UserController::class, 'destroy']); 
});


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
      //roles and permission
      Route::any('/store-permission',  [RolesPermissionController::class, 'store']);
      Route::any('/edit-permission',    [RolesPermissionController::class, 'edit']);
      Route::any('/get-all-permission', [RolesPermissionController::class, 'show']);
      Route::any('/update-permission', [RolesPermissionController::class, 'update']);
      Route::any('/delete-permission', [RolesPermissionController::class, 'delete']);
});


