import React from "react";
import { useSelector, useDispatch } from "react-redux";
import WelfareCallCard from "../pages/WelfareCallCard";
import { clearCallSession } from "../store/slices/welfareCallSlice";

export default function WelfareCallModal() {
  const dispatch = useDispatch();
  const { incomingCall, outgoingCall } = useSelector(
    (state) => state.welfareCall,
  );

  // If neither exists, don't render anything
  if (!incomingCall && !outgoingCall) return null;

  const isIncoming = !!incomingCall;
  const callData = incomingCall || outgoingCall;


  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {/* MAKE SURE callData IS PASSED HERE */}
        <WelfareCallCard
          callData={callData}
          isIncoming={isIncoming}
          onClose={() => dispatch(clearCallSession())}
        />
      </div>
    </div>
  );
}
