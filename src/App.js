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
//time sheet payload --> {"length":0,"pageIndex":0,"pageSize":20,"previousPageIndex":0,"guard_id":[164,165,166,9,123,124,105,92,214,98,167,126,125,202,84,109,10,56,103,8,210,146,156,133,159,160,161,151,145,196,201,174,54,215,106,91,100,52,157,55,177,175,172,25,115,116,53,137,104,89,205,97,186,82,187,119,86,4,81,83,110,94,143,147,7,24,154,155,217,87,152,117,35,139,107,168,23,144,1,216,36,93,197,88,49,11,189,190,142,85,148,150,138,211,173,22,132,114,102,162,149,204,209,90,76,77,78,79,80,108,99,32,176,188,195,194,101,181,180,182,183,184,96,198,185,213,130,171,199,112,193,200,206,111,169,2,163,118,141,134,208,158],"start":"03-15-2026","end":"03-21-2026","state":["Victoria","New South Wales","Tasmania","Queensland","Western Australia","South Australia","ACT"],"customer_ids":[133,132,131,130,84,106,105,81,120,126,113,63,65,115,121,122,123,124,118,116,137,134,119,114,128,72,6,135,138]}

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
