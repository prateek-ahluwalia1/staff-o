import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header';
import Sidebar from '../components/sidebar';
import Footer from './footer';

export default function DashboardLayout() {
    return (
        <>
            <Header />
            <section className="dashboard-section">
                <div className="container">
                    <div className="dashboard-layout">
                        <Sidebar />

                        <div className="dashboard-main">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}