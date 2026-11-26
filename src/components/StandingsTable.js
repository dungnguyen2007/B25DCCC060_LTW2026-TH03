const StandingsTable = ({ standings }) => {
  return (
    <section>
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
            <th>Hiệu số</th>
            <th>Điểm</th>
          </tr>
        </thead>

        <tbody>
          {standings.map((team, index) => (
            <tr key={team.id}>
              <td>{index + 1}</td>
              <td>{team.name}</td>
              <td>{team.played}</td>
              <td>{team.won}</td>
              <td>{team.drawn}</td>
              <td>{team.lost}</td>
              <td>{team.diff}</td>
              <td>{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default StandingsTable;
