import React, { useState } from "react";
import { toast } from "react-toastify";

const StaffOnboardingForms = ({ submit, userId }) => {
    const [subTab, setSubTab] = useState(0);
    const [loading, setLoading] = useState(false);

    // 1. TFN Form State
    const [tfnForm, setTfnForm] = useState({
        tfn: "", title: "", first_name: "", surname: "", prev_name: "", dob: "",
        address: "", basis: "casual", aus_res: "yes", threshold: "yes", help: "yes",
        sig1: "", date1: new Date().toISOString().split('T')[0]
    });

    // 2. Superannuation Form State
    const [superForm, setSuperForm] = useState({
        s_name: "", s_empno: "", fund_choice: "employer", s_fundname: "", s_fundabn: "",
        s_usi: "", s_member: "", sig2: "", date2: new Date().toISOString().split('T')[0]
    });

    // 3. Employee Onboarding Form State
    const [onboardForm, setOnboardForm] = useState({
        o_name: "", o_dob: "", o_addr: "", o_phone: "", o_email: "", o_passport: "",
        o_pcountry: "", o_pexpiry: "", work: "citizen",
        chk_primary: false, chk_driver: false, chk_security: false, chk_medicare: false,
        o_bank: "", o_bsb: "", o_acct: "", o_tfn: "", o_superfund: "", o_superusi: "",
        o_member: "", o_seclic: "", o_seclicexp: "", o_fa: "", o_faexp: "",
        sig3: "", date3: new Date().toISOString().split('T')[0]
    });

    // Change Handlers
    const handleTfnChange = (e) => setTfnForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    const handleSuperChange = (e) => setSuperForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    const handleOnboardChange = (e) => {
        const { name, value, type, checked } = e.target;
        setOnboardForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const handleFormSubmit = async (e, tabIndex) => {
        e.preventDefault();
        if (!userId) return toast.error("User ID missing. Cannot save form.");

        let payload = {};
        let endpoint = "";

        if (tabIndex === 0) {
            endpoint = "api/tfn-declaration";
            payload = {
                user_id: userId, tfn: tfnForm.tfn, title: tfnForm.title, first_name: tfnForm.first_name,
                surname: tfnForm.surname, previous_name: tfnForm.prev_name, dob: tfnForm.dob,
                address: tfnForm.address, basis_of_payment: tfnForm.basis, australian_resident: tfnForm.aus_res,
                claim_threshold: tfnForm.threshold, help_debt: tfnForm.help, signature: tfnForm.sig1, date: tfnForm.date1
            };
        } else if (tabIndex === 1) {
            endpoint = "api/superannuation";
            payload = {
                user_id: userId, full_name: superForm.s_name, employee_number: superForm.s_empno, fund_choice: superForm.fund_choice,
                fund_name: superForm.s_fundname, fund_abn: superForm.s_fundabn, fund_usi: superForm.s_usi,
                member_account: superForm.s_member, signature: superForm.sig2, date: superForm.date2
            };
        } else if (tabIndex === 2) {
            endpoint = "api/onboarding";
            payload = {
                user_id: userId, full_name: onboardForm.o_name, dob: onboardForm.o_dob, address: onboardForm.o_addr,
                mobile: onboardForm.o_phone, email: onboardForm.o_email, passport_number: onboardForm.o_passport,
                passport_country: onboardForm.o_pcountry, passport_expiry: onboardForm.o_pexpiry, work_rights: onboardForm.work,
                id_checks: {
                    primary_id: onboardForm.chk_primary, drivers_license: onboardForm.chk_driver,
                    security_license: onboardForm.chk_security, medicare_or_utility: onboardForm.chk_medicare
                },
                bank_name: onboardForm.o_bank, bsb: onboardForm.o_bsb, account_number: onboardForm.o_acct, tfn: onboardForm.o_tfn,
                super_fund: onboardForm.o_superfund, super_usi: onboardForm.o_superusi, super_member: onboardForm.o_member,
                security_license: onboardForm.o_seclic, security_license_expiry: onboardForm.o_seclicexp,
                first_aid_cert: onboardForm.o_fa, first_aid_expiry: onboardForm.o_faexp, signature: onboardForm.sig3, date: onboardForm.date3
            };
        }

        setLoading(true);
        const res = await submit(endpoint, payload, { method: "POST" });
        setLoading(false);

        if (res?.success) {
            toast.success("Form saved successfully!");
        } else {
            toast.error(res?.message || "Failed to save form");
        }
    };

    return (
        <div className="bg-white rounded p-4 border shadow-sm mt-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Staffoo Onboarding Forms</h4>
                    <span className="text-muted small">Capital Services Pty Ltd &nbsp;·&nbsp; ABN: 48 613 317 838</span>
                </div>
            </div>

            <div className="d-flex gap-2 mb-4 bg-light p-1 rounded-pill border">
                {["TFN Declaration", "Superannuation", "Employee Onboarding"].map((tab, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className={`btn btn-sm rounded-pill flex-grow-1 fw-bold ${subTab === idx ? "btn-primary shadow-sm" : "btn-light text-muted border-0 bg-transparent"}`}
                        onClick={() => setSubTab(idx)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ========================================== */}
            {/* FORM 1: TFN DECLARATION */}
            {/* ========================================== */}
            {subTab === 0 && (
                <form onSubmit={(e) => handleFormSubmit(e, 0)} className="animate__animated animate__fadeIn">
                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small">Tax File Number</h6>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">TFN <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="tfn" placeholder="000 000 000" maxLength="11" value={tfnForm.tfn} onChange={handleTfnChange} required />
                    </div>

                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small mt-4">Personal Details</h6>
                    <div className="row g-3 mb-3">
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-muted">Title <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="title" placeholder="Mr/Ms" value={tfnForm.title} onChange={handleTfnChange} required />
                        </div>
                        <div className="col-md-5">
                            <label className="form-label small fw-bold text-muted">First Name <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="first_name" placeholder="Jane" value={tfnForm.first_name} onChange={handleTfnChange} required />
                        </div>
                        <div className="col-md-5">
                            <label className="form-label small fw-bold text-muted">Surname <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="surname" placeholder="Smith" value={tfnForm.surname} onChange={handleTfnChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Previous Name (if any)</label>
                            <input type="text" className="form-control" name="prev_name" placeholder="—" value={tfnForm.prev_name} onChange={handleTfnChange} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Date of Birth <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" name="dob" value={tfnForm.dob} onChange={handleTfnChange} required />
                        </div>
                    </div>

                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small mt-4">Residential Address</h6>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Full Address <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="address" placeholder="Street address, suburb, state, postcode" value={tfnForm.address} onChange={handleTfnChange} required />
                    </div>

                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small mt-4">Employment</h6>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted d-block">Basis of payment <span className="text-danger">*</span></label>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="basis" value="full-time" checked={tfnForm.basis === "full-time"} onChange={handleTfnChange} required />
                            <label className="form-check-label">Full-time</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="basis" value="part-time" checked={tfnForm.basis === "part-time"} onChange={handleTfnChange} />
                            <label className="form-check-label">Part-time</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="basis" value="casual" checked={tfnForm.basis === "casual"} onChange={handleTfnChange} />
                            <label className="form-check-label">Casual</label>
                        </div>
                    </div>

                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small mt-4">Declarations</h6>
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted d-block">Australian resident for tax? <span className="text-danger">*</span></label>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="aus_res" value="yes" checked={tfnForm.aus_res === "yes"} onChange={handleTfnChange} required />
                                <label className="form-check-label">Yes</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="aus_res" value="no" checked={tfnForm.aus_res === "no"} onChange={handleTfnChange} />
                                <label className="form-check-label">No</label>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted d-block">Claim tax-free threshold? <span className="text-danger">*</span></label>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="threshold" value="yes" checked={tfnForm.threshold === "yes"} onChange={handleTfnChange} required />
                                <label className="form-check-label">Yes</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="threshold" value="no" checked={tfnForm.threshold === "no"} onChange={handleTfnChange} />
                                <label className="form-check-label">No</label>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted d-block">HELP / VSL / FS / SSL debt? <span className="text-danger">*</span></label>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="help" value="yes" checked={tfnForm.help === "yes"} onChange={handleTfnChange} required />
                                <label className="form-check-label">Yes</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="help" value="no" checked={tfnForm.help === "no"} onChange={handleTfnChange} />
                                <label className="form-check-label">No</label>
                            </div>
                        </div>
                    </div>

                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small mt-4">Signature</h6>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Employee Signature <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="sig1" placeholder="Type full name as signature" value={tfnForm.sig1} onChange={handleTfnChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Date <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" name="date1" value={tfnForm.date1} onChange={handleTfnChange} required />
                        </div>
                    </div>

                    <div className="d-flex justify-content-end pt-3 border-top mt-4">
                        <button type="submit" className="btn btn-primary fw-bold px-4" disabled={loading}>
                            {loading ? "Saving..." : "Save TFN Declaration"}
                        </button>
                    </div>
                </form>
            )}

            {/* ========================================== */}
            {/* FORM 2: SUPERANNUATION */}
            {/* ========================================== */}
            {subTab === 1 && (
                <form onSubmit={(e) => handleFormSubmit(e, 1)} className="animate__animated animate__fadeIn">
                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small">Employee Details</h6>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Full Name <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="s_name" placeholder="John Doe" value={superForm.s_name} onChange={handleSuperChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Employee Number</label>
                            <input type="text" className="form-control" name="s_empno" placeholder="Optional" value={superForm.s_empno} onChange={handleSuperChange} />
                        </div>
                    </div>

                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small mt-4">Fund Choice <span className="text-danger">*</span></h6>
                    <div className="mb-4">
                        <div className="form-check mb-2">
                            <input className="form-check-input" type="radio" name="fund_choice" value="own" checked={superForm.fund_choice === "own"} onChange={handleSuperChange} required />
                            <label className="form-check-label">I nominate my own fund</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="fund_choice" value="employer" checked={superForm.fund_choice === "employer"} onChange={handleSuperChange} />
                            <label className="form-check-label">Employer-nominated (default)</label>
                        </div>
                    </div>

                    {superForm.fund_choice === "own" ? (
                        <div className="row g-3 mb-4 p-3 bg-light rounded border">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Fund Name <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" name="s_fundname" placeholder="e.g. AustralianSuper" value={superForm.s_fundname} onChange={handleSuperChange} required={superForm.fund_choice === "own"} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Fund ABN <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" name="s_fundabn" placeholder="12 345 678 901" value={superForm.s_fundabn} onChange={handleSuperChange} required={superForm.fund_choice === "own"} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Fund USI <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" name="s_usi" placeholder="USI code" value={superForm.s_usi} onChange={handleSuperChange} required={superForm.fund_choice === "own"} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Member Account No. <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" name="s_member" placeholder="Member no." value={superForm.s_member} onChange={handleSuperChange} required={superForm.fund_choice === "own"} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 bg-light rounded border mb-4 text-muted small">
                            <b className="text-dark">Capital Services Pty Ltd</b><br />
                            ABN: 48 613 317 838 · 21 Tanglewood Bvd, Truganina VIC 3029
                        </div>
                    )}

                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small mt-4">Signature</h6>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Employee Signature <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="sig2" placeholder="Type full name as signature" value={superForm.sig2} onChange={handleSuperChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Date <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" name="date2" value={superForm.date2} onChange={handleSuperChange} required />
                        </div>
                    </div>

                    <div className="d-flex justify-content-end pt-3 border-top mt-4">
                        <button type="submit" className="btn btn-primary fw-bold px-4" disabled={loading}>
                            {loading ? "Saving..." : "Save Superannuation"}
                        </button>
                    </div>
                </form>
            )}

            {/* ========================================== */}
            {/* FORM 3: EMPLOYEE ONBOARDING */}
            {/* ========================================== */}
            {subTab === 2 && (
                <form onSubmit={(e) => handleFormSubmit(e, 2)} className="animate__animated animate__fadeIn">
                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small">Personal Contact Details</h6>
                    <div className="row g-3 mb-4">
                        <div className="col-md-12">
                            <label className="form-label small fw-bold text-muted">Full Name (as per ID) <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_name" value={onboardForm.o_name} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Date of birth <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" name="o_dob" value={onboardForm.o_dob} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Residential Address <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_addr" value={onboardForm.o_addr} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Mobile Phone <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_phone" placeholder="04xx xxx xxx" value={onboardForm.o_phone} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Personal Email <span className="text-danger">*</span></label>
                            <input type="email" className="form-control" name="o_email" placeholder="jane@email.com" value={onboardForm.o_email} onChange={handleOnboardChange} required />
                        </div>
                    </div>

                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small">Passport & Work Rights</h6>
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted">Passport No. <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_passport" placeholder="PA1234567" value={onboardForm.o_passport} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted">Country of Issue <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_pcountry" placeholder="Australia" value={onboardForm.o_pcountry} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted">Passport Expiry <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" name="o_pexpiry" value={onboardForm.o_pexpiry} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label small fw-bold text-muted d-block">Work rights status <span className="text-danger">*</span></label>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="work" value="citizen" checked={onboardForm.work === "citizen"} onChange={handleOnboardChange} required />
                                <label className="form-check-label">Australian Citizen / PR</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="work" value="student" checked={onboardForm.work === "student"} onChange={handleOnboardChange} />
                                <label className="form-check-label">Student Visa (24hr cap)</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="work" value="other" checked={onboardForm.work === "other"} onChange={handleOnboardChange} />
                                <label className="form-check-label">Other visa</label>
                            </div>
                        </div>
                    </div>

                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small">100-Point ID Check (Attached)</h6>
                    <div className="bg-light p-3 border rounded mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom text-muted small fw-bold">
                            <span>Document</span>
                            <span>Points</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="form-check mb-0">
                                <input className="form-check-input" type="checkbox" id="chk1" name="chk_primary" checked={onboardForm.chk_primary} onChange={handleOnboardChange} />
                                <label className="form-check-label small" htmlFor="chk1">Birth cert, passport, or citizenship</label>
                            </div>
                            <span className="badge bg-primary-subtle text-primary">70</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="form-check mb-0">
                                <input className="form-check-input" type="checkbox" id="chk2" name="chk_driver" checked={onboardForm.chk_driver} onChange={handleOnboardChange} />
                                <label className="form-check-label small" htmlFor="chk2">Driver's licence or government photo ID</label>
                            </div>
                            <span className="badge bg-primary-subtle text-primary">40</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="form-check mb-0">
                                <input className="form-check-input" type="checkbox" id="chk3" name="chk_security" checked={onboardForm.chk_security} onChange={handleOnboardChange} />
                                <label className="form-check-label small" htmlFor="chk3">Security licence (mandatory)</label>
                            </div>
                            <span className="badge bg-primary-subtle text-primary">40</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="form-check mb-0">
                                <input className="form-check-input" type="checkbox" id="chk4" name="chk_medicare" checked={onboardForm.chk_medicare} onChange={handleOnboardChange} />
                                <label className="form-check-label small" htmlFor="chk4">Medicare card / utility bill / bank statement</label>
                            </div>
                            <span className="badge bg-primary-subtle text-primary">25</span>
                        </div>
                    </div>

                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small">Banking, Tax & Superannuation</h6>
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted">Bank Name <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_bank" placeholder="Commonwealth Bank" value={onboardForm.o_bank} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted">BSB Number <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_bsb" placeholder="062-000" maxLength="7" value={onboardForm.o_bsb} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted">Account Number <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_acct" placeholder="12345678" value={onboardForm.o_acct} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">TFN <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_tfn" value={onboardForm.o_tfn} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Super Fund Name <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_superfund" value={onboardForm.o_superfund} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Super USI <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_superusi" value={onboardForm.o_superusi} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Member Number <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_member" value={onboardForm.o_member} onChange={handleOnboardChange} required />
                        </div>
                    </div>

                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small mt-4">Professional Licensing</h6>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Security Licence No. <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_seclic" placeholder="VIC 123456" value={onboardForm.o_seclic} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Security Licence Expiry <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" name="o_seclicexp" value={onboardForm.o_seclicexp} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">First Aid Certificate No. <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="o_fa" placeholder="FA-001234" value={onboardForm.o_fa} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">First Aid Expiry <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" name="o_faexp" value={onboardForm.o_faexp} onChange={handleOnboardChange} required />
                        </div>
                    </div>

                    <h6 className="border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small mt-4">Declaration & Signature</h6>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Signature <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="sig3" placeholder="Type full name as signature" value={onboardForm.sig3} onChange={handleOnboardChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Date <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" name="date3" value={onboardForm.date3} onChange={handleOnboardChange} required />
                        </div>
                    </div>

                    <div className="d-flex justify-content-end pt-3 border-top mt-4">
                        <button type="submit" className="btn btn-primary fw-bold px-4" disabled={loading}>
                            {loading ? "Saving..." : "Save Onboarding Form"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default StaffOnboardingForms;