import { useReducer, useEffect, useMemo, useState } from "react";

import { matchesReducer } from "./matchesReducer";
import useFetch from "./hooks/useFetch";

import { ROUNDS, RESULT_LABELS, formatDiff } from "./data";

import {
  getTeamName,
  getResult,
  calcStandings,
  calcMatchStats,
  isValidGoals,
} from "./utils";

import AddMatchForm from "./components/AddMatchForm";

const BUILD_TAG = "bd-5918";

const App = () => {
  const { data, loading, error } = useFetch("/data/matches.json");

  const [matches, dispatch] = useReducer(matchesReducer, []);

  const [round, setRound] = useState("all");

  // Nạp dữ liệu ban đầu
  useEffect(() => {
    if (data) {
      dispatch({
        type: "LOAD",
        payload: data,
      });
    }
  }, [data]);

  // Lọc trận đấu theo vòng
  const filteredMatches = useMemo(() => {
    if (round === "all") {
      return matches;
    }

    return matches.filter((match) => match.round === Number(round));
  }, [matches, round]);

  // Tính bảng xếp hạng
  const standings = useMemo(() => {
    return calcStandings(matches);
  }, [matches]);

  // Tính thống kê
  const stats = useMemo(() => {
    return calcMatchStats(filteredMatches);
  }, [filteredMatches]);

  // Đội dẫn đầu
  const leader =
    standings.length > 0 && matches.length > 0 ? standings[0] : null;

  // Sửa tỷ số
  const handleGoals = (id, homeGoals, awayGoals) => {
    if (!isValidGoals(homeGoals) || !isValidGoals(awayGoals)) {
      return;
    }

    dispatch({
      type: "SET_GOALS",
      payload: {
        id,
        homeGoals,
        awayGoals,
      },
    });
  };

  // Xóa trận đấu
  const handleRemove = (id) => {
    dispatch({
      type: "REMOVE",
      payload: id,
    });
  };

  if (loading) {
    return <h2>Đang tải lịch thi đấu...</h2>;
  }

  if (error) {
    return <h2>Không tải được lịch thi đấu</h2>;
  }

  return (
    <div className="app" data-build={BUILD_TAG}>
      <h1>GIẢI BÓNG ĐÁ KHOA</h1>

      {/* BẢNG XẾP HẠNG */}

      <h2>Bảng xếp hạng</h2>

      <table>
        <thead>
          <tr>
            <th>Hạng</th>
            <th>Đội</th>
            <th>Trận</th>
            <th>Thắng</th>
            <th>Hòa</th>
            <th>Thua</th>
            <th>BT</th>
            <th>BB</th>
            <th>HS</th>
            <th>Điểm</th>
          </tr>
        </thead>

        <tbody>
          {standings.map((team, index) => (
            <tr
              key={team.id}
              style={index === standings.length - 1 ? { color: "#c62828" } : {}}
            >
              <td>{index + 1}</td>
              <td>{team.name}</td>
              <td>{team.played}</td>
              <td>{team.won}</td>
              <td>{team.drawn}</td>
              <td>{team.lost}</td>
              <td>{team.gf}</td>
              <td>{team.ga}</td>
              <td>{formatDiff(team.diff)}</td>
              <td>{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* THỐNG KÊ */}

      <h2>Thống kê</h2>

      <p>Số trận: {stats.count}</p>

      <p>Tổng số bàn thắng: {stats.goals}</p>

      <p>Bàn thắng mỗi trận: {stats.average.toFixed(2)}</p>

      <p>
        Đội dẫn đầu: {leader ? `${leader.name} (${leader.points} điểm)` : "—"}
      </p>

      {/* LỊCH THI ĐẤU */}

      <h2>Lịch thi đấu</h2>

      <label htmlFor="round">Xem vòng: </label>

      <select
        id="round"
        value={round}
        onChange={(e) => setRound(e.target.value)}
      >
        <option value="all">Tất cả</option>

        {ROUNDS.map((r) => (
          <option key={r} value={r}>
            Vòng {r}
          </option>
        ))}
      </select>

      {filteredMatches.length === 0 ? (
        <p>Chưa có trận đấu nào</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Vòng</th>
              <th>Đội nhà</th>
              <th>BT nhà</th>
              <th>BT khách</th>
              <th>Đội khách</th>
              <th>Kết quả</th>
              <th>Xóa</th>
            </tr>
          </thead>

          <tbody>
            {filteredMatches.map((match) => {
              const result = getResult(match);

              const homeName = getTeamName(match.home);
              const awayName = getTeamName(match.away);

              return (
                <tr
                  key={match.id}
                  style={
                    result === "draw"
                      ? {
                          backgroundColor: "rgba(255, 193, 7, 0.25)",
                        }
                      : {}
                  }
                >
                  <td>Vòng {match.round}</td>

                  <td>{homeName}</td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      aria-label={`Bàn thắng nhà ${homeName} - ${awayName}`}
                      value={match.homeGoals}
                      onChange={(e) => {
                        const value = e.target.valueAsNumber;

                        if (isValidGoals(value)) {
                          handleGoals(match.id, value, match.awayGoals);
                        }
                      }}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      aria-label={`Bàn thắng khách ${homeName} - ${awayName}`}
                      value={match.awayGoals}
                      onChange={(e) => {
                        const value = e.target.valueAsNumber;

                        if (isValidGoals(value)) {
                          handleGoals(match.id, match.homeGoals, value);
                        }
                      }}
                    />
                  </td>

                  <td>{awayName}</td>

                  <td>{RESULT_LABELS[result]}</td>

                  <td>
                    <button onClick={() => handleRemove(match.id)}>Xóa</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* FORM THÊM TRẬN */}

      <AddMatchForm matches={matches} dispatch={dispatch} />
    </div>
  );
};

export default App;
