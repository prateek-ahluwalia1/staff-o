<?php

namespace App\Services;

use App\Models\Questionnaire;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InductionAssignmentService
{
    /**
     * Assign every induction of the given audience type ("staff" or
     * "resource_partner") to a user, skipping anything already assigned.
     *
     * Called at the moment a staff account is registered (by itself, or by
     * an admin creating a "Staffoo staff" record) and at the moment a
     * contractor (resource partner) account is registered, so each new
     * account only ever gets the inductions meant for its audience.
     */
    public static function assignToUser(int $userId, string $type = 'staff', string $state = 'Victoria'): void
    {
        $inductions = Questionnaire::where('type', $type)->get();

        if ($inductions->isEmpty()) {
            return;
        }

        $alreadyAssignedIds = DB::table('guard_questionnaire_details')
            ->where('guard_id', $userId)
            ->pluck('questionnaire_id')
            ->toArray();

        $now = Carbon::now();
        $inductionHistoryData = [];
        $guardQuestionnaireDetailsData = [];

        foreach ($inductions as $induction) {
            if (in_array($induction->id, $alreadyAssignedIds)) {
                continue;
            }

            $inductionHistoryData[] = [
                'guard_id' => $userId,
                'induction_id' => $induction->id,
                'state' => $state,
                'read_status' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $guardQuestionnaireDetailsData[] = [
                'guard_id' => $userId,
                'questionnaire_id' => $induction->id,
                'marks' => 0,
                'answers' => null,
                'certificate_path' => null,
                'expiry_date' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($inductionHistoryData)) {
            DB::table('induction_history')->insert($inductionHistoryData);
        }
        if (!empty($guardQuestionnaireDetailsData)) {
            DB::table('guard_questionnaire_details')->insert($guardQuestionnaireDetailsData);
        }
    }

    /**
     * Whether a user has cleared every induction assigned to them for the
     * given audience type (marks >= 80 on each). Returns true when nothing
     * is assigned yet, so existing accounts created before this feature
     * aren't retroactively blocked — it only gates once an induction has
     * actually been handed to them.
     */
    public static function hasCompletedRequiredInductions(int $userId, string $type = 'staff'): bool
    {
        $incomplete = DB::table('guard_questionnaire_details')
            ->join('questionnaires', 'questionnaires.id', '=', 'guard_questionnaire_details.questionnaire_id')
            ->where('guard_questionnaire_details.guard_id', $userId)
            ->where('questionnaires.type', $type)
            ->where('guard_questionnaire_details.marks', '<', 80)
            ->exists();

        return !$incomplete;
    }
}