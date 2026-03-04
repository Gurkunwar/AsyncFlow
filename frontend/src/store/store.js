import { configureStore } from "@reduxjs/toolkit";
import { asyncFlowApi } from "./apiSlice";
import authReducer from "./authSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [asyncFlowApi.reducerPath]: asyncFlowApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(asyncFlowApi.middleware),
});
