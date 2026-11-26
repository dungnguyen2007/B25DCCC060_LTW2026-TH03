import { createSlice } from "@reduxjs/toolkit";

const matchesSlice = createSlice({
  name: "matches",

  initialState: [],

  reducers: {
    setMatches: (state, action) => {
      return action.payload;
    },

    addMatch: (state, action) => {
      state.push(action.payload);
    },

    removeMatch: (state, action) => {
      return state.filter((match) => match.id !== action.payload);
    },

    setGoals: (state, action) => {
      const { id, homeGoals, awayGoals } = action.payload;

      const match = state.find((item) => item.id === id);

      if (match) {
        match.homeGoals = homeGoals;
        match.awayGoals = awayGoals;
      }
    },
  },
});

export const { setMatches, addMatch, removeMatch, setGoals } =
  matchesSlice.actions;

export const selectMatches = (state) => state.matches;

export default matchesSlice.reducer;
