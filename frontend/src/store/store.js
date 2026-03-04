import { configureStore } from "@reduxjs/toolkit";
import { dailyBotApi } from "./apiSlice";
import authReducer from "./authSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [dailyBotApi.reducerPath]: dailyBotApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dailyBotApi.middleware),
});
