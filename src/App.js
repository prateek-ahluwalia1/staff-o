import React, { lazy, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
    useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./store/slices/authSlice";
import { toast } from "react-toastify";
import { apiURL } from "./utils/exports";

import ProtectedRoute from "./components/ProtectedRoute";
import NotificationToast from "./components/NotificationToast";
import { useEcho } from "./hooks/useEcho";
import { logOut } from "./store/slices/authSlice";
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
// const DynamicPage = lazy(() => import("./pages/DynamicPage"));
// const EventSecurity = lazy(() => import("./pages/solutions/event-security"));
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

function AppContent() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { token, userdata } = useSelector((state) => state.auth);
    const isInitialMount = React.useRef(true);

    useEcho();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [location.pathname]);

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

            const userId = userdata?.data?.id || userdata?.id;
            if (!userId) {
                dispatch(logOut());
                toast.error("Invalid user session. Please log in again.");
                navigate("/login", { replace: true });
                return;
            }

            try {
                const profileRes = await fetch(`${apiURL}api/user-edit/${userId}`, {
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
                        userdata:
                            profileJson?.data || profileJson?.data?.user || profileJson,
                    }),
                );
            } catch (error) {
                console.error("Session verification failed:", error);
                dispatch(logOut());
                toast.error("Session verification failed. Please log in again.");
                navigate("/login", { replace: true });
            }
        };

        verifySession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <>
            <NotificationToast />
            <Routes>
                {/* ===== PUBLIC ROUTES ===== */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute public>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/public-profile"
                    element={
                        <ProtectedRoute public>
                            <PublicProfilePreview />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/faqs"
                    element={
                        <ProtectedRoute public>
                            <Faqs />
                        </ProtectedRoute>
                    }
                />


                {/* solutions screen */}
                <>
                    <Route
                        path="/solutions/event-security"
                        element={
                            <ProtectedRoute public>
                                <EventSecurityHero />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/solutions/retail-security"
                        element={
                            <ProtectedRoute public>
                                <RetailSecurity />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/solutions/warehouse-logistics-security"
                        element={
                            <ProtectedRoute public>
                                <WarehouseLogisticsSecurity />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/solutions/corporate-security"
                        element={
                            <ProtectedRoute public>
                                <CorporateSecurity />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/solutions/government-security"
                        element={
                            <ProtectedRoute public>
                                <GovernmentSecurity />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/solutions/healthcare-security"
                        element={
                            <ProtectedRoute public>
                                <HealthcareSecurity />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/solutions/transport-security"
                        element={
                            <ProtectedRoute public>
                                <TransportSecurity />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/solutions/aviation-security"
                        element={
                            <ProtectedRoute public>
                                <AviationSecurity />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/solutions/for-security-companies"
                        element={
                            <ProtectedRoute public>
                                <ForSecurityCompanies />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/solutions/for-security-guards"
                        element={
                            <ProtectedRoute public>
                                <ForSecurityGuards />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/solutions/security-subcontractors"
                        element={
                            <ProtectedRoute public>
                                <SecuritySubcontractors />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/solutions/hire-security-staff"
                        element={
                            <ProtectedRoute public>
                                <HireSecurityStaff />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/solutions/for-event-security-providers"
                        element={
                            <ProtectedRoute public>
                                <EventSecurityProviders />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/solutions/for-corporate-security-teams"
                        element={
                            <ProtectedRoute public>
                                <CorporateSecurityTeams />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/solutions/for-labour-hire-agencies"
                        element={
                            <ProtectedRoute public>
                                <LabourHireAgencies />
                            </ProtectedRoute>
                        }
                    />


                </>


                {/* Features screens routs */}
                <>
                    <Route
                        path="/features/gps-guard-tracking"
                        element={
                            <ProtectedRoute public>
                                <GPSGuardTracking />
                            </ProtectedRoute>
                        }
                    />




                </>


                <Route
                    path="/resources/:slug"
                    element={
                        <ProtectedRoute public>
                            < EventSecurityHero />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/features/:slug"
                    element={
                        <ProtectedRoute public>
                            < EventSecurityHero />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/pricing"
                    element={
                        <ProtectedRoute public>
                            < EventSecurityHero />
                        </ProtectedRoute>
                    }
                />

                {/* company rounts */}
                <>
                    <Route
                        path="/terms-of-use"
                        element={
                            <ProtectedRoute public>
                                <TermsOfUse />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/privacy-policy"
                        element={
                            <ProtectedRoute public>
                                <PrivacyPolicy />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="about-us"
                        element={
                            <ProtectedRoute public>
                                <AboutUs />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/contact-us"
                        element={
                            <ProtectedRoute public>
                                <ContactUs />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/careers"
                        element={
                            <ProtectedRoute public>
                                <Careers />
                            </ProtectedRoute>
                        }
                    />
                </>


                {/* ===== AUTHENTICATION ROUTES ===== */}
                <Route
                    path="/login"
                    element={
                        <ProtectedRoute guestOnly>
                            <Login />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <ProtectedRoute guestOnly>
                            <Register />
                        </ProtectedRoute>
                    }
                />

                {/* ===== PROTECTED ROUTES ===== */}
                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/add-job" element={<AddJob />} />
                    <Route path="/my-job-applications" element={<MyJobApplications />} />
                    <Route path="/job-alerts" element={<JobAlerts />} />
                    <Route
                        path="/roster"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "contractor"]}>
                                <RosterPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/manage-users"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <ManageUsers />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/manage-staff"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "contractor"]}>
                                <ManageStaff />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/payment-history" element={<PaymentHistory />} />
                    <Route path="/pay-charge-rate" element={<PayChargeRate />} />
                    <Route path="/rates/charge" element={<RatesList />} />
                    <Route path="/rates/pay" element={<RatesList />} />
                    <Route
                        path="/wfm-tools"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "contractor"]}>
                                <WFMTools />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/leave"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "contractor"]}>
                                <LeaveManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/holidays"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <PublicHolidays />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/staff-management"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <StafooStaff />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <Reports />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pay-slip"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <PaySlip />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/timesheet" element={<TimeSheet />} />
                    <Route path="/job-tracker" element={<JobTracker />} />
                    <Route path="/pay-sheet" element={<PaySheet />} />
                    <Route
                        path="/visa-management"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <VisaManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/induction"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <Induction />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/accounts/invoice" element={<Invoice />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/chat/:category" element={<ChatRoom />} />
                    <Route path="/notifications" element={<AllNotifications />} />
                </Route>

                {/* ===== CATCH-ALL ===== */}
                {/* <Route path="*" element={
                    <NotFound />
                } /> */}
                <Route path="*" element={
                    <NotFound />
                } />
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
};
