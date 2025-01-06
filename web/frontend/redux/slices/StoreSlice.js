// redux/slices/StoreSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { set } from "mongoose";

const initialState = {
  StoreDetail: null,
  User:null,
  Token:null
};

const StoreSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setStoreDetail(state, action) {
      state.StoreDetail = action.payload;
    },
    setUser(state, action) {
      state.User = action.payload;
    },
    setToken(state, action) {
      state.Token = action.payload;
    },
  },
});

export const { setStoreDetail, setUser, setToken } = StoreSlice.actions;
export default StoreSlice.reducer; // Make sure this exports the reducer
