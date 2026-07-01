import React, { memo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";

const DashboardLayout = memo(function DashboardLayout() {
  const { isExpanded } = useSelector((state) => state.sidebar);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window size for inline responsive layout
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = windowWidth >= 1200;

  const mainContentStyle = {
    flexGrow: 1,
    minHeight: "100vh",
    transition: "margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    marginLeft: isDesktop ? (isExpanded ? "280px" : "80px") : "0px",
    width: isDesktop ? (isExpanded ? "calc(100% - 280px)" : "calc(100% - 80px)") : "100%",
  };

  return (
    <>
      <Header withSidebar />

      {/* Restored your dashboard-section class here to bring back the background image */}
      <section
        className="dashboard-section"
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh", padding: 0 }}
      >
        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar />

          {/* Main Content Area */}
          <div style={mainContentStyle}>
            {/* Added 24px padding here to match your original CSS padding requirement */}
            <div style={{ padding: isDesktop ? "20px" : "5px", overflowX: "hidden" }}>
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