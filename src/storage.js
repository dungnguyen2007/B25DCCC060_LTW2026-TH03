export const STORAGE_KEYS = {
  MATCHES: "ltw_bongda_matches",
  THEME: "ltw_bongda_theme",
  ROUND: "ltw_bongda_round",
};

// Trả về mảng trận đã lưu, hoặc null nếu chưa có / dữ liệu hỏng
export const loadSaved = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATCHES));

    return Array.isArray(saved) ? saved : null;
  } catch (error) {
    return null;
  }
};

export const saveMatches = (matches) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  } catch (error) {
    console.error("Không thể lưu lịch thi đấu", error);
  }
};
