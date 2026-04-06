import { useMemo } from "react";
import { useSelector } from "react-redux";
import StaffDashboard from "./dashboards/StaffDashboard";
import ContractorDashboard from "./dashboards/ContractorDashboard";
import CustomerDashboard from "./dashboards/CustomerDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

export default function Dashboard() {
  const { userdata } = useSelector((state) => state.auth);

  // Determine user type
  const userType = useMemo(() => {
    const type = userdata?.data?.user_type || userdata?.user_type || "staff";
    return type?.toLowerCase();
  }, [userdata]);

  // Render appropriate dashboard based on user type
  const renderDashboard = useMemo(() => {
    switch (userType) {
      case "staff":
        return <StaffDashboard />;
      case "contractor":
        return <ContractorDashboard />;
      case "customer":
      case "employer":
        return <CustomerDashboard />;
      case "admin":
      case "administrator":
        return <AdminDashboard />;
      default:
        return <StaffDashboard />;
    }
  }, [userType]);

  return renderDashboard;
}
