import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/UI';

const ACTIVITY = [
  ['Login', 'Chrome · Windows', '2 min ago', true], ['Password change', 'Safari · iPhone', '1 hr ago', true],
  ['Login', 'Firefox · Linux', '3 hrs ago', false], ['Profile update', 'Chrome · Android', 'Yesterday', true],
  ['Login', 'Edge · Windows', 'Yesterday', true], ['Logout', 'Chrome · Mac', '2 days ago', true],
  ['Login', 'Unknown device', '3 days ago', false], ['Password reset', 'Chrome · Windows', '5 days ago', true],
].map(([action, device, time, ok], i) => ({ id: i, action, device, time, ok }));

const fetchActivity = (fail) =>
  new Promise((res, rej) => setTimeout(() => (fail ? rej(new Error('Failed to load activity')) : res(ACTIVITY)), 900));

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [simulateError, setSimulateError] = useState(false);

  const load = (fail = false) => {
    setLoading(true); setError('');
    fetchActivity(fail).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const q = query.trim().toLowerCase();
  const rows = data.filter((r) => [r.action, r.device].some((s) => s.toLowerCase().includes(q)));
  const failed = data.filter((r) => !r.ok).length;

  const stats = [
    ['Total Logins', 128], ['Active Sessions', 2], ['Failed Attempts', failed], ['Account Status', 'Active'],
  ];

  return (
    <>
      <h1>Dashboard</h1>
      <p className="muted">Hello {user.name}, here is your account overview.</p>
      <div className="grid">
        {stats.map(([label, value]) => (
          <Card key={label}><span className="muted">{label}</span><div className="stat">{value}</div></Card>
        ))}
      </div>

      <Card>
        <div className="toolbar">
          <h2>Recent Activity</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input className="search" placeholder="Search activity..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button variant="secondary" onClick={() => { setSimulateError(true); load(true); }}>Simulate error</Button>
          </div>
        </div>

        {loading ? (
          [1, 2, 3, 4].map((i) => <div key={i} className="skeleton" />)
        ) : error ? (
          <div className="state">
            <div className="icon">⚠️</div><p>{error}</p>
            <br /><Button onClick={() => { setSimulateError(false); load(); }}>Retry</Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="state"><div className="icon">🔍</div><p>No activity found for “{query}”</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Action</th><th>Device</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.action}</td><td>{r.device}</td><td>{r.time}</td>
                    <td><span className={`badge ${r.ok ? '' : 'fail'}`}>{r.ok ? 'Success' : 'Failed'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}