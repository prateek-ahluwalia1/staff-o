import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";
import NotificationToast from "./components/NotificationToast";
import { useEcho } from "./hooks/useEcho";

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

function App() {
  useEcho();

  return (
    <Router>
      <div className="App">
        <NotificationToast />
        <Suspense fallback={<Loader fullPage />}>
          <Routes>
            {/* Root redirect - goes to home for public access or login for unauthenticated flow */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* ===== PUBLIC ROUTES - Accessible without authentication ===== */}
            <Route
              path="/home"
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

            {/* ===== AUTHENTICATION ROUTES - Guest-only (redirects authenticated users) ===== */}
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

            {/* ===== PROTECTED ROUTES - Requires authentication ===== */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard & Profile */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/edit-profile" element={<EditProfile />} />

              {/* Job Management */}
              <Route path="/add-job" element={<AddJob />} />
              <Route
                path="/my-job-applications"
                element={<MyJobApplications />}
              />
              <Route path="/my-favourite-jobs" element={<MyFavouriteJobs />} />
              <Route path="/job-alerts" element={<JobAlerts />} />

              {/* User & Staff Management */}
              <Route path="/roster" element={<RosterPage />} />
              <Route path="/manage-users" element={<ManageUsers />} />
              <Route path="/manage-staff" element={<ManageStaff />} />
              <Route path="/my-followings" element={<MyFollowings />} />

              {/* Packages & Payments */}
              <Route path="/user-packages" element={<UserPackages />} />
              <Route path="/payment-history" element={<PaymentHistory />} />
              <Route path="/pay-charge-rate" element={<PayChargeRate />} />
              <Route path="/rates/charge" element={<RatesList />} />
              <Route path="/rates/pay" element={<RatesList />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/timesheet" element={<TimeSheet />} />
              <Route path="/job-tracker" element={<JobTracker />} />

              {/* Financial & Accounting */}
              <Route path="/accounts/invoice" element={<Invoice />} />

              {/* Communications */}
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:category" element={<ChatRoom />} />
              <Route path="/notifications" element={<AllNotifications />} />
            </Route>

            {/* ===== CATCH-ALL - 404 handler ===== */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}
export default App;
