<?php

use App\Http\Controllers\Admin\ContractorController;
use App\Http\Controllers\Admin\CustomerController;
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
    Route::any('store-notification-token', [AuthController::class, 'storeNotificationToken'])->name('store.notification.token');
    
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
    Route::any('/asap-jobs/accept/{id}', [JobRosterController::class, 'accept_asap_job'])->name('accept.asap.job');
    Route::any('/signin/{id}', [JobRosterController::class, 'jobSignin'])->name('job.signin');
    Route::any('/signout/{id}', [JobRosterController::class, 'jobSignout'])->name('job.signout');

    Route::any('/jobDetails/{id}', [JobRosterController::class, 'jobSpecificDetail'])->name('job.detail');
    Route::any('/guard/jobs/{type}/{duration}', [JobRosterController::class, 'getGuardJobs'])->name('guard.job.detail');
    Route::any('/guard/other/jobs/{type}/{duration}/{id}', [JobRosterController::class, 'getJobs'])->name('guard.job');
    Route::any('/report-incident/{id}', [JobRosterController::class, 'reportIncidentNew']);
    Route::any('/foot-patrol-report/{id}', [JobRosterController::class, 'footPatrolReport']);
    Route::any('/get-all-jobs', [JobRosterController::class, 'getAllJobs'])->name('get.all.jobs');
    Route::any('/get-staff/{id}', [JobRosterController::class, 'getStaff'])->name('get.staff');
    Route::any('fetch-customer-sites', [JobRosterController::class, 'fetchCustomerSites'])->name('fetch.customer.sites');
    Route::any('get-contractor-staff/{id}', [JobRosterController::class, 'getContractorStaff'])->name('get.contractor');

    Route::prefix('admin')->group(function () {

        Route::get('get-contractors', [ContractorController::class, 'index']);
        Route::post('contractors-store', [ContractorController::class, 'store']);
        Route::get('contractors-edit/{id}', [ContractorController::class, 'show']);
        Route::put('contractors-update/{id}', [ContractorController::class, 'update']);
        Route::delete('contractors-delete/{id}', [ContractorController::class, 'destroy']);
        Route::patch('contractors/{id}/toggle-status', [ContractorController::class, 'toggleStatus']);

        // Customer CRUD
        Route::get('get-customers', [CustomerController::class, 'index']);
        Route::post('customers-store', [CustomerController::class, 'store']);
        Route::get('customers-edit/{id}', [CustomerController::class, 'show']);
        Route::put('customers-update/{id}', [CustomerController::class, 'update']);
        Route::delete('customers-delete/{id}', [CustomerController::class, 'destroy']);
        Route::patch('customers/{id}/toggle-status', [CustomerController::class, 'toggleStatus']);

        Route::any('create-staff',  [StaffController::class, 'createStaff'])->name('create.staff');
        Route::any('update-staff/{id}',  [StaffController::class, 'updateStaff'])->name('update.staff');
    });

});



