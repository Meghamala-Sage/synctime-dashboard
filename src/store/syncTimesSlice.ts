import { createSlice } from "@reduxjs/toolkit";

const syncTimesSlice = createSlice({
  name: "syncTimes",
  initialState: {
    connectors: [],
    loading: false,
    error: null,
    schedule: null,
    preview: null
  },
  reducers: {
    setConnectors: (state, action) => {
      state.connectors = action.payload;
    },
    setSchedule: (state, action) => {
      state.schedule = action.payload;
    },
    setPreview: (state, action) => {
      state.preview = action.payload;
    }
  }
});

export const { setConnectors, setSchedule, setPreview } =
  syncTimesSlice.actions;

export default syncTimesSlice.reducer;