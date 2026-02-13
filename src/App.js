import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./auth/login";
import Register from "./auth/register";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import DashboardLayout from "./components/dashboardlayout";
import EditProfile from "./pages/edit-profile";
import PublicProfilePreview from "./pages/public-profile-view";
import MyJobApplications from "./pages/my-job-application";
import MyFavouriteJobs from "./pages/my-favourite-jobs";
import JobAlerts from "./pages/job-alerts";
import MyFollowings from "./pages/my-followings";
import UserPackages from "./pages/user-packages";
import PaymentHistory from "./pages/payment-history";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
            <Route path="/public-profile" element={<PublicProfilePreview />} />
            <Route
              path="/my-job-applications"
              element={<MyJobApplications />}
            />
            <Route path="/my-favourite-jobs" element={<MyFavouriteJobs />} />
            <Route path="/job-alerts" element={<JobAlerts />} />
            <Route path="/my-followings" element={<MyFollowings />} />
            <Route path="/user-packages" element={<UserPackages />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
