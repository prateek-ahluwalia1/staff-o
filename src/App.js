import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";

const Login = lazy(() => import("./auth/login"));
const Register = lazy(() => import("./auth/register"));
const Home = lazy(() => import("./pages/home"));
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
const AddJob = lazy(() => import("./pages/add-job"));

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<Loader fullPage size="lg" />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
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

            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route
                path="/public-profile"
                element={<PublicProfilePreview />}
              />
              <Route
                path="/my-job-applications"
                element={<MyJobApplications />}
              />
              <Route path="/roster" element={<RosterPage />} />
              <Route path="/my-favourite-jobs" element={<MyFavouriteJobs />} />
              <Route path="/job-alerts" element={<JobAlerts />} />
              <Route path="/my-followings" element={<MyFollowings />} />
              <Route path="/user-packages" element={<UserPackages />} />
              <Route path="/payment-history" element={<PaymentHistory />} />
              <Route path="/pay-charge-rate" element={<PayChargeRate />} />
              <Route path="/rates/charge" element={<RatesList />} />
              <Route path="/rates/pay" element={<RatesList />} />
              <Route path="/add-job" element={<AddJob />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
