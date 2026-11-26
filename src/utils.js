import { TEAMS, POINTS, MAX_GOALS } from "./data";

// Lấy tên đội bóng theo ID
export const getTeamName = (id) => {
  const team = TEAMS.find((t) => t.id === Number(id));
  return team ? team.name : "";
};

// Xác định kết quả trận đấu
export const getResult = (match) => {
  if (match.homeGoals > match.awayGoals) {
    return "home";
  }

  if (match.homeGoals < match.awayGoals) {
    return "away";
  }

  return "draw";
};

// Kiểm tra số bàn thắng hợp lệ
export const isValidGoals = (n) => {
  return Number.isInteger(n) && n >= 0 && n <= MAX_GOALS;
};

// Tính bảng xếp hạng
export const calcStandings = (matches) => {
  const standings = TEAMS.map((team) => ({
    id: team.id,
    name: team.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    diff: 0,
    points: 0,
  }));

  matches.forEach((match) => {
    const home = standings.find((t) => t.id === match.home);
    const away = standings.find((t) => t.id === match.away);

    if (!home || !away) return;

    home.played++;
    away.played++;

    home.gf += match.homeGoals;
    home.ga += match.awayGoals;

    away.gf += match.awayGoals;
    away.ga += match.homeGoals;

    const result = getResult(match);

    if (result === "home") {
      home.won++;
      away.lost++;

      home.points += POINTS.win;
      away.points += POINTS.loss;
    } else if (result === "away") {
      away.won++;
      home.lost++;

      away.points += POINTS.win;
      home.points += POINTS.loss;
    } else {
      home.drawn++;
      away.drawn++;

      home.points += POINTS.draw;
      away.points += POINTS.draw;
    }
  });

  standings.forEach((team) => {
    team.diff = team.gf - team.ga;
  });

  // Sắp xếp theo điểm, hiệu số, bàn thắng, tên đội
  return [...standings].sort(
    (a, b) =>
      b.points - a.points ||
      b.diff - a.diff ||
      b.gf - a.gf ||
      a.name.localeCompare(b.name, "vi"),
  );
};

// Tính thống kê trận đấu
export const calcMatchStats = (matches) => {
  let goals = 0;

  const counts = {
    home: 0,
    draw: 0,
    away: 0,
  };

  matches.forEach((match) => {
    goals += match.homeGoals + match.awayGoals;

    const result = getResult(match);
    counts[result]++;
  });

  const count = matches.length;

  const average = count === 0 ? 0 : Math.round((goals / count) * 100) / 100;

  return {
    count,
    goals,
    average,
    counts,
  };
};
