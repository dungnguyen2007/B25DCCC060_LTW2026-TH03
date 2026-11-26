export const matchesReducer = (state, action) => {
  switch (action.type) {
    case "LOAD":
      return action.payload;

    case "ADD": {
      const maxId = state.reduce((max, match) => Math.max(max, match.id), 0);

      const newMatch = {
        ...action.payload,
        id: maxId + 1,
      };

      return [...state, newMatch];
    }

    case "REMOVE":
      return state.filter((match) => match.id !== action.payload);

    case "SET_GOALS":
      return state.map((match) =>
        match.id === action.payload.id
          ? {
              ...match,
              homeGoals: action.payload.homeGoals,
              awayGoals: action.payload.awayGoals,
            }
          : match,
      );

    default:
      return state;
  }
};
