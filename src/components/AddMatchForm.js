import { useState, useRef } from "react";
import { TEAMS, ROUNDS } from "../data";
import { isValidGoals, getTeamName } from "../utils";

const AddMatchForm = ({ matches, dispatch }) => {
  const homeRef = useRef(null);

  const initialForm = {
    round: "1",
    home: "",
    away: "",
    homeGoals: "",
    awayGoals: "",
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    const home = Number(form.home);
    const away = Number(form.away);

    // Kiểm tra đội nhà
    if (!form.home) {
      newErrors.home = "Hãy chọn đội nhà";
    }

    // Kiểm tra đội khách
    if (!form.away) {
      newErrors.away = "Hãy chọn đội khách";
    } else if (form.home && home === away) {
      newErrors.away = "Hai đội phải khác nhau";
    } else if (
      form.home &&
      matches.some(
        (match) =>
          (match.home === home && match.away === away) ||
          (match.home === away && match.away === home),
      )
    ) {
      newErrors.away = "Hai đội đã đá với nhau rồi";
    }

    // Kiểm tra bàn thắng nhà
    const homeGoals = Number(form.homeGoals);

    if (form.homeGoals === "" || !isValidGoals(homeGoals)) {
      newErrors.homeGoals = "Số bàn thắng phải là số nguyên từ 0 đến 20";
    }

    // Kiểm tra bàn thắng khách
    const awayGoals = Number(form.awayGoals);

    if (form.awayGoals === "" || !isValidGoals(awayGoals)) {
      newErrors.awayGoals = "Số bàn thắng phải là số nguyên từ 0 đến 20";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Thêm trận đấu
    dispatch({
      type: "ADD",
      payload: {
        round: Number(form.round),
        home,
        away,
        homeGoals,
        awayGoals,
      },
    });

    // Xóa form
    setForm(initialForm);
    setErrors({});

    // Đưa con trỏ về ô đội nhà
    homeRef.current.focus();
  };

  return (
    <div>
      <h2>Thêm trận đấu</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="round">Vòng:</label>

          <select
            id="round"
            name="round"
            value={form.round}
            onChange={handleChange}
          >
            {ROUNDS.map((round) => (
              <option key={round} value={round}>
                Vòng {round}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="home">Đội nhà:</label>

          <select
            id="home"
            name="home"
            ref={homeRef}
            value={form.home}
            onChange={handleChange}
          >
            <option value="">-- Chọn đội --</option>

            {TEAMS.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>

          {errors.home && <p role="alert">{errors.home}</p>}
        </div>

        <div>
          <label htmlFor="away">Đội khách:</label>

          <select
            id="away"
            name="away"
            value={form.away}
            onChange={handleChange}
          >
            <option value="">-- Chọn đội --</option>

            {TEAMS.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>

          {errors.away && <p role="alert">{errors.away}</p>}
        </div>

        <div>
          <label htmlFor="homeGoals">Bàn thắng đội nhà:</label>

          <input
            type="number"
            id="homeGoals"
            name="homeGoals"
            value={form.homeGoals}
            onChange={handleChange}
          />

          {errors.homeGoals && <p role="alert">{errors.homeGoals}</p>}
        </div>

        <div>
          <label htmlFor="awayGoals">Bàn thắng đội khách:</label>

          <input
            type="number"
            id="awayGoals"
            name="awayGoals"
            value={form.awayGoals}
            onChange={handleChange}
          />

          {errors.awayGoals && <p role="alert">{errors.awayGoals}</p>}
        </div>

        <button type="submit">Thêm trận</button>
      </form>
    </div>
  );
};

export default AddMatchForm;
