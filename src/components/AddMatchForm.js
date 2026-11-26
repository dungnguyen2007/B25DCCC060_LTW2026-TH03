import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import { TEAMS, ROUNDS } from "../data";
import { isValidGoals, getTeamName } from "../utils";

import { selectMatches, addMatch } from "../features/matchesSlice";

import { useNotice } from "../context/NoticeContext";

const AddMatchForm = () => {
  const matches = useSelector(selectMatches);
  const dispatch = useDispatch();
  const showNotice = useNotice();

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

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    const home = Number(form.home);
    const away = Number(form.away);
    const homeGoals = Number(form.homeGoals);
    const awayGoals = Number(form.awayGoals);

    if (!form.home) {
      newErrors.home = "Hãy chọn đội nhà";
    }

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

    if (!isValidGoals(homeGoals) || form.homeGoals === "") {
      newErrors.homeGoals = "Số bàn thắng phải là số nguyên từ 0 đến 20";
    }

    if (!isValidGoals(awayGoals) || form.awayGoals === "") {
      newErrors.awayGoals = "Số bàn thắng phải là số nguyên từ 0 đến 20";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const maxId = matches.reduce((max, match) => Math.max(max, match.id), 0);

    const newMatch = {
      id: maxId + 1,
      round: Number(form.round),
      home,
      away,
      homeGoals,
      awayGoals,
    };

    dispatch(addMatch(newMatch));

    showNotice(`Đã thêm trận ${getTeamName(home)} - ${getTeamName(away)}`);

    setForm(initialForm);
    setErrors({});

    homeRef.current?.focus();
  };

  return (
    <section>
      <h2>Thêm trận đấu</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="round">Vòng</label>

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
          <label htmlFor="home">Đội nhà</label>

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
          <label htmlFor="away">Đội khách</label>

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
          <label htmlFor="homeGoals">Bàn thắng đội nhà</label>

          <input
            id="homeGoals"
            name="homeGoals"
            type="number"
            min="0"
            max="20"
            value={form.homeGoals}
            onChange={handleChange}
          />

          {errors.homeGoals && <p role="alert">{errors.homeGoals}</p>}
        </div>

        <div>
          <label htmlFor="awayGoals">Bàn thắng đội khách</label>

          <input
            id="awayGoals"
            name="awayGoals"
            type="number"
            min="0"
            max="20"
            value={form.awayGoals}
            onChange={handleChange}
          />

          {errors.awayGoals && <p role="alert">{errors.awayGoals}</p>}
        </div>

        <button type="submit">Thêm trận</button>
      </form>
    </section>
  );
};

export default AddMatchForm;
