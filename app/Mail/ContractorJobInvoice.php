<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContractorJobInvoice extends Mailable
{
    use Queueable, SerializesModels;

    public array $invoiceData;

    /**
     * @param array $invoiceData Shape:
     *  [
     *      'contractor_name'    => string,
     *      'contractor_company' => string|null,
     *      'contractor_email'   => string|null,
     *      'contractor_phone'   => string|null,
     *      'contractor_abn'     => string|null,
     *      'guard_name'         => string,
     *      'roster'             => object (job_rosters + sites row),
     *  ]
     */
    public function __construct(array $invoiceData)
    {
        $this->invoiceData = $invoiceData;
    }

    public function build()
    {
        return $this->subject('Job Invoice - ' . ($this->invoiceData['contractor_name'] ?? 'Resource Partner'))
            ->view('emails.contractor-job-invoice')
            ->with('invoiceData', $this->invoiceData);
    }
}