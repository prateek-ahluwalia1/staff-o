import React from "react";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import Hero from "../components/newHome/Hero";
import UserType from "../components/newHome/UserType";
import Ticker from "../components/newHome/Ticker";
import Categories from "../components/newHome/Categories";
import WhyStaffoo from "../components/newHome/WhyStaffoo";
import HowItWorks from "../components/newHome/HowItWorks";
import Testamonial from "../components/newHome/Testamonial";
import Demographics from "../components/newHome/Demographics";

export default function Home() {
  return (
    <div className="nh-page">
      {/* Sticky light header */}
      <Header />


      {/* Dark disclaimer bar */}
      <UserType />

      {/* Hero — light tint background, role tabs, duty card */}
      <Hero />

      {/* Stats bar — 2,000+ jobs, 1,200+ guards, 4.8★, 34 min */}
      <Ticker />

      {/* Security categories grid */}
      <Categories />

      {/* "What you get" — dark split section */}
      <WhyStaffoo />

      {/* How it works — 4 steps */}
      <HowItWorks />

      {/* Case studies — 3 cards */}
      <Testamonial />

      {/* CTA band — "Ready to get started?" */}
      <Demographics />

      {/* Dark footer */}
      <Footer />
    </div>
  );
}