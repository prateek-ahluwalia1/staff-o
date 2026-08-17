<?php

use App\Http\Controllers\Api\StripeWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});
Route::get('emails/pay/{rosterId}', [StripeWebhookController::class, 'redirectToPay'])->name('invoice.pay');
Route::get('emails/already-paid/{rosterId}', [StripeWebhookController::class, 'alreadyPaid'])->name('invoice-already-paid');