import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  isLogged: false,
};

const userSilce = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action) {
      state.name = action.payload;
      state.isLogged = true;
    },
    logout(state) {
      state.name = "";
      state.isLogged = false;
    },
  },
});

export const { login, logout } = userSilce.actions;
export default userSilce.reducer;
