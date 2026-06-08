import React, { memo } from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";

const DashboardLayout = memo(function DashboardLayout() {
  return (
    <>
      <Header withSidebar />
      <section className="dashboard-section">
        <div style={{ minHeight: "100vh", padding: "10px 50px" }}>
          <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main dashboard-content-shell">
              <Outlet />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
});

export default DashboardLayout;
