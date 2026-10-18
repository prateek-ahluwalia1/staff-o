<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationRecipient;
use App\Models\NotificationSetting;
use Illuminate\Http\Request;

/**
 * Superadmin screen: turn any automated WhatsApp notification on/off, and
 * manage the admin phone numbers that get the admin-facing ones (daily
 * summary, payment-completed copy, chat job-request pings) — all without a
 * deploy.
 */
class NotificationSettingsController extends Controller
{
    public function index()
    {
        return response()->json([
            'settings'   => NotificationSetting::orderBy('group')->orderBy('label')->get(),
            'recipients' => NotificationRecipient::orderBy('group_key')->get(),
        ]);
    }

    public function toggleSetting(Request $request, $id)
    {
        $request->validate(['enabled' => 'required|boolean']);

        $setting = NotificationSetting::findOrFail($id);
        $setting->update(['enabled' => $request->boolean('enabled')]);

        return response()->json(['success' => true, 'setting' => $setting]);
    }

    public function storeRecipient(Request $request)
    {
        $data = $request->validate([
            'group_key' => 'required|string',
            'phone'     => 'required|string',
            'label'     => 'nullable|string',
            'enabled'   => 'boolean',
        ]);

        $recipient = NotificationRecipient::create($data + ['enabled' => $data['enabled'] ?? true]);

        return response()->json(['success' => true, 'recipient' => $recipient], 201);
    }

    public function updateRecipient(Request $request, $id)
    {
        $data = $request->validate([
            'group_key' => 'sometimes|string',
            'phone'     => 'sometimes|string',
            'label'     => 'nullable|string',
            'enabled'   => 'sometimes|boolean',
        ]);

        $recipient = NotificationRecipient::findOrFail($id);
        $recipient->update($data);

        return response()->json(['success' => true, 'recipient' => $recipient]);
    }

    public function destroyRecipient($id)
    {
        NotificationRecipient::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }
}
