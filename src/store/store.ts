import { configureStore } from "@reduxjs/toolkit";
import syncTimesReducer from "./syncTimesSlice";

export const store = configureStore({
  reducer: {
    syncTimes: syncTimesReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;