import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { ROUNDS, RESULT_LABELS } from "./data";

import {
  getTeamName,
  getResult,
  calcStandings,
  calcMatchStats,
  isValidGoals,
} from "./utils";

import useFetch from "./hooks/useFetch";

import {
  selectMatches,
  setMatches,
  setGoals,
  removeMatch,
} from "./features/matchesSlice";

import { useTheme } from "./context/ThemeContext";
import { useNotice } from "./context/NoticeContext";

import AddMatchForm from "./components/AddMatchForm";
import StandingsTable from "./components/StandingsTable";
import GoalPlanner from "./components/GoalPlanner";

const BUILD_TAG = "bd-5918";

const App = () => {
  const dispatch = useDispatch();

  const matches = useSelector(selectMatches);
  const [selectedRound, setSelectedRound] = useState("all");

  const filteredMatches = useMemo(() => {
    if (selectedRound === "all") {
      return matches;
    }

    return matches.filter((match) => match.round === Number(selectedRound));
  }, [matches, selectedRound]);

  const { theme, toggleTheme } = useTheme();
  const showNotice = useNotice();

  const { data, loading, error } = useFetch("/data/matches.json");

  // Đưa dữ liệu tải từ file JSON vào Redux
  useEffect(() => {
    if (data) {
      dispatch(setMatches(data));
    }
  }, [data, dispatch]);

  // Tính bảng xếp hạng từ tất cả trận đấu
  const standings = useMemo(() => {
    return calcStandings(matches);
  }, [matches]);

  // Tính thống kê
  const stats = useMemo(() => {
    return calcMatchStats(filteredMatches);
  }, [filteredMatches]);

  // Sửa tỷ số trận đấu
  const handleGoals = (match, type, value) => {
    if (!isValidGoals(value)) {
      return;
    }

    const homeGoals = type === "home" ? value : match.homeGoals;

    const awayGoals = type === "away" ? value : match.awayGoals;

    dispatch(
      setGoals({
        id: match.id,
        homeGoals,
        awayGoals,
      }),
    );
  };

  // Xóa trận đấu
  const handleRemove = (match) => {
    dispatch(removeMatch(match.id));

    showNotice(
      `Đã xóa trận ${getTeamName(match.home)} - ${getTeamName(match.away)}`,
    );
  };

  return (
    <div className={`app ${theme}`} data-build={BUILD_TAG}>
      <header>
        <h1>Giải bóng đá khoa</h1>

        <button onClick={toggleTheme}>
          {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
        </button>
      </header>

      {loading && <p>Đang tải lịch thi đấu...</p>}

      {error && <p role="alert">Không tải được lịch thi đấu</p>}

      {!loading && !error && (
        <>
          {/* BẢNG XẾP HẠNG */}
          <section>
            <StandingsTable standings={standings} />
          </section>

          {/* THỐNG KÊ */}
          <section>
            <h2>Thống kê</h2>

            <p>Số trận: {stats.count}</p>

            <p>Tổng số bàn thắng: {stats.goals}</p>

            <p>Bàn thắng mỗi trận: {stats.average.toFixed(2)}</p>

            <p>
              Đội dẫn đầu:{" "}
              {standings.length > 0 && stats.count > 0
                ? `${standings[0].name} (${standings[0].points} điểm)`
                : "—"}
            </p>
          </section>

          {/* LỊCH THI ĐẤU */}
          <section>
            <h2>Lịch thi đấu</h2>

            <div>
              <label htmlFor="roundFilter">Xem vòng:</label>

              <select
                id="roundFilter"
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedRound(value);
                }}
                value={selectedRound}
              >
                <option value="all">Tất cả</option>

                {ROUNDS.map((round) => (
                  <option key={round} value={round}>
                    Vòng {round}
                  </option>
                ))}
              </select>
            </div>

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
                        style={{
                          background:
                            result === "draw"
                              ? "rgba(255, 193, 7, 0.25)"
                              : "transparent",
                        }}
                      >
                        <td>{match.round}</td>

                        <td>{homeName}</td>

                        <td>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={match.homeGoals}
                            aria-label={`Bàn thắng nhà ${homeName} - ${awayName}`}
                            onChange={(e) => {
                              handleGoals(
                                match,
                                "home",
                                e.target.valueAsNumber,
                              );
                            }}
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={match.awayGoals}
                            aria-label={`Bàn thắng khách ${homeName} - ${awayName}`}
                            onChange={(e) => {
                              handleGoals(
                                match,
                                "away",
                                e.target.valueAsNumber,
                              );
                            }}
                          />
                        </td>

                        <td>{awayName}</td>

                        <td>{RESULT_LABELS[result]}</td>

                        <td>
                          <button onClick={() => handleRemove(match)}>
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          {/* THÊM TRẬN */}
          <AddMatchForm />

          {/* MỤC TIÊU ĐIỂM */}
          <GoalPlanner standings={standings} />
        </>
      )}
    </div>
  );
};

export default App;
