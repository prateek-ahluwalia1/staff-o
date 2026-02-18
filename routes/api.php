<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RolesPermissionController;
use App\Http\Controllers\Api\ChargeRateController;
use App\Http\Controllers\Api\JobRosterController;
use App\Http\Controllers\Api\PayRateController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserRoleController;

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


// Route::prefix('user')->group(function () {
//     Route::get('/all', [UserController::class, 'index']);
//     Route::get('show/{id}', [UserController::class, 'show']);    
//     Route::post('/store', [UserController::class, 'store']);      
//     Route::post('update/{id}', [UserController::class, 'update']);  
//     Route::delete('delete/{id}', [UserController::class, 'destroy']); 
// });


Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    
    //roles and permission
    Route::any('/store-permission',  [RolesPermissionController::class, 'store']);
    Route::any('/edit-permission',    [RolesPermissionController::class, 'edit']);
    Route::any('/get-all-permission', [RolesPermissionController::class, 'show']);
    Route::any('/update-permission', [RolesPermissionController::class, 'update']);
    Route::any('/delete-permission', [RolesPermissionController::class, 'delete']);
      
     //chargeRate routes
     Route::any('charge_rate/store',  [ChargeRateController::class, 'store'])->name('charge_rate.store');
     Route::any('charge_rate/update',  [ChargeRateController::class, 'update'])->name('charge_rate.update');
     Route::any('get-all-chargerates',  [ChargeRateController::class, 'getAllChargeRate'])->name('get.all.charge_rate');
     Route::any('get-all-archive-chargerates',  [ChargeRateController::class, 'getAllArchiveChargeRate'])->name('get.all.archive_charge_rate');
     Route::any('charge_rate/remove',  [ChargeRateController::class, 'removeChargeRate'])->name('charge_rate.remove');

    //payrate routes
    Route::any('payrate/store',  [PayRateController::class, 'store'])->name('payrate.store');
    Route::any('payrate/update',  [PayRateController::class, 'update'])->name('payrate.update');
    Route::any('get-all-payrates',  [PayRateController::class, 'getAllPayrate'])->name('get.all.payrates');
    Route::any('get-payrate',  [PayRateController::class, 'getPayrate'])->name('get.payrate');
    Route::any('get-all-archive-payrates',  [PayRateController::class, 'getAllArchivePayrate'])->name('get.all.archive_payrates');
    Route::any('payrate/remove',  [PayRateController::class, 'removePayrate'])->name('payrate.remove');
    
    //create new staff
    Route::any('create-staff',  [StaffController::class, 'createStaff'])->name('create.staff');
    Route::any('update-staff/{id}',  [StaffController::class, 'updateStaff'])->name('update.staff');
    Route::any('guard-all-documents', [StaffController::class, 'getAllGuardDocument'])->name('guard.all.documents');
    Route::any('guard-add-documents', [StaffController::class, 'addGuardDocuments'])->name('guard.add.documents');
    Route::any('guard-update-documents', [StaffController::class, 'updateGuardDocuments'])->name('guard.update.documents');

    //customer and contractor update
    Route::any('customers/{id}/update', [StaffController::class, 'customerUpdate'])->name('customer.update');
    Route::any('user-update/{id}', [StaffController::class, 'updateUser'])->name('user.update');
    Route::any('user-edit/{id}', [StaffController::class, 'editUser'])->name('user.edit');
    Route::any('upload-file', [StaffController::class, 'uploadFile'])->name('upload.file');

    Route::any('job-post', [JobRosterController::class, 'jobData'])->name('job.post');

});


