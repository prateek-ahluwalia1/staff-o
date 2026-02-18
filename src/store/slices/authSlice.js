import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    userdata: null,
  },
  reducers: {
    setToken: (state, action) => {
      const { token } = action.payload;
      state.token = token;
    },
    setUser: (state, action) => {
      const { userdata } = action.payload;
      state.userdata = userdata;
    },
    logOut: (state) => {
      state.userdata = null;
      state.token = null;
    },
  },
});

export const { setToken, logOut, setUser } = authSlice.actions;
export default authSlice.reducer;
