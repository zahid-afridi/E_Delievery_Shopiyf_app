// redux/slices/StoreSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  StoreDetail: null,
};

const StoreSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setStoreDetail(state, action) {
      state.StoreDetail = action.payload;
    },
  },
});

export const { setStoreDetail } = StoreSlice.actions;
export default StoreSlice.reducer; // Make sure this exports the reducer
