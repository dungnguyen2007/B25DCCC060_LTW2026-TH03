import useLocalStorage from "./hooks/useLocalStorage";
import { STORAGE_KEYS } from "./storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { ROUNDS, RESULT_LABELS } from "./data";

import {
  getTeamName,
  calcStandings,
  calcMatchStats,
  isValidGoals,
} from "./utils";

import { hasSaved } from "./store";
import useDebounce from "./hooks/useDebounce";

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
import MatchRow from "./components/MatchRow";

const BUILD_TAG = "bd-5918";

const App = () => {
  const dispatch = useDispatch();

  const matches = useSelector(selectMatches);

  const [selectedRound, setSelectedRound] = useLocalStorage(
    STORAGE_KEYS.ROUND,
    "all",
  );

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const searchRef = useRef(null);

  const { theme, toggleTheme } = useTheme();
  const showNotice = useNotice();

  const { data, loading, error } = useFetch("/data/matches.json");

  // Chỉ nạp dữ liệu mẫu vào Redux khi chưa có dữ liệu lưu
  useEffect(() => {
    if (!hasSaved && data) {
      dispatch(setMatches(data));
    }
  }, [data, dispatch]);

  // Phím "/" nhảy vào ô Tìm đội, Esc xóa nội dung tìm kiếm
  useEffect(() => {
    const handleKey = (e) => {
      const input = searchRef.current;

      if (e.key === "Escape" && e.target === input) {
        setSearch("");
        return;
      }

      const isTyping = ["INPUT", "SELECT", "TEXTAREA"].includes(
        e.target.tagName,
      );

      if (e.key === "/" && !isTyping && input) {
        e.preventDefault();
        input.focus();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Các trận theo vòng đang xem (dùng cho thống kê)
  const roundMatches = useMemo(() => {
    if (selectedRound === "all") {
      return matches;
    }

    return matches.filter((match) => match.round === Number(selectedRound));
  }, [matches, selectedRound]);

  // Các dòng hiển thị: lọc thêm theo tên đội
  const visibleMatches = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase();

    return roundMatches.filter((match) =>
      [match.home, match.away].some((id) =>
        getTeamName(id).toLowerCase().includes(keyword),
      ),
    );
  }, [roundMatches, debouncedSearch]);

  // Tính bảng xếp hạng từ tất cả trận đấu
  const standings = useMemo(() => {
    return calcStandings(matches);
  }, [matches]);

  // Tính thống kê
  const stats = useMemo(() => {
    return calcMatchStats(roundMatches);
  }, [roundMatches]);

  const leaderName = matches.length > 0 ? standings[0].name : "";

  // Tiêu đề tab
  useEffect(() => {
    document.title = leaderName
      ? `${leaderName} dẫn đầu – Giải bóng đá khoa`
      : "Giải bóng đá khoa";
  }, [leaderName]);

  const handleTeamShift = (e) => {
    setSearch(e.target.value);
  };

  // Sửa tỷ số trận đấu
  const handleGoals = useCallback(
    (match, type, value) => {
      if (!isValidGoals(value)) {
        return;
      }

      const homeGoals = type === "home" ? value : match.homeGoals;
      const awayGoals = type === "away" ? value : match.awayGoals;

      dispatch(setGoals({ id: match.id, homeGoals, awayGoals }));
    },
    [dispatch],
  );

  // Xóa trận đấu
  const handleRemove = useCallback(
    (match) => {
      dispatch(removeMatch(match.id));

      showNotice(
        `Đã xóa trận ${getTeamName(match.home)} - ${getTeamName(match.away)}`,
      );
    },
    [dispatch, showNotice],
  );

  // Đặt lại dữ liệu mẫu
  const handleReset = () => {
    dispatch(setMatches(data));
    showNotice("Đã đặt lại dữ liệu mẫu");
  };

  return (
    <div className={`app ${theme}`} data-build={BUILD_TAG}>
      <header>
        <h1>Giải bóng đá khoa</h1>

        <button onClick={toggleTheme}>
          {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
        </button>
      </header>

      {!hasSaved && loading && <p>Đang tải lịch thi đấu...</p>}

      {!hasSaved && error && <p role="alert">Không tải được lịch thi đấu</p>}

      {(hasSaved || (!loading && !error)) && (
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

            <h3>Phân bố kết quả</h3>

            <ul>
              {Object.entries(RESULT_LABELS).map(([key, label]) => (
                <li key={key}>
                  {`${label}: ${stats.counts[key]}`}
                  <span
                    style={{
                      display: "inline-block",
                      marginLeft: 8,
                      height: 10,
                      width: 24 * stats.counts[key],
                      background: "#1976d2",
                    }}
                  />
                </li>
              ))}
            </ul>
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

            <div>
              <label htmlFor="search">Tìm đội</label>

              <input
                id="search"
                type="text"
                ref={searchRef}
                value={search}
                onChange={handleTeamShift}
              />
            </div>

            <p>Tìm thấy {visibleMatches.length} trận</p>

            {visibleMatches.length === 0 ? (
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
                    <th>Số lần render</th>
                    <th>Xóa</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleMatches.map((match) => (
                    <MatchRow
                      key={match.id}
                      match={match}
                      onGoals={handleGoals}
                      onRemove={handleRemove}
                    />
                  ))}
                </tbody>
              </table>
            )}

            <button onClick={handleReset} disabled={!data}>
              Đặt lại dữ liệu mẫu
            </button>
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
