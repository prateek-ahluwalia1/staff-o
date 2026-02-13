import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
//UnAuth pages
const Login = lazy(() => import("./pages/UnAuthenticated/Login"));
//Auth pages
const Home = lazy(() => import("./pages/Authenticated/Home"));

const App: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Suspense>
  );
};

export default App;
