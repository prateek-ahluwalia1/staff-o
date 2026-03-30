import React from "react";
import { useSelector, useDispatch } from "react-redux";
import WelfareCallCard from "../pages/WelfareCallCard";
import { clearIncomingCall } from "../store/slices/welfareCallSlice";

export default function WelfareCallModal() {
  const dispatch = useDispatch();
  const { incomingCall } = useSelector((state) => state.welfareCall);

  if (!incomingCall) return null;

  // Optionally, you can add a modal overlay here
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={() => dispatch(clearIncomingCall())}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <WelfareCallCard
          roomName={incomingCall.roomName}
          staffName={incomingCall.staffName}
        />
      </div>
    </div>
  );
}
