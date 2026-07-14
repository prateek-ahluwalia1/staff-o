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
import RetailSecurity from "./pages/solutions/retail-security";
import Careers from "./pages/career";
import WarehouseLogisticsSecurity from "./pages/solutions/warehouse-logistics-security";
import CorporateSecurity from "./pages/solutions/corporate-security";
import GovernmentSecurity from "./pages/solutions/government-security";
import HealthcareSecurity from "./pages/solutions/healthcare-security";
import TransportSecurity from "./pages/solutions/transport-security";
import AviationSecurity from "./pages/solutions/aviation-security";
import ForSecurityCompanies from "./pages/solutions/for-security-companies";
import ForSecurityGuards from "./pages/solutions/for-security-guards";
import SecuritySubcontractors from "./pages/solutions/security-subcontractors";
import HireSecurityStaff from "./pages/solutions/hire-security-staff";
import EventSecurityProviders from "./pages/solutions/for-event-security-providers";
import CorporateSecurityTeams from "./pages/solutions/for-corporate-security-teams";
import LabourHireAgencies from "./pages/solutions/for-labour-hire-agencies";
import GPSGuardTracking from "./pages/features/gps-guard-tracking";
import EventSecurityHero from "./pages/solutions/event-security";

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

const ONESIGNAL_APP_ID = "79041c59-5506-4e56-9de4-8a6619f85e1d";

function AppContent() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { token, userdata } = useSelector((state) => state.auth);
    const isInitialMount = useRef(true);
    const oneSignalReadyRef = useRef(false);
    const userId = userdata?.id ?? userdata?.data?.id;
    const userRole = userdata?.data?.user_type || userdata?.user_type;
    const { submit: submitAccept } = useSubmit({ isAuth: true });

    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
    const [acceptModalJob, setAcceptModalJob] = useState(null);
    const [acceptingJob, setAcceptingJob] = useState(false);

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

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [location.pathname]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const setupOneSignal = async () => {
            try {
                if (!oneSignalReadyRef.current) {
                    await OneSignal.init({
                        appId: ONESIGNAL_APP_ID,
                        serviceWorkerPath: "OneSignalSDKWorker.js",
                        safari_web_id: "web.onesignal.auto.2bc028a8-3e83-466a-979b-b4e85ca9934f",
                        allowLocalhostAsSecureOrigin: true,
                        notifyButton: { enable: true },
                        notificationClickHandlerMatch: "origin",
                        notificationClickHandlerAction: "focus",
                    });

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
            // Only contractor / resource_partner
            if (!userId || (userRole !== "contractor" && userRole !== "resource_partner")) {
                return;
            }

            const additionalData = notification?.additionalData ?? notification?.data ?? {};
            const outerRoster = additionalData?.roster ?? {};
            const innerRoster = outerRoster?.roster ?? {};
            const jobId = innerRoster?.id;

            if (!jobId) {
                toast.error("Job already accepted on app.");
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
            setAcceptModalJob(jobPayload);
            setAcceptModalOpen(true);
        },
        [userId, userRole, playNotificationSound]
    );

    const handleAcceptJob = useCallback(
        async (jobId) => {
            setAcceptingJob(true);
            try {
                const payload = { roster_id: jobId };
                const result = await submitAccept(
                    `api/contractor/jobs/accept/${userId}`,
                    payload,
                    { method: "POST" }
                );
                if (result && !result.error) {
                    toast.success("Job accepted successfully!");
                    setAcceptModalOpen(false);
                    setAcceptModalJob(null);
                }
            } catch (err) {
                console.error("Accept job failed:", err);
            } finally {
                setAcceptingJob(false);
            }
        },
        [submitAccept, userId]
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

            // Only handle job_assign type (or missing page) for our modal
            if (additionalData?.type === "job_assign") {
                if (userId && userRole === "contractor") {
                    openAcceptModal(notification);
                } else if (!userId) {
                    persistPendingNotification(notification);
                }
                return;
            }

            const page = additionalData?.page || additionalData?.route || additionalData?.url;
            if (!page || page === "asap-job-list") {
                if (userId && userRole === "contractor") {
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

            // Only allow accept modal for allowed roles
            if (userId && userRole === "contractor") {
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
    }, [navigate, userId, userRole, openAcceptModal]);

    // ------------------ Consume pending notification after login ------------------
    useEffect(() => {
        if (!userId || userRole !== "contractor") return;

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
                    dispatch(logOut());
                }
                return;
            }

            const uid = userdata?.data?.id || userdata?.id;
            if (!uid) {
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
                }}
                accepting={acceptingJob}
            />
            <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<ProtectedRoute public><Home /></ProtectedRoute>} />
                <Route path="/public-profile" element={<ProtectedRoute public><PublicProfilePreview /></ProtectedRoute>} />
                <Route path="/faqs" element={<ProtectedRoute public><Faqs /></ProtectedRoute>} />

                {/* Solutions */}
                <Route path="/solutions/event-security" element={<ProtectedRoute public><EventSecurityHero /></ProtectedRoute>} />
                <Route path="/solutions/retail-security" element={<ProtectedRoute public><RetailSecurity /></ProtectedRoute>} />
                <Route path="/solutions/warehouse-logistics-security" element={<ProtectedRoute public><WarehouseLogisticsSecurity /></ProtectedRoute>} />
                <Route path="/solutions/corporate-security" element={<ProtectedRoute public><CorporateSecurity /></ProtectedRoute>} />
                <Route path="/solutions/government-security" element={<ProtectedRoute public><GovernmentSecurity /></ProtectedRoute>} />
                <Route path="/solutions/healthcare-security" element={<ProtectedRoute public><HealthcareSecurity /></ProtectedRoute>} />
                <Route path="/solutions/transport-security" element={<ProtectedRoute public><TransportSecurity /></ProtectedRoute>} />
                <Route path="/solutions/aviation-security" element={<ProtectedRoute public><AviationSecurity /></ProtectedRoute>} />
                <Route path="/solutions/for-security-companies" element={<ProtectedRoute public><ForSecurityCompanies /></ProtectedRoute>} />
                <Route path="/solutions/for-security-guards" element={<ProtectedRoute public><ForSecurityGuards /></ProtectedRoute>} />
                <Route path="/solutions/security-subcontractors" element={<ProtectedRoute public><SecuritySubcontractors /></ProtectedRoute>} />
                <Route path="/solutions/hire-security-staff" element={<ProtectedRoute public><HireSecurityStaff /></ProtectedRoute>} />
                <Route path="/solutions/for-event-security-providers" element={<ProtectedRoute public><EventSecurityProviders /></ProtectedRoute>} />
                <Route path="/solutions/for-corporate-security-teams" element={<ProtectedRoute public><CorporateSecurityTeams /></ProtectedRoute>} />
                <Route path="/solutions/for-labour-hire-agencies" element={<ProtectedRoute public><LabourHireAgencies /></ProtectedRoute>} />

                {/* Features */}
                <Route path="/features/gps-guard-tracking" element={<ProtectedRoute public><GPSGuardTracking /></ProtectedRoute>} />

                {/* Catch‑all for resources/features/pricing */}
                <Route path="/resources/:slug" element={<ProtectedRoute public><EventSecurityHero /></ProtectedRoute>} />
                <Route path="/features/:slug" element={<ProtectedRoute public><EventSecurityHero /></ProtectedRoute>} />
                <Route path="/pricing" element={<ProtectedRoute public><EventSecurityHero /></ProtectedRoute>} />

                {/* Company */}
                <Route path="/terms-of-use" element={<ProtectedRoute public><TermsOfUse /></ProtectedRoute>} />
                <Route path="/privacy-policy" element={<ProtectedRoute public><PrivacyPolicy /></ProtectedRoute>} />
                <Route path="/about-us" element={<ProtectedRoute public><AboutUs /></ProtectedRoute>} />
                <Route path="/contact-us" element={<ProtectedRoute public><ContactUs /></ProtectedRoute>} />
                <Route path="/careers" element={<ProtectedRoute public><Careers /></ProtectedRoute>} />

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
                    <Route path="/cover-jobs" element={<ProtectedRoute allowedRoles={["contractor"]}><CoverJobs /></ProtectedRoute>} />
                    <Route path="/payment-history" element={<PaymentHistory />} />
                    <Route path="/pay-charge-rate" element={<PayChargeRate />} />
                    <Route path="/rates/charge" element={<RatesList />} />
                    <Route path="/rates/pay" element={<RatesList />} />
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