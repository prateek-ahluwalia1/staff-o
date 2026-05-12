import React, { useState } from "react";
import { toast } from "react-toastify";

const TAB_LABELS = ["TFN Declaration", "Superannuation", "Employee Onboarding"];

const SectionTitle = ({ children, className = "" }) => (
    <h6 className={`border-bottom pb-2 mb-3 text-uppercase text-muted fw-bold small ${className}`.trim()}>
        {children}
    </h6>
);

const ActionBar = ({ loading, saveLabel }) => (
    <div className="d-flex justify-content-end pt-3 border-top mt-4">
        <button type="submit" className="btn btn-primary fw-bold px-4" disabled={loading}>
            {loading ? "Saving..." : saveLabel}
        </button>
    </div>
);

const TfnDeclarationForm = ({ values, loading, onChange, onSubmit }) => (
    <form onSubmit={onSubmit} className="animate__animated animate__fadeIn">
        <SectionTitle>Tax File Number</SectionTitle>
        <div className="mb-3">
            <label className="form-label small fw-bold text-muted">TFN <span className="text-danger">*</span></label>
            <input type="text" className="form-control" name="tfn" placeholder="000 000 000" minLength="8" maxLength="11" value={values.tfn} onChange={onChange} required />
        </div>

        <SectionTitle className="mt-4">Personal Details</SectionTitle>
        <div className="row g-3 mb-3">
            <div className="col-md-2">
                <label className="form-label small fw-bold text-muted">Title <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="title" placeholder="Mr/Ms" maxLength="10" value={values.title} onChange={onChange} required />
            </div>
            <div className="col-md-5">
                <label className="form-label small fw-bold text-muted">First Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="first_name" placeholder="Jane" maxLength="50" value={values.first_name} onChange={onChange} required />
            </div>
            <div className="col-md-5">
                <label className="form-label small fw-bold text-muted">Surname <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="surname" placeholder="Smith" maxLength="50" value={values.surname} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Previous Name (if any)</label>
                <input type="text" className="form-control" name="prev_name" placeholder="—" maxLength="50" value={values.prev_name} onChange={onChange} />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Date of Birth <span className="text-danger">*</span></label>
                <input type="date" className="form-control" name="dob" value={values.dob} onChange={onChange} required />
            </div>
        </div>

        <SectionTitle className="mt-4">Residential Address</SectionTitle>
        <div className="mb-3">
            <label className="form-label small fw-bold text-muted">Full Address <span className="text-danger">*</span></label>
            <input type="text" className="form-control" name="address" placeholder="Street address, suburb, state, postcode" maxLength="200" value={values.address} onChange={onChange} required />
        </div>

        <SectionTitle className="mt-4">Employment</SectionTitle>
        <div className="mb-4">
            <label className="form-label small fw-bold text-muted d-block">Basis of payment <span className="text-danger">*</span></label>
            <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="basis" value="full-time" checked={values.basis === "full-time"} onChange={onChange} required />
                <label className="form-check-label">Full-time</label>
            </div>
            <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="basis" value="part-time" checked={values.basis === "part-time"} onChange={onChange} />
                <label className="form-check-label">Part-time</label>
            </div>
            <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="basis" value="casual" checked={values.basis === "casual"} onChange={onChange} />
                <label className="form-check-label">Casual</label>
            </div>
        </div>

        <SectionTitle className="mt-4">Declarations</SectionTitle>
        <div className="row g-3 mb-4">
            <div className="col-md-4">
                <label className="form-label small fw-bold text-muted d-block">Australian resident for tax? <span className="text-danger">*</span></label>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="aus_res" value="yes" checked={values.aus_res === "yes"} onChange={onChange} required />
                    <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="aus_res" value="no" checked={values.aus_res === "no"} onChange={onChange} />
                    <label className="form-check-label">No</label>
                </div>
            </div>
            <div className="col-md-4">
                <label className="form-label small fw-bold text-muted d-block">Claim tax-free threshold? <span className="text-danger">*</span></label>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="threshold" value="yes" checked={values.threshold === "yes"} onChange={onChange} required />
                    <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="threshold" value="no" checked={values.threshold === "no"} onChange={onChange} />
                    <label className="form-check-label">No</label>
                </div>
            </div>
            <div className="col-md-4">
                <label className="form-label small fw-bold text-muted d-block">HELP / VSL / FS / SSL debt? <span className="text-danger">*</span></label>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="help" value="yes" checked={values.help === "yes"} onChange={onChange} required />
                    <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="help" value="no" checked={values.help === "no"} onChange={onChange} />
                    <label className="form-check-label">No</label>
                </div>
            </div>
        </div>

        <SectionTitle className="mt-4">Signature</SectionTitle>
        <div className="row g-3 mb-4">
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Employee Signature <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="sig1" placeholder="Type full name as signature" maxLength="50" value={values.sig1} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Date <span className="text-danger">*</span></label>
                <input type="date" className="form-control" name="date1" value={values.date1} onChange={onChange} required />
            </div>
        </div>

        <ActionBar loading={loading} saveLabel="Save TFN Declaration" />
    </form>
);

const SuperannuationForm = ({ values, loading, onChange, onSubmit }) => (
    <form onSubmit={onSubmit} className="animate__animated animate__fadeIn">
        <SectionTitle>Employee Details</SectionTitle>
        <div className="row g-3 mb-4">
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Full Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="s_name" placeholder="John Doe" maxLength="100" value={values.s_name} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Employee Number</label>
                <input type="text" className="form-control" name="s_empno" placeholder="Optional" maxLength="20" value={values.s_empno} onChange={onChange} />
            </div>
        </div>

        <SectionTitle className="mt-4">Fund Choice <span className="text-danger">*</span></SectionTitle>
        <div className="mb-4">
            <div className="form-check mb-2">
                <input className="form-check-input" type="radio" name="fund_choice" value="own" checked={values.fund_choice === "own"} onChange={onChange} required />
                <label className="form-check-label">I nominate my own fund</label>
            </div>
            <div className="form-check">
                <input className="form-check-input" type="radio" name="fund_choice" value="employer" checked={values.fund_choice === "employer"} onChange={onChange} />
                <label className="form-check-label">Employer-nominated (default)</label>
            </div>
        </div>

        {values.fund_choice === "own" ? (
            <div className="row g-3 mb-4 p-3 bg-light rounded border">
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Fund Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="s_fundname" placeholder="e.g. AustralianSuper" maxLength="100" value={values.s_fundname} onChange={onChange} required={values.fund_choice === "own"} />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Fund ABN <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="s_fundabn" placeholder="12 345 678 901" maxLength="15" value={values.s_fundabn} onChange={onChange} required={values.fund_choice === "own"} />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Fund USI <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="s_usi" placeholder="USI code" maxLength="20" value={values.s_usi} onChange={onChange} required={values.fund_choice === "own"} />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Member Account No. <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="s_member" placeholder="Member no." maxLength="50" value={values.s_member} onChange={onChange} required={values.fund_choice === "own"} />
                </div>
            </div>
        ) : (
            <div className="p-3 bg-light rounded border mb-4 text-muted small">
                <b className="text-dark">Capital Services Pty Ltd</b><br />
                ABN: 48 613 317 838 · 21 Tanglewood Bvd, Truganina VIC 3029
            </div>
        )}

        <SectionTitle className="mt-4">Signature</SectionTitle>
        <div className="row g-3 mb-4">
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Employee Signature <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="sig2" placeholder="Type full name as signature" maxLength="50" value={values.sig2} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Date <span className="text-danger">*</span></label>
                <input type="date" className="form-control" name="date2" value={values.date2} onChange={onChange} required />
            </div>
        </div>

        <ActionBar loading={loading} saveLabel="Save Superannuation" />
    </form>
);

const EmployeeOnboardingForm = ({ values, loading, onChange, onSubmit }) => (
    <form onSubmit={onSubmit} className="animate__animated animate__fadeIn">
        <SectionTitle>Personal Contact Details</SectionTitle>
        <div className="row g-3 mb-4">
            <div className="col-md-12">
                <label className="form-label small fw-bold text-muted">Full Name (as per ID) <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_name" maxLength="100" value={values.o_name} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Date of birth <span className="text-danger">*</span></label>
                <input type="date" className="form-control" name="o_dob" value={values.o_dob} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Residential Address <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_addr" maxLength="200" value={values.o_addr} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Mobile Phone <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_phone" placeholder="04xx xxx xxx" maxLength="15" value={values.o_phone} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Personal Email <span className="text-danger">*</span></label>
                <input type="email" className="form-control" name="o_email" placeholder="jane@email.com" maxLength="100" value={values.o_email} onChange={onChange} required />
            </div>
        </div>

        <SectionTitle>Passport & Work Rights</SectionTitle>
        <div className="row g-3 mb-4">
            <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Passport No. <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_passport" placeholder="PA1234567" maxLength="20" value={values.o_passport} onChange={onChange} required />
            </div>
            <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Country of Issue <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_pcountry" placeholder="Australia" maxLength="50" value={values.o_pcountry} onChange={onChange} required />
            </div>
            <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Passport Expiry <span className="text-danger">*</span></label>
                <input type="date" className="form-control" name="o_pexpiry" value={values.o_pexpiry} onChange={onChange} required />
            </div>
            <div className="col-md-12">
                <label className="form-label small fw-bold text-muted d-block">Work rights status <span className="text-danger">*</span></label>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="work" value="citizen" checked={values.work === "citizen"} onChange={onChange} required />
                    <label className="form-check-label">Australian Citizen / PR</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="work" value="student" checked={values.work === "student"} onChange={onChange} />
                    <label className="form-check-label">Student Visa (24hr cap)</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="work" value="other" checked={values.work === "other"} onChange={onChange} />
                    <label className="form-check-label">Other visa</label>
                </div>
            </div>
        </div>

        <SectionTitle>100-Point ID Check (Attached)</SectionTitle>
        <div className="bg-light p-3 border rounded mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom text-muted small fw-bold">
                <span>Document</span>
                <span>Points</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="form-check mb-0">
                    <input className="form-check-input" type="checkbox" id="chk1" name="chk_primary" checked={values.chk_primary} onChange={onChange} />
                    <label className="form-check-label small" htmlFor="chk1">Birth cert, passport, or citizenship</label>
                </div>
                <span className="badge bg-primary-subtle text-primary">70</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="form-check mb-0">
                    <input className="form-check-input" type="checkbox" id="chk2" name="chk_driver" checked={values.chk_driver} onChange={onChange} />
                    <label className="form-check-label small" htmlFor="chk2">Driver's licence or government photo ID</label>
                </div>
                <span className="badge bg-primary-subtle text-primary">40</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="form-check mb-0">
                    <input className="form-check-input" type="checkbox" id="chk3" name="chk_security" checked={values.chk_security} onChange={onChange} />
                    <label className="form-check-label small" htmlFor="chk3">Security licence (mandatory)</label>
                </div>
                <span className="badge bg-primary-subtle text-primary">40</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <div className="form-check mb-0">
                    <input className="form-check-input" type="checkbox" id="chk4" name="chk_medicare" checked={values.chk_medicare} onChange={onChange} />
                    <label className="form-check-label small" htmlFor="chk4">Medicare card / utility bill / bank statement</label>
                </div>
                <span className="badge bg-primary-subtle text-primary">25</span>
            </div>
        </div>

        <SectionTitle>Banking, Tax & Superannuation</SectionTitle>
        <div className="row g-3 mb-4">
            <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Bank Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_bank" placeholder="Commonwealth Bank" maxLength="100" value={values.o_bank} onChange={onChange} required />
            </div>
            <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">BSB Number <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_bsb" placeholder="062-000" maxLength="7" value={values.o_bsb} onChange={onChange} required />
            </div>
            <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Account Number <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_acct" placeholder="12345678" maxLength="20" value={values.o_acct} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">TFN <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_tfn" minLength="8" maxLength="11" value={values.o_tfn} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Super Fund Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_superfund" maxLength="100" value={values.o_superfund} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Super USI <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_superusi" maxLength="20" value={values.o_superusi} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Member Number <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_member" maxLength="50" value={values.o_member} onChange={onChange} required />
            </div>
        </div>

        <SectionTitle className="mt-4">Professional Licensing</SectionTitle>
        <div className="row g-3 mb-4">
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Security Licence No. <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_seclic" placeholder="VIC 123456" maxLength="50" value={values.o_seclic} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Security Licence Expiry <span className="text-danger">*</span></label>
                <input type="date" className="form-control" name="o_seclicexp" value={values.o_seclicexp} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">First Aid Certificate No. <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="o_fa" placeholder="FA-001234" maxLength="50" value={values.o_fa} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">First Aid Expiry <span className="text-danger">*</span></label>
                <input type="date" className="form-control" name="o_faexp" value={values.o_faexp} onChange={onChange} required />
            </div>
        </div>

        <SectionTitle className="mt-4">Declaration & Signature</SectionTitle>
        <div className="row g-3 mb-4">
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Signature <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="sig3" placeholder="Type full name as signature" maxLength="50" value={values.sig3} onChange={onChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Date <span className="text-danger">*</span></label>
                <input type="date" className="form-control" name="date3" value={values.date3} onChange={onChange} required />
            </div>
        </div>

        <ActionBar loading={loading} saveLabel="Save Onboarding Form" />
    </form>
);

const StaffOnboardingForms = ({ submit, userId }) => {
    const [subTab, setSubTab] = useState(0);
    const [loading, setLoading] = useState(false);

    // 1. TFN Form State
    const [tfnForm, setTfnForm] = useState({
        tfn: "", title: "", first_name: "", surname: "", prev_name: "", dob: "",
        address: "", basis: "casual", aus_res: "yes", threshold: "yes", help: "no",
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
                {TAB_LABELS.map((tab, idx) => (
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
                <TfnDeclarationForm
                    values={tfnForm}
                    loading={loading}
                    onChange={handleTfnChange}
                    onSubmit={(e) => handleFormSubmit(e, 0)}
                />
            )}

            {/* ========================================== */}
            {/* FORM 2: SUPERANNUATION */}
            {/* ========================================== */}
            {subTab === 1 && (
                <SuperannuationForm
                    values={superForm}
                    loading={loading}
                    onChange={handleSuperChange}
                    onSubmit={(e) => handleFormSubmit(e, 1)}
                />
            )}

            {/* ========================================== */}
            {/* FORM 3: EMPLOYEE ONBOARDING */}
            {/* ========================================== */}
            {subTab === 2 && (
                <EmployeeOnboardingForm
                    values={onboardForm}
                    loading={loading}
                    onChange={handleOnboardChange}
                    onSubmit={(e) => handleFormSubmit(e, 2)}
                />
            )}
        </div>
    );
};

export default StaffOnboardingForms;