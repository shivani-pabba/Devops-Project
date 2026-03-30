import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function OverviewSection({ user }) {
  const [stats, setStats] = useState(null);
  const [election, setElection] = useState(null);

  useEffect(() => {
    api.get('/elections/active').then(r => {
      setElection(r.data);
      return api.get(`/elections/${r.data._id}/stats`);
    }).then(r => setStats(r.data.stats)).catch(() => {});
  }, []);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <div>
      <div style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--cyan)', marginBottom:4 }}>VMV Demonstrator · CES Commercial System</div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:'#fff', marginBottom:20 }}>
        Welcome, <span style={{ color:'var(--cyan)', fontStyle:'italic' }}>{user?.name?.split(' ')[0] || 'User'}</span> 👋
      </div>

      <div className="kpi-grid">
        <div className="kpi kc"><div className="kpi-glow" /><div className="kl">Registered Voters</div><div className="kn">{stats?.totalRegistered?.toLocaleString() ?? '—'}</div><div className="ks">This election</div></div>
        <div className="kpi kv"><div className="kpi-glow" /><div className="kl">Votes Tallied</div><div className="kn">{stats?.totalVotes?.toLocaleString() ?? '—'}</div><div className="ks">{stats?.turnout ?? '—'}% turnout</div></div>
        <div className="kpi ka"><div className="kpi-glow" /><div className="kl">Verified by Voters</div><div className="kn">{stats?.totalVerified?.toLocaleString() ?? '—'}</div><div className="ks">{stats?.verificationRate ?? '—'}% verified</div></div>
        <div className="kpi kg"><div className="kpi-glow" /><div className="kl">Integrity Status</div><div className="kn">{stats?.anomalies === 0 ? 'OK' : '⚠'}</div><div className="ks">All NIZKPoK valid</div></div>
      </div>

      <div className="g2" style={{ marginBottom:14 }}>
        <div className="panel">
          <div className="ph"><div className="pt">Selene Protocol — Election Stages</div><div className="ptag">Fig. 3 · Paper</div></div>
          {[
            ['01','Election Setup','Mix-net key generation, tracker creation & shuffle, β commitment distribution.','done','Done'],
            ['02','Tracker Commitments (β)','Each voter receives β via email with credentials. Published to WBB.','done','Done'],
            ['03','Voting Period','Voters log in via CES, submit ballots. Plaintext held in CES Vote Database.','done','Closed'],
            ['04','Mixing & Decryption','Verificatum mix-net shuffles (tracker, vote) tuples. Decrypt to plaintext pairs.','done','Done'],
            ['05','Tracker Notification (α)','Voters receive α commitment via email. Can recover tracker & verify vote on WBB.','prog','Active'],
          ].map(([n,t,d,cls,lbl]) => (
            <div key={n} className="proto-step">
              <div className="ps-num">{n}</div>
              <div style={{ flex:1 }}><div className="ps-t">{t}</div><div className="ps-d">{d}</div></div>
              <span className={`ps-badge ${cls}`}>{lbl}</span>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="ph"><div className="pt">Session activity</div><div className="ptag">Live</div></div>
          <div>
            {[
              ['var(--cyan)','Voter authenticated via CES',`Credential ${user?.voterCredential || 'CES-XXXX'} · just now`],
              ['var(--violet)','β commitment matched on WBB','NIZKPoK verified · just now'],
              ['var(--green)','α value received from Selene Layer','Teller randomness collated · 2s ago'],
              ['var(--muted)','Vote published to WBB','SHA-256 hash committed to Quorum · 5s ago'],
              ['var(--muted)','Quorum ledger hash verified','4/4 nodes consensus · immutable · 8s ago'],
            ].map(([c,t,m],i) => (
              <div key={i} className="act-item">
                <div className="act-dot" style={{ background:c }} />
                <div><div className="act-t">{t}</div><div className="act-m">{m}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="g3">
        <div className="panel">
          <div className="ph"><div className="pt">Vote verification rate</div><div className="ptag">Trial data</div></div>
          {[
            ['Votes Cast', stats?.totalVotes ?? 3614, '100%', 'var(--cyan)'],
            ['Voter-Verified', stats?.totalVerified ?? 612, `${stats?.verificationRate ?? 17}%`, 'var(--violet)'],
            ['NIZKPoK Valid', stats?.nizkpokValid ?? stats?.totalVotes ?? 3614, '100%', 'var(--green)'],
            ['Anomalies Detected', stats?.anomalies ?? 0, '0%', 'var(--red)'],
          ].map(([n,v,w,c]) => (
            <div key={n} className="vbar">
              <div className="vbar-top"><span className="vbar-n">{n}</span><span className="vbar-v">{v?.toLocaleString()}</span></div>
              <div className="vbar-track"><div className="vbar-fill" style={{ width:w, background:c }} /></div>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="ph"><div className="pt">Architecture components</div><div className="ptag">Fig. 2 · Paper</div></div>
          {[
            ['CES Voting Web Service','Online'],['Selene Layer','Running'],['Verificatum Mix-net (4 nodes)','3/4 Active'],
            ['Quorum DLT (4 nodes)','Consensus'],['Data Lake (AWS S3)','Synced'],['Verification Web Service','Public'],
          ].map(([c,s]) => (
            <div key={c} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--edge)', fontSize:10 }}>
              <span style={{ color:'var(--muted)' }}>{c}</span><span className="sbadge s-ok">{s}</span>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="ph"><div className="pt">Election trials</div><div className="ptag">Section V · Paper</div></div>
          {[
            ['In-house Civica Trial','Initial test · April 2019'],
            ['Surrey CS Dept Rep Election','Student reps · June 2019'],
            ['RCN West Midlands Rep','Binding commercial ballot · Aug 2019'],
            ['College of Podiatrists','Two reps elected · Oct 2019'],
          ].map(([t,d]) => (
            <div key={t} style={{ padding:'9px 0', borderBottom:'1px solid var(--edge)', fontSize:10 }}>
              <div style={{ color:'var(--txt)', fontWeight:600, marginBottom:2 }}>{t}</div>
              <div style={{ color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace", fontSize:9 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
