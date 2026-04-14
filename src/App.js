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
import WelfareCallModal from "./components/WelfareCallModal";
import { useEcho } from "./hooks/useEcho";
import { logOut } from "./store/slices/authSlice";

const Login = lazy(() => import("./auth/login"));
const Register = lazy(() => import("./auth/register"));
const Home = lazy(() => import("./pages/home"));
const LatestJobs = lazy(() => import("./pages/latest-jobs"));
const DashboardLayout = lazy(() => import("./components/dashboardlayout"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const EditProfile = lazy(() => import("./pages/edit-profile"));
const PublicProfilePreview = lazy(() => import("./pages/public-profile-view"));
const MyJobApplications = lazy(() => import("./pages/my-job-application"));
const RosterPage = lazy(() => import("./pages/roster"));
const MyFavouriteJobs = lazy(() => import("./pages/my-favourite-jobs"));
const JobAlerts = lazy(() => import("./pages/job-alerts"));
const MyFollowings = lazy(() => import("./pages/my-followings"));
const UserPackages = lazy(() => import("./pages/user-packages"));
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
const WFMTools = lazy(() => import("./pages/wfm-tools"));
const LeaveManagement = lazy(() => import("./pages/LeaveManagement"));
const CallManagement = lazy(() => import("./pages/callManagement"));
const PaySlip = lazy(() => import("./pages/PaySlip"));

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
      <WelfareCallModal />
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
          path="/latest-jobs"
          element={
            <ProtectedRoute public>
              <LatestJobs />
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
          path="/contact-us"
          element={
            <ProtectedRoute public>
              <ContactUs />
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
        <Route
          path="/about-us"
          element={
            <ProtectedRoute public>
              <AboutUs />
            </ProtectedRoute>
          }
        />
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
          <Route path="/my-favourite-jobs" element={<MyFavouriteJobs />} />
          <Route path="/job-alerts" element={<JobAlerts />} />
          <Route
            path="/roster"
            element={
              <ProtectedRoute allowedRoles={["admin", "contractor", "staff"]}>
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
          <Route path="/my-followings" element={<MyFollowings />} />
          <Route path="/user-packages" element={<UserPackages />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/pay-charge-rate" element={<PayChargeRate />} />
          <Route path="/rates/charge" element={<RatesList />} />
          <Route path="/rates/pay" element={<RatesList />} />
          <Route
            path="/wfm-tools"
            element={
              <ProtectedRoute allowedRoles={["admin", "contractor", "staff"]}>
                <WFMTools />
              </ProtectedRoute>
            }
          />
          <Route path="/welfare-call" element={<CallManagement />} />
          <Route
            path="/leave"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "contractor"]}>
                <LeaveManagement />
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
          <Route path="/accounts/invoice" element={<Invoice />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:category" element={<ChatRoom />} />
          <Route path="/notifications" element={<AllNotifications />} />
        </Route>

        {/* ===== CATCH-ALL ===== */}
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
