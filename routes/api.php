<?php

use App\Http\Controllers\Api\Admin\ContractorController;
use App\Http\Controllers\Api\Admin\CustomerController;
use App\Http\Controllers\Api\Admin\AdminStaffController;
use App\Http\Controllers\Api\Admin\GeneralController;
use App\Http\Controllers\Api\Admin\QuestionnaireController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RolesPermissionController;
use App\Http\Controllers\Api\ChargeRateController;
use App\Http\Controllers\Api\ContactUsController;
use App\Http\Controllers\Api\JobRosterActiviteController;
use App\Http\Controllers\Api\JobRosterController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PayRateController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Api\LeaveManagementController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\RtmController;
use Illuminate\Support\Facades\Artisan;

use App\Http\Controllers\AgoraController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\VisaController;
use App\Http\Controllers\IvrController2;
use App\Http\Controllers\Api\StripeWebhookController;

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
Route::post('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::get('/email-verification/{email}/{token}', [AuthController::class, 'EmailVerification'])->name('guard.email.verification');
Route::post('/register/user', [AuthController::class, 'register']);

Route::any('password-reset', [AuthController::class, 'reset'])->name('password.update');
Route::any('password-reset-email', [AuthController::class, 'reset_pass_mail']);
Route::any('password-save', [AuthController::class, 'showPasswordResetForm'])->name('password.reset.form');
// Route::post('/register/contractor', [AuthController::class, 'registerContractor']);
// Route::post('/register/staff', [AuthController::class, 'registerStaff']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('stripe/webhook', [StripeWebhookController::class, 'handle']);

Route::prefix('contact-us')->group(function () {
    Route::post('/', [ContactUsController::class, 'store']);
    Route::get('/inquiry-types', [ContactUsController::class, 'getInquiryTypes']);
});

// Route::prefix('user')->group(function () {
//     Route::get('/all', [UserController::class, 'index']);
//     Route::get('show/{id}', [UserController::class, 'show']);    
//     Route::post('/store', [UserController::class, 'store']);      
//     Route::post('update/{id}', [UserController::class, 'update']);  
//     Route::delete('delete/{id}', [UserController::class, 'destroy']); 
// });


Route::middleware('auth:sanctum')->group(function () {

    Route::any('/logout/{id}', [AuthController::class, 'logout']);
    Route::any('store-notification-token', [AuthController::class, 'storeNotificationToken'])->name('store.notification.token');
    Route::post('/auth/resend-otp',  [AuthController::class, 'resendOtp']);
    Route::post('/auth/verify-phone',[AuthController::class, 'verifyPhone']);
    
    //roles and permission
    Route::any('/store-permission',  [RolesPermissionController::class, 'store']);
    Route::any('/edit-permission',    [RolesPermissionController::class, 'edit']);
    Route::any('/get-all-permission', [RolesPermissionController::class, 'show']);
    Route::any('/update-permission', [RolesPermissionController::class, 'update']);
    Route::any('/delete-permission', [RolesPermissionController::class, 'delete']);

      
     //chargeRate routes
     Route::any('charge_rate/store',  [ChargeRateController::class, 'store'])->name('charge_rate.store');
     Route::any('charge_rate/update',  [ChargeRateController::class, 'update'])->name('charge_rate.update');
     Route::any('get-chargerates',  [ChargeRateController::class, 'getChargeRate'])->name('get.charge_rate');
     Route::any('get-all-chargerates',  [ChargeRateController::class, 'getAllChargeRate'])->name('get.all.charge_rate');
     Route::any('get-all-archive-chargerates',  [ChargeRateController::class, 'getAllArchiveChargeRate'])->name('get.all.archive_charge_rate');
     Route::any('charge_rate/remove',  [ChargeRateController::class, 'removeChargeRate'])->name('charge_rate.remove');

     //contractor charge rate
     Route::any('store-contractor-rate',  [ChargeRateController::class, 'contactorStore']);
     Route::any('update-contractor-rate',  [ChargeRateController::class, 'ContractorUpdate']);
     Route::any('get-all-contractor-rates',  [ChargeRateController::class, 'getContractorChargeRate']);
     Route::any('get-contractor-rates/{id}',  [ChargeRateController::class, 'ChargeRate']);

    //payrate routes
    Route::any('payrate/store',  [PayRateController::class, 'store'])->name('payrate.store');
    Route::any('payrate/update',  [PayRateController::class, 'update'])->name('payrate.update');
    Route::any('get-all-payrates',  [PayRateController::class, 'getAllPayrate'])->name('get.all.payrates');
    Route::any('get-payrate',  [PayRateController::class, 'getPayrate'])->name('get.payrate');
    Route::any('get-all-archive-payrates',  [PayRateController::class, 'getAllArchivePayrate'])->name('get.all.archive_payrates');
    Route::any('payrate/remove',  [PayRateController::class, 'removePayrate'])->name('payrate.remove');

     // Users
    Route::get('/users', [StaffController::class, 'index']);
    Route::get('/users/online', [StaffController::class, 'getOnlineUsers']);
    Route::get('/users/{id}', [StaffController::class, 'show']);
    Route::post('/users/online-status', [StaffController::class, 'updateOnlineStatus']);
    Route::any('documents-online-verification', [StaffController::class, 'documentsOnlineVerification']);
    Route::any('accept-policy/{id}', [StaffController::class, 'updatePolicyAccepted']);
    Route::any('update-coordinates/{userId}', [StaffController::class, 'updateCurrentCoordinates']);
    
    
    //Staff Forms
    Route::post('/tfn-declaration', [StaffController::class, 'tfnDeclarationStore']);
    Route::post('/superannuation', [StaffController::class, 'superannuationStore']);
    Route::post('/onboarding', [StaffController::class, 'onboardingStore']);

      // Calls
    // Route::prefix('calls')->group(function () {
    //     Route::post('/initiate', [CallController::class, 'initiateCall']);
    //     Route::post('/accept/{callId}', [CallController::class, 'acceptCall']);
    //     Route::post('/reject/{callId}', [CallController::class, 'rejectCall']);
    //     Route::post('/end/{callId}', [CallController::class, 'endCall']);
    //     Route::get('/history', [CallController::class, 'callHistory']);
    //     Route::get('/{callId}', [CallController::class, 'getCallDetails']);
    //     Route::post('/add-participant/{callId}',    [CallController::class, 'addParticipant']);
    //     Route::post('/remove-participant/{callId}', [CallController::class, 'removeParticipant']);
    // });
    Route::prefix('call')->group(function () {
        Route::post('dial',             [CallController::class, 'dial']);
        Route::get('active',            [CallController::class, 'activeCalls']);
        Route::post('hangup',           [CallController::class, 'hangup']);
        Route::post('transfer',         [CallController::class, 'transfer']);
        Route::post('hold',             [CallController::class, 'hold']);
        Route::post('unhold',           [CallController::class, 'unhold']);
        Route::get('records',           [CallController::class, 'records']);
        Route::get('extension/{ext}',   [CallController::class, 'extensionStatus']);
    });
    
    // Messages
    Route::prefix('messages')->group(function () {
        Route::post('/send', [MessageController::class, 'sendMessage']);
        Route::get('/conversations', [MessageController::class, 'getConversations']);
        Route::get('/conversation/{userId}', [MessageController::class, 'getConversation']);
        Route::post('/read/{messageId}', [MessageController::class, 'markAsRead']);
        Route::post('/read-all/{userId}', [MessageController::class, 'markAllAsRead']);
        Route::delete('/{messageId}', [MessageController::class, 'deleteMessage']);
    });
    
    // RTM
    Route::prefix('rtm')->group(function () {
        Route::get('/token', [RtmController::class, 'getToken']);
        Route::post('/message', [RtmController::class, 'sendMessage']);
        Route::get('/conversation/{userId}', [RtmController::class, 'getConversation']);
    });
    
    //create new staff
    Route::any('create-staff',  [StaffController::class, 'createStaff'])->name('create.staff');
    Route::any('update-staff/{id}',  [StaffController::class, 'updateStaff'])->name('update.staff');
    Route::any('guard-all-documents', [StaffController::class, 'getAllGuardDocument'])->name('guard.all.documents');
    Route::any('guard-add-documents', [StaffController::class, 'addGuardDocuments'])->name('guard.add.documents');
    Route::any('add-states/$id', [StaffController::class, 'addDocuments'])->name('add.documents');
    Route::any('remove-states/$id', [StaffController::class, 'deleteDocuments'])->name('delete.documents');
    Route::any('guard-update-documents', [StaffController::class, 'updateGuardDocuments'])->name('guard.update.documents');
    Route::any('user-update/{id}', [StaffController::class, 'updateUser'])->name('user.update');

    //customer and contractor update
    Route::any('customers/{id}/update', [StaffController::class, 'customerUpdate'])->name('customer.update');
    Route::any('user-edit/{id}', [StaffController::class, 'editUser'])->name('user.edit');
    Route::any('get-staff-info/{id}', [StaffController::class, 'getStaffInfo'])->name('get.staff.info');
    Route::any('user-delete/{id}', [StaffController::class, 'deleteUser'])->name('user.delete');
    Route::any('upload-file', [StaffController::class, 'uploadFile'])->name('upload.file');
    Route::any('upload-staff-file', [StaffController::class, 'uploadStaffFile']);
    Route::any('/form-data', [StaffController::class, 'getFormData']);
    
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::any('job-post', [JobRosterController::class, 'jobData'])->name('job.post');
    Route::any('check-state', [JobRosterController::class, 'checkState']);
    Route::post('/calculate-job-amount', [JobRosterController::class, 'calculateJobAmount']);
    Route::any('/confirm_task/{id}', [JobRosterController::class, 'confirm_task']);
    Route::any('/start_task/{id}', [JobRosterController::class, 'start_task']);
    Route::any('/end_task/{id}', [JobRosterController::class, 'end_task']);
    Route::any('/break/{id}', [JobRosterController::class, 'start_break']);
    Route::any('/end_break/{id}', [JobRosterController::class, 'end_break']);
    Route::any('get-guard-payslips', [JobRosterController::class, 'getGuardPayslips']);
    Route::any('get-specific-guard-payslips', [JobRosterController::class, 'getSpecificGuardPayslips']);
    Route::any('auto-update-payslips', [JobRosterController::class, 'autoUpdatePayslipStatus']);
    Route::any('upload-payslips', [JobRosterController::class, 'uploadPayslips']);
    Route::get('/roster/qr-code/{roster_id}', [JobRosterController::class, 'generateQR']);
    Route::post('/roster/handover/scan', [JobRosterController::class, 'scanHandover']);
    Route::any('share-invoice',  [JobRosterController::class, 'sendPdfInvoice']);

    Route::any('/asap-jobs/accept/{id}', [JobRosterController::class, 'accept_asap_job'])->name('accept.asap.job');
    Route::any('/contractor/jobs/accept/{id}', [JobRosterController::class, 'contractor_accept_job']);
    Route::any('/signin/{id}', [JobRosterController::class, 'jobSignin'])->name('job.signin');
    Route::any('/signout/{id}', [JobRosterController::class, 'jobSignout'])->name('job.signout');
    Route::get('/jobs/available/{id}', [JobRosterController::class, 'getAvailableJobs']);

    Route::any('/job-details', [JobRosterController::class, 'getJobsDetail']);
    Route::any('/jobDetails/{id}', [JobRosterController::class, 'jobSpecificDetail'])->name('job.detail');
    Route::any('/guard/jobs/{type}/{duration}', [JobRosterController::class, 'getGuardJobs'])->name('guard.job.detail');
    Route::any('/guard/other/jobs/{type}/{duration}/{id}', [JobRosterController::class, 'getJobs'])->name('guard.job');
    Route::any('/report-incident/{id}', [JobRosterController::class, 'reportIncident']);
    Route::any('/add-foot-patrol-report/{id}', [JobRosterController::class, 'addFootPatrolReport']);
    Route::any('/get-staff/{id}', [JobRosterController::class, 'getStaff'])->name('get.staff');
    Route::any('fetch-customer-sites', [JobRosterController::class, 'fetchCustomerSites'])->name('fetch.customer.sites');
    Route::any('get-contractor-staff/{id}', [JobRosterController::class, 'getContractorStaff'])->name('get.contractor');
    Route::any('get-contractor-active-staff/{id}', [JobRosterController::class, 'getContractorActiveStaff'])->name('get.contractor.active.staff');
    Route::any('update-roster-time', [JobRosterController::class, 'updateRosterTime'])->name('update.roster.time');
    Route::any('job-status-manual-approved', [JobRosterController::class, 'jobStatusManualApproved'])->name('job.status.manual.approved');
    Route::any('generateJobTrackerReport', [ReportController::class, 'generateJobTrackerReport']);
    Route::any('/paysheet', [ReportController::class, 'getPaysheet']);
    Route::any('/paysheet/export', [ReportController::class, 'getPaysheet']);

    // JobRosterActivity
    Route::get('/guard/all-reports', [JobRosterActiviteController::class, 'getAllGuardReports']);
    Route::any('get-jobSignIn-jobSignOut', [JobRosterActiviteController::class, 'JobSignInSignOut'])->name('job.signIn.signout');
    Route::any('guard-break-details', [JobRosterActiviteController::class, 'guardBreakDetails'])->name('guard.break.details');
    Route::any('guard-incident-report', [JobRosterActiviteController::class, 'guardIncidentReport'])->name('guard.incident.report');
    Route::any('guard-foot-patrol-report', [JobRosterActiviteController::class, 'guardFootPatrolReport'])->name('guard.foot_patrol.report');
    Route::any('jobroster-give-rating', [JobRosterActiviteController::class, 'giveRatingJobRoster'])->name('giveRatingJobRoster');
    Route::any('get-jobroster-rating', [JobRosterActiviteController::class, 'getJobrosterRating'])->name('getJobrosterRating');
    Route::any('store-operation-notes', [JobRosterActiviteController::class, 'storeOperationNotes'])->name('store.operation.notes');
    Route::any('get-operation-notes', [JobRosterActiviteController::class, 'getOperationNotes'])->name('get.operation.notes');
    Route::any('get-job-tasks', [JobRosterActiviteController::class, 'getJobTasks'])->name('get.job.tasks');
    Route::any('generate-incident-report', [JobRosterActiviteController::class, 'generateIncidentReport'])->name('guard.incident.report');
    Route::any('generate-foot-report', [JobRosterActiviteController::class, 'generateFootPatrolReport'])->name('guard.incident.report');
    Route::any('generate-shift-report', [JobRosterActiviteController::class, 'generateMasterShiftReport'])->name('guard.incident.report');


    //ContactUs
    Route::get('contact-us/', [ContactUsController::class, 'index']);
    Route::get('contact-us/stats', [ContactUsController::class, 'getStats']);
    Route::get('contact-us/{id}', [ContactUsController::class, 'show']);
    Route::put('contact-us/{id}/status', [ContactUsController::class, 'updateStatus']);
    Route::delete('contact-us/{id}', [ContactUsController::class, 'destroy']);
    Route::post('contact-us/test-email', [ContactUsController::class, 'testEmail']);

    Route::any('get-roaster-hour-sum', [JobRosterController::class, 'getrosterhoursum'])->name('get.roster.hours.sum');

    Route::any('getTimesheet', [JobRosterController::class, 'getTimesheet'])->name('getTimesheet');
    Route::any('get-timesheet-details', [JobRosterController::class, 'getTimeSheetDetails'])->name('get.timesheet.details');

    //Leave Management
    Route::any('getLeaveDetails/{guard_id}', [LeaveManagementController::class, 'getLeaveDetails'])->name('getLeaveDetails');
    Route::any('getPendingLeaveRequests', [LeaveManagementController::class, 'getPendingLeaveRequests'])->name('getPendingLeaveRequests');
    Route::any('addAdminLeaveRequest', [LeaveManagementController::class, 'addAdminLeaveRequest'])->name('addAdminLeaveRequest');
    Route::any('getLeaveGuards', [LeaveManagementController::class, 'getLeaveGuards'])->name('getLeaveGuards');
    Route::any('approveLeave', [LeaveManagementController::class, 'approveLeave'])->name('approveLeave');
    Route::any('guardOnLeave', [LeaveManagementController::class, 'guardOnLeave'])->name('guardOnLeave');
    Route::get('/get-guard-leaves/{guard_id}', [LeaveManagementController::class, 'getGuardLeave']);

    Route::get('user-transactions/{user}', [JobRosterController::class, 'getUserTransactions']);

 
    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/user/{userId}', [NotificationController::class, 'getUserNotifications']);
        Route::get('/unread/{userId}', [NotificationController::class, 'getUnreadCount']);
        Route::post('/read/{id}', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read/{userId}', [NotificationController::class, 'markAllAsRead']);
        Route::post('/send',      [NotificationController::class, 'send']);
        Route::post('/send-self', [NotificationController::class, 'sendSelf']);
    });
    
     //QUESTIONNAIRE
    Route::post('questionnaire-save', [QuestionnaireController::class, 'save']);
    Route::post('assign-questionnaire', [QuestionnaireController::class, 'assignQuestionnair']);
    Route::get('questionnaire-delete/{id}', [QuestionnaireController::class, 'delete']);
    Route::get('questionnaire-list', [QuestionnaireController::class, 'list']);
    Route::any('induction-history/{id}', [QuestionnaireController::class, 'getInductionhistory']);

    # MOBILE APIS
    Route::get('get-questionnaire/{guard_id}', [QuestionnaireController::class, 'getQNA']);
    Route::post('submit-guard-questionnaire', [QuestionnaireController::class, 'submitQNA']);
    Route::post('update-induction-read-status', [QuestionnaireController::class, 'updateReadStatus']);


    Route::prefix('admin')->group(function () {

        Route::get('get-contractors', [ContractorController::class, 'index']);
        Route::get('get-active-contractors', [ContractorController::class, 'activeContractor']);
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

        Route::get('get-staff', [AdminStaffController::class, 'index']);
        Route::get('get-staffoo-staff', [AdminStaffController::class, 'staffooStaff']);
        Route::any('update-staff/{id}',  [AdminStaffController::class, 'updateStaff'])->name('update.staff');
        Route::any('create-staff',  [AdminStaffController::class, 'createStaff'])->name('create.staff');
        Route::delete('staff-delete/{id}', [AdminStaffController::class, 'destroy']);
        Route::any('customers-detail/{id}', [CustomerController::class, 'customerDetail']);

        Route::any('send-invoice',  [JobRosterController::class, 'sendInvoice']);
        Route::get('invoice/history/{transaction_id}', [JobRosterController::class, 'getEmailHistoryByTransaction']);
        
        Route::get('/', [GeneralController::class, 'getAdmins']);
        
        //public holiday
        Route::any('add-public-holiday', [GeneralController::class, 'addPH']);
        Route::any('update-public-holiday', [GeneralController::class, 'updatePH']);
        Route::any('delete-public-holiday', [GeneralController::class, 'deletePH']);
        Route::any('get-public-holiday', [GeneralController::class, 'getPH']);

        Route::post('/visa-check', [VisaController::class, 'create']);
        Route::post('/visa-check-copy', [VisaController::class, 'createCopy']);
        Route::get('/visa-result/{id}', [VisaController::class, 'result']);
        Route::post('/visa-expiry-check', [VisaController::class, 'visaExpiryCheck']);
    });

    Route::prefix('payment')->group(function () {
        Route::post('/hold',    [JobRosterController::class, 'holdPayment']);
        Route::post('/capture', [JobRosterController::class, 'capturePayment']);
        Route::post('/cancel',  [JobRosterController::class, 'cancelHold']);
    });

});

    Route::get('/clear-all-cache', function() {
        try {
            // Clear application cache
            Artisan::call('cache:clear');
            $messages[] = 'Application cache cleared';
            
            // Clear route cache
            Artisan::call('route:clear');
            $messages[] = 'Route cache cleared';
            
            // Clear config cache
            Artisan::call('config:clear');
            $messages[] = 'Config cache cleared';
            
            // Clear view cache
            Artisan::call('view:clear');
            $messages[] = 'View cache cleared';
            
            // Clear compiled files
            Artisan::call('clear-compiled');
            $messages[] = 'Compiled files cleared';
            
            // Optimize (recreate cache)
            Artisan::call('optimize:clear');
            $messages[] = 'Optimization cleared';
            
            return response()->json([
                'status' => 'success',
                'message' => 'All caches cleared successfully',
                'details' => $messages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error clearing cache: ' . $e->getMessage()
            ], 500);
        }
    });

    Route::get('/storage-link', function () {
        try {
            Artisan::call('storage:link');

            return response()->json([
                'success' => true,
                'message' => Artisan::output(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    });
    
    Route::any('/get-all-jobs', [JobRosterController::class, 'getAllJobs'])->name('get.all.jobs');

    Route::post('/agora/token', [AgoraController::class, 'generateToken']);
    Route::post('/agora/channel', [AgoraController::class, 'createChannel']);
    