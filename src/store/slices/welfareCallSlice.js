import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  incomingCall: null, // set by useEcho when a push.notification with type=start_call arrives
  outgoingCall: null, // set by useCallManager.initiateCall after getting token
  inCall: false,      // set to true once Agora join succeeds
};

const welfareCallSlice = createSlice({
  name: "welfareCall",
  initialState,
  reducers: {
    receiveIncomingCall(state, action) {
      // Ignore if we're already in a call or dialling out
      if (state.outgoingCall || state.inCall) {
        console.warn("[welfareCallSlice] Blocked incoming call — already in a session.");
        return;
      }
      state.incomingCall = action.payload;
    },
    setOutgoingCall(state, action) {
      state.outgoingCall = action.payload;
    },
    clearCallSession(state) {
      state.incomingCall = null;
      state.outgoingCall = null;
      state.inCall = false;
    },
    setInCall(state, action) {
      state.inCall = action.payload;
    },
  },
});

export const {
  receiveIncomingCall,
  setOutgoingCall,
  clearCallSession,
  setInCall,
} = welfareCallSlice.actions;

export default welfareCallSlice.reducer;
