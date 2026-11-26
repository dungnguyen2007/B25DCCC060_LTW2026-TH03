import { configureStore } from "@reduxjs/toolkit";

import matchesReducer from "./features/matchesSlice";
import goalReducer from "./features/goalSlice";
import { loadSaved, saveMatches } from "./storage";

const saved = loadSaved();

// true nếu lần mở này đã có dữ liệu lưu từ trước
export const hasSaved = saved !== null;

const store = configureStore({
  reducer: {
    matches: matchesReducer,
    goal: goalReducer,
  },
  preloadedState: {
    matches: saved ?? [],
  },
});

let lastMatches = store.getState().matches;

// Chỉ lưu khi mảng trận đấu đổi tham chiếu
store.subscribe(() => {
  const { matches } = store.getState();

  if (matches !== lastMatches) {
    lastMatches = matches;
    saveMatches(matches);
  }
});

export default store;
