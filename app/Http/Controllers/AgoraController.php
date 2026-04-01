<?php

namespace App\Http\Controllers;

use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use Peterujah\Agora\Agora;
use Peterujah\Agora\User;
use Peterujah\Agora\Roles;
use Peterujah\Agora\Builders\RtcToken;

class AgoraController extends Controller
{
    public function generateToken(Request $request)
    {
        $request->validate([
            'channel_name' => 'required|string',
            'uid'          => 'required|integer',
        ]);

        $maxTokenLive      = 3600; // 1 hour
        $currentTimestamp  = (new DateTime("now", new DateTimeZone('UTC')))->getTimestamp();
        $privilegeExpiredTs = $currentTimestamp + $maxTokenLive;

        // Initialize Agora client with App ID and Certificate
        $client = new Agora(
            env('AGORA_APP_ID'),
            env('AGORA_APP_CERTIFICATE')
        );
        $client->setExpiration($privilegeExpiredTs);

        // Build the user object
        $user = (new User($request->uid))
            ->setPrivilegeExpire($privilegeExpiredTs)
            ->setChannel($request->channel_name)
            ->setRole(Roles::RTC_PUBLISHER);

        // Generate RTC token (AccessToken v007)
        $token = RtcToken::buildTokenWithUid($client, $user);

        return response()->json([
            'token'        => $token,
            'channel_name' => $request->channel_name,
            'uid'          => (int) $request->uid,
            'app_id'       => env('AGORA_APP_ID'),
        ]);
    }
}