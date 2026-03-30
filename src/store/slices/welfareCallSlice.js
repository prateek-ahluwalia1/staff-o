import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  incomingCall: null, // { roomName, staffName, ... }
  inCall: false,
};

const welfareCallSlice = createSlice({
  name: "welfareCall",
  initialState,
  reducers: {
    receiveIncomingCall(state, action) {
      state.incomingCall = action.payload;
    },
    clearIncomingCall(state) {
      state.incomingCall = null;
    },
    setInCall(state, action) {
      state.inCall = action.payload;
    },
  },
});

export const { receiveIncomingCall, clearIncomingCall, setInCall } =
  welfareCallSlice.actions;
export default welfareCallSlice.reducer;
