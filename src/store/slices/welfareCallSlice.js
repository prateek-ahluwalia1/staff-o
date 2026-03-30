import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  incomingCall: null,
  outgoingCall: null,
  inCall: false,
};

const welfareCallSlice = createSlice({
  name: "welfareCall",
  initialState,
  reducers: {
    receiveIncomingCall(state, action) {
      // THE FIX: If we are already making a call, totally ignore the Echo event!
      if (state.outgoingCall || state.inCall) {
        console.warn(
          "Blocked incoming call echo because we are already dialing.",
        );
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
