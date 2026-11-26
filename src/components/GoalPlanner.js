import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

import { TEAMS } from "../data";
import { calcNeeded } from "../utils";

import { setTeamId, setTarget, setRemaining } from "../features/goalSlice";

const GoalPlanner = ({ standings }) => {
  const dispatch = useDispatch();

  const { teamId, target, remaining } = useSelector((state) => state.goal);

  const result = useMemo(() => {
    return calcNeeded(standings, teamId, target, remaining);
  }, [standings, teamId, target, remaining]);

  return (
    <section>
      <h2>Mục tiêu điểm</h2>

      <div>
        <label htmlFor="teamId">Đội của bạn:</label>

        <select
          id="teamId"
          value={teamId}
          onChange={(e) => dispatch(setTeamId(e.target.value))}
        >
          {TEAMS.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="target">Số điểm mục tiêu:</label>

        <input
          id="target"
          type="number"
          min="0"
          value={target}
          onChange={(e) => dispatch(setTarget(e.target.value))}
        />
      </div>

      <div>
        <label htmlFor="remaining">Số trận còn lại:</label>

        <input
          id="remaining"
          type="number"
          min="1"
          value={remaining}
          onChange={(e) => dispatch(setRemaining(e.target.value))}
        />
      </div>

      <p>{result}</p>
    </section>
  );
};

export default GoalPlanner;
