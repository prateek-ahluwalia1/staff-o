import React from "react";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import useScrollReveal from "../hooks/useScrollReveal";
import Hero from "../components/newHome/Hero";
import Ticker from "../components/newHome/Ticker";
// import Jobs from "../components/newHome/Jobs";
import Categories from "../components/newHome/Categories";
import HowItWorks from "../components/newHome/HowItWorks";
import Demographics from "../components/newHome/Demographics";
import UserType from "../components/newHome/UserType";
import WhyStaffoo from "../components/newHome/WhyStaffoo";
import Testamonial from "../components/newHome/Testamonial";
import AppSection from "../components/newHome/AppSection";

export default function Home() {
  useScrollReveal();

  return (
    <div style={{
      background: "#0b0c0e",
      color: "#f4f2ed",
      fontFamily: 'Barlow, sans-serif',
      fontSize: '16px',
      lineHeight: '1.6',
      overflowX: 'hidden'
    }}>
      <Header />
      <Hero />
      <Ticker />
      {/* <Jobs /> */}
      <Categories />
      <HowItWorks />
      <Demographics />
      <UserType />
      <WhyStaffoo />
      <Testamonial />
      <AppSection />
      <Footer />
    </div>
  );
}