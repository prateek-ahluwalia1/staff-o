import React, { lazy, useEffect, useRef, useState, useCallback } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
    useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import OneSignal from "react-onesignal";
import { setUser } from "./store/slices/authSlice";
import { toast } from "react-toastify";
import { apiURL } from "./utils/exports";

import ProtectedRoute from "./components/ProtectedRoute";
import NotificationAcceptModal from "./components/NotificationAcceptModal";
import NotificationToast from "./components/NotificationToast";
import { useEcho } from "./hooks/useEcho";
import { logOut } from "./store/slices/authSlice";
import useSubmit from "./hooks/useSubmit";
import useFetch from "./hooks/useFetch";
import GPSGuardTracking from "./pages/features/gps-guard-tracking";
import EventCrowdControl from "./pages/industries/Event-crowd-control";
import RetailSecurity from "./pages/industries/retail-security";
import CorporateOffice from "./pages/industries/corporate-office";
import ConstructionSites from "./pages/industries/construction-sites";
import ResidentialEstates from "./pages/industries/residential-estates";
import WorkingStaff from "./pages/forstaff/working-staff";
import HowToApply from "./pages/forstaff/How-to-apply";
import Postajob from "./pages/forclients/Postajob";
import Howitworks from "./pages/forclients/Howitworks";

const Login = lazy(() => import("./auth/login"));
const Register = lazy(() => import("./auth/register"));
const Home = lazy(() => import("./pages/home"));
const DashboardLayout = lazy(() => import("./components/dashboardlayout"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const EditProfile = lazy(() => import("./pages/edit-profile"));
const PublicProfilePreview = lazy(() => import("./pages/public-profile-view"));
const MyJobApplications = lazy(() => import("./pages/my-job-application"));
const RosterPage = lazy(() => import("./pages/roster"));
const JobAlerts = lazy(() => import("./pages/job-alerts"));
const PaymentHistory = lazy(() => import("./pages/payment-history"));
const PayChargeRate = lazy(() => import("./pages/PayChargerate"));
const RatesList = lazy(() => import("./pages/RatesList"));
const Invoice = lazy(() => import("./pages/Invoice"));
const AddJob = lazy(() => import("./pages/add-job"));
const ManageUsers = lazy(() => import("./pages/manage-users"));
const ManageStaff = lazy(() => import("./pages/manage-staff"));
const ChatPage = lazy(() => import("./pages/Chat"));
const ChatRoom = lazy(() => import("./pages/ChatRoom"));
const AllNotifications = lazy(() => import("./pages/AllNotifications"));
const ContactUs = lazy(() => import("./pages/contact-us"));
const Faqs = lazy(() => import("./pages/faqs"));
const AboutUs = lazy(() => import("./pages/about-us"));
const TermsOfUse = lazy(() => import("./pages/terms-of-use"));
const PrivacyPolicy = lazy(() => import("./pages/privacy-policy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Reports = lazy(() => import("./pages/Reports"));
const TimeSheet = lazy(() => import("./pages/TimeSheet"));
const JobTracker = lazy(() => import("./pages/JobTracker"));
const VisaManagement = lazy(() => import("./pages/VisaManagement"));
const WFMTools = lazy(() => import("./pages/wfm-tools"));
const LeaveManagement = lazy(() => import("./pages/LeaveManagement"));
const PaySlip = lazy(() => import("./pages/PaySlip"));
const Induction = lazy(() => import("./pages/Induction"));
const PublicHolidays = lazy(() => import("./pages/PublicHolidays"));
const PaySheet = lazy(() => import("./pages/PaySheet"));
const StafooStaff = lazy(() => import("./pages/staffooStaff"));
const CoverJobs = lazy(() => import("./pages/CoverJobs"));
const ContractorRates = lazy(() => import("./pages/ContractorRates"));


const ONESIGNAL_APP_ID = "79041c59-5506-4e56-9de4-8a6619f85e1d";

function AppContent() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { token, userdata } = useSelector((state) => state.auth);
    const isInitialMount = useRef(true);
    const oneSignalReadyRef = useRef(false);
    const hasSentCoordinates = useRef(false);
    const userId = userdata?.id ?? userdata?.data?.id;
    const userRole = userdata?.data?.user_type || userdata?.user_type;
    const staffUserId = Number(userdata?.data?.user_id ?? userdata?.user_id ?? userId ?? 0);
    const isStaffTargetUser = userRole === "staff" && staffUserId === 1;
    const isStaffCoverJobsVisible = isStaffTargetUser;
    const canHandleStaffCoverJobs = Boolean(userId && isStaffCoverJobsVisible);
    const { submit: submitAccept } = useSubmit({ isAuth: true });
    const { data: staffData, loading: staffLoading } = useFetch(
        userRole === "contractor" && userId ? `api/get-contractor-active-staff/${userId}` : null,
        { isAuth: true, immediate: Boolean(userRole === "contractor" && userId) }
    );
    const { refetch: updateCoordinates } = useFetch(null, { isAuth: true, immediate: false });
    const contractorStaffOptions = (staffData?.guards || []).map((staff) => ({
        value: String(staff.id),
        label: staff.name || "Unnamed staff",
    }));
    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
    const [acceptModalSuccess, setAcceptModalSuccess] = useState(false);
    const [acceptModalJob, setAcceptModalJob] = useState(null);
    const [acceptingJob, setAcceptingJob] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState("");

    const PENDING_NOTIFICATION_KEY = "pendingJobNotification";
    const PENDING_NOTIFICATION_TTL_MS = 5 * 60 * 1000;

    const persistPendingNotification = (notification) => {
        try {
            localStorage.setItem(
                PENDING_NOTIFICATION_KEY,
                JSON.stringify({ notification, savedAt: Date.now() })
            );
        } catch (e) {
            console.warn("Failed to persist pending notification:", e);
        }
    };

    const consumePendingNotification = () => {
        try {
            const raw = localStorage.getItem(PENDING_NOTIFICATION_KEY);
            if (!raw) return null;
            localStorage.removeItem(PENDING_NOTIFICATION_KEY);
            const parsed = JSON.parse(raw);
            if (!parsed?.savedAt || Date.now() - parsed.savedAt > PENDING_NOTIFICATION_TTL_MS) {
                return null;
            }
            return parsed.notification;
        } catch (e) {
            console.warn("Failed to read pending notification:", e);
            return null;
        }
    };

    const syncNotificationToken = useCallback(
        async (notificationToken) => {
            if (!token || !userId || !notificationToken) return;
            try {
                await fetch(`${apiURL}api/store-notification-token`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        notification_token: notificationToken,
                        id: userId,
                    }),
                });
            } catch (error) {
                console.error("Failed to sync OneSignal token:", error);
            }
        },
        [token, userId]
    );

    const getPlayerIdAsync = useCallback(async () => {
        try {
            const subId = OneSignal.User?.PushSubscription?.id || OneSignal.User?.pushSubscription?.id;
            if (subId) return subId;
            if (OneSignal?.User?.pushSubscription?.getIdAsync) {
                const id = await OneSignal.User.pushSubscription.getIdAsync();
                if (id && typeof id === "string") {
                    const isUrl = id.startsWith("http://") || id.startsWith("https://");
                    if (!isUrl) return id;
                }
            }
        } catch (e) {
            console.warn("OneSignal getIdAsync failed:", e);
        }
        const token = OneSignal.User?.PushSubscription?.token || OneSignal.User?.pushSubscription?.token;
        if (token && typeof token === "string") {
            const isUrl = token.startsWith("http://") || token.startsWith("https://");
            if (!isUrl) return token;
        }
        return OneSignal.User?.onesignalId || null;
    }, []);

    const handlePushSubscriptionChange = useCallback(async () => {
        if (!token || userRole !== "contractor") return;
        const playerId = await getPlayerIdAsync();
        if (playerId) await syncNotificationToken(playerId);
    }, [syncNotificationToken, getPlayerIdAsync]);

    useEcho();
    // ---------- Save coordinates only once (first login) ----------
    useEffect(() => {
        // Exit early if conditions aren't met
        if (
            typeof window === "undefined" ||
            !("geolocation" in navigator) ||
            !token ||
            !(isStaffTargetUser || userRole === "contractor" || userRole === "sub_contractor") ||
            !userId
        ) {
            return;
        }

        // Already sent coordinates in this session? Stop.
        if (hasSentCoordinates.current) return;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await updateCoordinates(`api/update-coordinates/${userId}`, {
                        method: "POST",
                        body: JSON.stringify({
                            current_coordinates: `${position.coords.latitude},${position.coords.longitude}`,
                        }),
                    });
                    hasSentCoordinates.current = true; // mark as sent for this session
                } catch (error) {
                    console.warn("Failed to update staff coordinates on login:", error);
                }
            },
            (error) => {
                console.warn("Geolocation error:", error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    }, [token, isStaffTargetUser, userRole, userId, updateCoordinates]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [location.pathname]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const setupOneSignal = async () => {
            try {
                if (!oneSignalReadyRef.current) {
                    try {
                        await OneSignal.init({
                            appId: ONESIGNAL_APP_ID,
                            serviceWorkerPath: "OneSignalSDKWorker.js",
                            safari_web_id: "web.onesignal.auto.2bc028a8-3e83-466a-979b-b4e85ca9934f",
                            allowLocalhostAsSecureOrigin: true,
                            notifyButton: { enable: true },
                            notificationClickHandlerMatch: "origin",
                            notificationClickHandlerAction: "focus",
                        });
                    } catch (initError) {
                        const message = initError?.message || String(initError || "");
                        if (!message.includes("already initialized")) {
                            throw initError;
                        }
                    }

                    OneSignal.User.PushSubscription.addEventListener(
                        "change",
                        handlePushSubscriptionChange
                    );

                    oneSignalReadyRef.current = true;
                }

                if (token && userId) {
                    await OneSignal.login(String(userId));
                    if (typeof Notification !== "undefined" && Notification.permission === "default") {
                        await OneSignal.Notifications.requestPermission();
                    }

                    try {
                        const playerId = await getPlayerIdAsync();
                        if (playerId) await syncNotificationToken(playerId);
                    } catch (e) {
                        console.warn("Failed to get OneSignal player id after login:", e);
                    }
                } else {
                    await OneSignal.logout();
                }
            } catch (error) {
                console.error("OneSignal setup failed:", error);
            }
        };

        setupOneSignal();
    }, [token, userId, handlePushSubscriptionChange]);

    const playNotificationSound = useCallback(() => {
        if (typeof window === "undefined") return;
        try {
            const audio = new Audio("/sounds/notification.wav");
            audio.volume = 0.6;
            audio.play().catch(() => { });
        } catch (error) {
            console.warn("Notification sound failed:", error);
        }
    }, []);

    const openAcceptModal = useCallback(
        (notification) => {
            const allowedRoles = ["contractor", "resource_partner", ...(canHandleStaffCoverJobs ? ["staff"] : [])];
            if (!userId || !allowedRoles.includes(userRole)) {
                return;
            }

            const additionalData = notification?.additionalData ?? notification?.data ?? {};
            const outerRoster = additionalData?.roster ?? {};
            const innerRoster = outerRoster?.roster ?? {};
            const jobId = innerRoster?.id;

            if (!jobId) {
                console.error("Job already accepted on app.");
                return;
            }

            const startRaw = innerRoster?.start;
            const endRaw = innerRoster?.end;

            // Parse document list
            let documents = [];
            try {
                if (innerRoster?.document_list) {
                    const parsed = JSON.parse(innerRoster.document_list);
                    if (Array.isArray(parsed)) {
                        documents = parsed.map(doc =>
                            doc
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (l) => l.toUpperCase())
                        );
                    }
                }
            } catch (e) {
                // ignore malformed document_list
            }

            const jobPayload = {
                id: jobId,
                siteName:
                    innerRoster?.site?.site_name ||
                    innerRoster?.site_name ||
                    additionalData?.site_name ||
                    "Site",
                address:
                    innerRoster?.site?.address ||
                    innerRoster?.site_address ||
                    additionalData?.address ||
                    "Address not available",
                jobType: innerRoster?.job_type || "N/A",
                shiftCount: outerRoster?.job_count ?? "N/A",
                hours: innerRoster?.hours ?? "N/A",
                jobAmount: innerRoster?.job_amount ?? "N/A",
                contractorInvoice: innerRoster.contractor_invoice,
                date: startRaw
                    ? new Date(startRaw).toLocaleDateString("en-AU")
                    : "TBD",
                startTime: startRaw
                    ? new Date(startRaw).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    })
                    : "—",
                endTime: endRaw
                    ? new Date(endRaw).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    })
                    : "—",
                documents,
            };

            playNotificationSound();
            setSelectedStaffId("");
            setAcceptModalJob(jobPayload);
            setAcceptModalOpen(true);
        },
        [userId, userRole, playNotificationSound, canHandleStaffCoverJobs]
    );

    const handleAcceptJob = useCallback(
        async (jobId, chosenStaffId = "") => {
            setAcceptingJob(true);
            try {
                const payload = chosenStaffId
                    ? { roster_id: jobId, guard_id: Number(chosenStaffId) }
                    : { roster_id: jobId };
                const acceptEndpoint = canHandleStaffCoverJobs && userRole === "staff"
                    ? `api/asap-jobs/accept/${userId}`
                    : `api/contractor/jobs/accept/${userId}`;
                const result = await submitAccept(
                    acceptEndpoint,
                    payload,
                    { method: "POST" }
                );
                if (result && !result.error) {
                    if (acceptModalJob?.contractorInvoice === 0) {
                        setAcceptModalSuccess(true);
                    } else {
                        toast.success(
                            chosenStaffId
                                ? "Job assigned successfully!"
                                : userRole === "staff"
                                    ? "Cover job accepted successfully!"
                                    : "Job accepted successfully!"
                        );
                        setAcceptModalOpen(false);
                        setAcceptModalJob(null);
                        setSelectedStaffId("");
                    }
                }
            } catch (err) {
                console.error("Accept job failed:", err);
            } finally {
                setAcceptingJob(false);
            }
        },
        [submitAccept, userId, userRole, canHandleStaffCoverJobs]
    );

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleNotificationClick = (event) => {
            const notification = event?.notification ?? event;
            if (!notification) {
                console.warn("Notification click received no notification object", event);
                return;
            }

            const additionalData = notification?.additionalData ?? notification?.data ?? {};

            const allowedRoles = ["contractor", "resource_partner", ...(canHandleStaffCoverJobs ? ["staff"] : [])];

            // Only handle job_assign type (or missing page) for our modal
            if (additionalData?.type === "job_assign") {
                if (userId && allowedRoles.includes(userRole)) {
                    openAcceptModal(notification);
                } else if (!userId) {
                    persistPendingNotification(notification);
                }
                return;
            }

            const page = additionalData?.page || additionalData?.route || additionalData?.url;
            if (!page || page === "asap-job-list") {
                if (userId && allowedRoles.includes(userRole)) {
                    openAcceptModal(notification);
                } else if (!userId) {
                    persistPendingNotification(notification);
                }
                return;
            }

            const normalizedPage = String(page).replace(/^\/+/, "");
            navigate(`/${normalizedPage}`);
        };

        const handleForegroundNotification = (event) => {
            const notification = event?.notification ?? event;
            if (!notification) return;

            const allowedRoles = ["contractor", "resource_partner", ...(canHandleStaffCoverJobs ? ["staff"] : [])];

            if (userId && allowedRoles.includes(userRole)) {
                openAcceptModal(notification);
            } else if (!userId) {
                persistPendingNotification(notification);
            }
            event?.preventDefault?.();
        };

        OneSignal.Notifications.addEventListener("click", handleNotificationClick);
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", handleForegroundNotification);

        return () => {
            OneSignal.Notifications.removeEventListener("click", handleNotificationClick);
            OneSignal.Notifications.removeEventListener("foregroundWillDisplay", handleForegroundNotification);
            OneSignal.User.PushSubscription.removeEventListener("change", handlePushSubscriptionChange);
        };
    }, [navigate, userId, userRole, openAcceptModal, canHandleStaffCoverJobs]);

    // ------------------ Consume pending notification after login ------------------
    useEffect(() => {
        const allowedRoles = ["contractor", "resource_partner", ...(canHandleStaffCoverJobs ? ["staff"] : [])];
        if (!userId || !allowedRoles.includes(userRole)) return;

        const pending = consumePendingNotification();
        if (pending) {
            openAcceptModal(pending);
        }
    }, [userId, userRole, openAcceptModal]);

    // ------------------ Session verification on mount ------------------
    useEffect(() => {
        if (!isInitialMount.current) return;
        isInitialMount.current = false;

        const verifySession = async () => {
            if (!token || !userdata) {
                if (token) {
                    sessionStorage.clear();
                    dispatch(logOut());
                }
                return;
            }

            const uid = userdata?.data?.id || userdata?.id;
            if (!uid) {
                sessionStorage.clear();
                dispatch(logOut());
                toast.error("Invalid user session. Please log in again.");
                navigate("/login", { replace: true });
                return;
            }

            try {
                const profileRes = await fetch(`${apiURL}api/user-edit/${uid}`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (profileRes.status === 401) {
                    sessionStorage.clear();
                    dispatch(logOut());
                    toast.error("Session expired. Please log in again.");
                    navigate("/login", { replace: true });
                    return;
                }

                if (!profileRes.ok) {
                    throw new Error(`Session verification failed: ${profileRes.status}`);
                }

                const profileJson = await profileRes.json();
                dispatch(
                    setUser({
                        userdata: profileJson?.data || profileJson?.data?.user || profileJson,
                    })
                );
            } catch (error) {
                console.error("Session verification failed:", error);
                sessionStorage.clear();
                dispatch(logOut());
                toast.error("Session verification failed. Please log in again.");
                navigate("/login", { replace: true });
            }
        };

        verifySession();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <NotificationToast />
            <NotificationAcceptModal
                open={acceptModalOpen}
                job={acceptModalJob}
                onAccept={handleAcceptJob}
                onClose={() => {
                    setAcceptModalOpen(false);
                    setAcceptModalJob(null);
                    setSelectedStaffId("");
                    setAcceptModalSuccess(false);
                }}
                accepting={acceptingJob}
                success={acceptModalSuccess}
                successMessage="Please wait for the client to give further confirmation. We will notify you shortly and the job will appear on your Roster page."
                showStaffSelector={
                    userRole === "contractor" &&
                    acceptModalJob?.contractorInvoice === 1
                }
                staffOptions={contractorStaffOptions}
                selectedStaffId={selectedStaffId}
                onStaffChange={setSelectedStaffId}
                staffLoading={staffLoading}
            />
            <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<ProtectedRoute public><Home /></ProtectedRoute>} />
                <Route path="/public-profile" element={<ProtectedRoute public><PublicProfilePreview /></ProtectedRoute>} />
                <Route path="/faqs" element={<ProtectedRoute public><Faqs /></ProtectedRoute>} />

                {/* industries */}
                <Route path="/industries/event-crowd-control" element={<ProtectedRoute public><EventCrowdControl /></ProtectedRoute>} />
                <Route path="/industries/retail-security" element={<ProtectedRoute public><RetailSecurity /></ProtectedRoute>} />
                <Route path="/industries/corporate-office" element={<ProtectedRoute public><CorporateOffice /></ProtectedRoute>} />
                <Route path="/industries/construction-sites" element={<ProtectedRoute public><ConstructionSites /></ProtectedRoute>} />
                <Route path="/industries/residential-estates" element={<ProtectedRoute public><ResidentialEstates /></ProtectedRoute>} />

                {/* for clients */}
                <Route path="/forclients/postajob" element={<ProtectedRoute public><Postajob /></ProtectedRoute>} />
                <Route path="/forclients/howitworks" element={<ProtectedRoute public><Howitworks /></ProtectedRoute>} />



                {/* for staff */}
                <Route path="/forstaff/working-staff" element={<ProtectedRoute public><WorkingStaff /></ProtectedRoute>} />
                <Route path="/forstaff/how-to-apply" element={<ProtectedRoute public><HowToApply /></ProtectedRoute>} />


                {/* Features */}
                <Route path="/features/gps-guard-tracking" element={<ProtectedRoute public><GPSGuardTracking /></ProtectedRoute>} />

                {/* Catch‑all for resources/features/pricing */}
                <Route path="/resources/:slug" element={<ProtectedRoute public><EventCrowdControl /></ProtectedRoute>} />
                <Route path="/features/:slug" element={<ProtectedRoute public><EventCrowdControl /></ProtectedRoute>} />
                <Route path="/pricing" element={<ProtectedRoute public><EventCrowdControl /></ProtectedRoute>} />

                {/* Company */}
                <Route path="/terms-of-use" element={<ProtectedRoute public><TermsOfUse /></ProtectedRoute>} />
                <Route path="/privacy-policy" element={<ProtectedRoute public><PrivacyPolicy /></ProtectedRoute>} />
                <Route path="/about-us" element={<ProtectedRoute public><AboutUs /></ProtectedRoute>} />
                <Route path="/contact-us" element={<ProtectedRoute public><ContactUs /></ProtectedRoute>} />

                {/* Auth */}
                <Route path="/login" element={<ProtectedRoute guestOnly><Login /></ProtectedRoute>} />
                <Route path="/register" element={<ProtectedRoute guestOnly><Register /></ProtectedRoute>} />

                {/* Protected Layout */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/add-job" element={<AddJob />} />
                    <Route path="/my-job-applications" element={<MyJobApplications />} />
                    <Route path="/job-alerts" element={<JobAlerts />} />
                    <Route path="/roster" element={<ProtectedRoute allowedRoles={["admin", "contractor"]}><RosterPage /></ProtectedRoute>} />
                    <Route path="/manage-users" element={<ProtectedRoute allowedRoles={["admin"]}><ManageUsers /></ProtectedRoute>} />
                    <Route path="/manage-staff" element={<ProtectedRoute allowedRoles={["admin", "contractor"]}><ManageStaff /></ProtectedRoute>} />
                    <Route path="/cover-jobs" element={<ProtectedRoute allowedRoles={['contractor', ...(isStaffCoverJobsVisible ? ['staff'] : [])]}><CoverJobs /></ProtectedRoute>} />
                    <Route path="/payment-history" element={<PaymentHistory />} />
                    <Route path="/pay-charge-rate" element={<PayChargeRate />} />
                    <Route path="/rates/charge" element={<RatesList />} />
                    <Route path="/rates/pay" element={<RatesList />} />
                    <Route path="/rates/contractor" element={<ProtectedRoute allowedRoles={["admin"]}><ContractorRates /></ProtectedRoute>} />
                    <Route path="/wfm-tools" element={<ProtectedRoute allowedRoles={["admin", "contractor"]}><WFMTools /></ProtectedRoute>} />
                    <Route path="/leave" element={<ProtectedRoute allowedRoles={["admin", "contractor"]}><LeaveManagement /></ProtectedRoute>} />
                    <Route path="/holidays" element={<ProtectedRoute allowedRoles={["admin"]}><PublicHolidays /></ProtectedRoute>} />
                    <Route path="/staff-management" element={<ProtectedRoute allowedRoles={["admin"]}><StafooStaff /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute allowedRoles={["admin"]}><Reports /></ProtectedRoute>} />
                    <Route path="/pay-slip" element={<ProtectedRoute allowedRoles={["admin"]}><PaySlip /></ProtectedRoute>} />
                    <Route path="/timesheet" element={<TimeSheet />} />
                    <Route path="/job-tracker" element={<JobTracker />} />
                    <Route path="/pay-sheet" element={<PaySheet />} />
                    <Route path="/visa-management" element={<ProtectedRoute allowedRoles={["admin"]}><VisaManagement /></ProtectedRoute>} />
                    <Route path="/induction" element={<ProtectedRoute allowedRoles={["admin"]}><Induction /></ProtectedRoute>} />
                    <Route path="/accounts/invoice" element={<Invoice />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/chat/:category" element={<ChatRoom />} />
                    <Route path="/notifications" element={<AllNotifications />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <Router>
            <div className="App">
                <AppContent />
            </div>
        </Router>
    );
}