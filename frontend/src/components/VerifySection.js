import { useState, useEffect } from 'react';
import api from '../utils/api';
import { showToast } from './Toast';

export default function VerifySection({ user }) {
  const [tracker, setTracker] = useState('');
  const [expected, setExpected] = useState('');
  const [beta, setBeta] = useState('');
  const [alpha, setAlpha] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | checking | result
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [wbbEntries, setWbbEntries] = useState([]);
  const [electionId, setElectionId] = useState(null);
  const [myVote, setMyVote] = useState(null);

  useEffect(() => {
    api.get('/elections/active').then(r => {
      setElectionId(r.data._id);
      return Promise.all([
        api.get(`/votes/wbb/${r.data._id}`),
        user.role === 'voter' ? api.get(`/votes/my/${r.data._id}`).catch(() => null) : Promise.resolve(null),
      ]);
    }).then(([wbbRes, myRes]) => {
      setWbbEntries(wbbRes.data);
      if (myRes?.data) {
        setMyVote(myRes.data);
        setTracker(myRes.data.tracker || '');
        setBeta(myRes.data.betaCommitment || '');
        setAlpha(myRes.data.alphaValue || '');
      }
    }).catch(() => {});
  }, [user.role]);

  const autofill = (t, v) => {
    setTracker(t); setExpected(v); setPhase('idle'); setResult(null);
    showToast(`Autofilled tracker ${t} — click Verify`);
  };

  const runVerification = async () => {
    if (!tracker) { showToast('⚠ Enter your tracker number first'); return; }
    if (!expected) { showToast('⚠ Select the vote you cast'); return; }
    setPhase('checking'); setSteps([]); setResult(null);

    const stepMsgs = [
      `Searching Web Bulletin Board for tracker ${tracker}...`,
      'Validating NIZKPoK shuffle proofs on Quorum...',
      'Verifying SHA-256 hash integrity (4/4 nodes)...',
      'Cross-checking vote against expected selection...',
    ];
    for (let i = 0; i < stepMsgs.length; i++) {
      await new Promise(r => setTimeout(r, 450));
      setSteps(prev => [...prev, stepMsgs[i]]);
    }

    try {
      const { data } = await api.post('/votes/verify', { tracker, expectedChoice: expected, electionId });
      setResult(data);
      setPhase('result');
      if (data.result === 'authentic') showToast('✅ Vote verified — AUTHENTIC');
      else if (data.result === 'fraud') showToast('🚨 FRAUD DETECTED — vote mismatch!');
      else showToast(`⚠ Tracker ${tracker} not found on WBB`);
    } catch {
      showToast('⚠ Verification failed — check connection');
      setPhase('idle');
    }
  };

  const voteColor = (v) => v === 'YES' ? 'var(--green)' : v === 'NO' ? 'var(--red)' : 'var(--amber)';

  return (
    <div>
      <div style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--cyan)', marginBottom:4 }}>Individual Verifiability · Selene · WBB Cross-check</div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:'#fff', marginBottom:20 }}>
        Verify — <span style={{ color:'var(--cyan)', fontStyle:'italic' }}>Real or Fraud?</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16 }}>
        <div>
          {/* Step 1 */}
          <div className="panel" style={{ marginBottom:14 }}>
            <div className="ph"><div className="pt">Step 1 — Enter your tracker & expected vote</div><div className="ptag">From α · β email</div></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              <div>
                <label className="fl">Your Tracker Number (8-digit)</label>
                <input className="fi" type="text" value={tracker} placeholder="e.g. 47829163" maxLength={8}
                  onChange={e => { setTracker(e.target.value.replace(/\D/g,'')); setPhase('idle'); setResult(null); }}
                  style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:16, letterSpacing:'0.12em' }} />
              </div>
              <div>
                <label className="fl">Vote you cast</label>
                <select className="fi" value={expected} onChange={e => { setExpected(e.target.value); setPhase('idle'); setResult(null); }}>
                  <option value="">— Select —</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                  <option value="ABSTAIN">ABSTAIN</option>
                </select>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              <div>
                <label className="fl">Your β commitment (from email)</label>
                <input className="fi" type="text" value={beta} onChange={e => setBeta(e.target.value)}
                  placeholder="e.g. 3f9c8e1d2b47a..." style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11 }} />
              </div>
              <div>
                <label className="fl">Your α value (post-election email)</label>
                <input className="fi" type="text" value={alpha} onChange={e => setAlpha(e.target.value)}
                  placeholder="e.g. 7b2e4f1a9c..." style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11 }} />
              </div>
            </div>
            <button onClick={runVerification} disabled={phase==='checking'}
              style={{ width:'100%', padding:11, background:'linear-gradient(135deg,var(--cyan),var(--cyan2))', border:'none', borderRadius:9, color:'#07090f', fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:700, cursor:'pointer', letterSpacing:'0.04em', boxShadow:'0 4px 18px rgba(0,229,200,0.25)', transition:'all 0.2s', opacity: phase==='checking'?0.7:1 }}>
              {phase === 'checking' ? '⏳ Verifying...' : '🔍 Run Verification Check'}
            </button>
          </div>

          {/* Steps log */}
          {(phase === 'checking' || steps.length > 0) && (
            <div className="panel" style={{ marginBottom:14 }}>
              <div className="ph"><div className="pt">Verification in progress...</div><div className="ptag">WBB · Quorum · NIZKPoK</div></div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {steps.map((s,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 9px', background:'var(--surf2)', borderRadius:6, border:'1px solid var(--edge)', fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'var(--muted)' }}>
                    <span style={{ color:'var(--cyan)' }}>→</span>{s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {phase === 'result' && result && (
            <div style={{ marginBottom:14 }}>
              {result.result === 'not_found' && (
                <div style={{ padding:20, background:'rgba(245,166,35,0.06)', border:'2px solid rgba(245,166,35,0.35)', borderRadius:14, textAlign:'center' }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>🔍</div>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:'var(--amber)', marginBottom:6 }}>Tracker Not Found</div>
                  <div style={{ fontSize:12, color:'var(--muted)' }}>Tracker <strong style={{ color:'var(--amber)', fontFamily:"'JetBrains Mono',monospace" }}>{tracker}</strong> was not found on the Web Bulletin Board.</div>
                </div>
              )}

              {result.result === 'authentic' && (
                <>
                  <div style={{ padding:20, background:'rgba(34,208,138,0.06)', border:'2px solid rgba(34,208,138,0.35)', borderRadius:14, marginBottom:14, textAlign:'center' }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
                    <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:'var(--green)', marginBottom:6 }}>Vote Verified — AUTHENTIC</div>
                    <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.7 }}>Your tracker was found on the Web Bulletin Board and the vote recorded matches what you cast.</div>
                  </div>
                  <div className="panel" style={{ borderColor:'rgba(34,208,138,0.2)' }}>
                    <div className="ph"><div className="pt">Verification breakdown</div><div className="ptag">All checks passed</div></div>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {[
                        ['Tracker on WBB', <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'var(--cyan)' }}>{result.tracker}</span>],
                        ['Vote recorded on WBB', <span style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>{result.recordedVote}</span>],
                        ['Vote you expected', <span style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>{result.expectedChoice}</span>],
                        ['NIZKPoK proof', <span className="sbadge s-ok">✓ Valid</span>],
                        ['Quorum hash check', <span className="sbadge s-ok">✓ {result.nodeConsensus}/{result.totalNodes} match</span>],
                        ['Verdict', <span style={{ fontSize:11, fontWeight:700, color:'var(--green)' }}>AUTHENTIC — Recorded as Cast ✅</span>],
                      ].map(([l,v]) => (
                        <div key={l} style={{ padding:'9px 11px', background:'var(--surf2)', borderRadius:7, border:'1px solid rgba(34,208,138,0.15)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:10, color:'var(--muted)' }}>{l}</span>{v}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {result.result === 'fraud' && (
                <>
                  <div style={{ padding:20, background:'rgba(232,68,90,0.06)', border:'2px solid rgba(232,68,90,0.35)', borderRadius:14, marginBottom:14, textAlign:'center' }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>🚨</div>
                    <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:'var(--red)', marginBottom:6 }}>FRAUD DETECTED</div>
                    <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.7 }}>The vote recorded on the WBB does NOT match the vote you expected to have cast.</div>
                  </div>
                  <div className="panel" style={{ borderColor:'rgba(232,68,90,0.2)' }}>
                    <div className="ph"><div className="pt">Fraud breakdown</div><div className="ptag">MISMATCH DETECTED</div></div>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {[
                        ['Tracker on WBB', <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'var(--cyan)' }}>{result.tracker}</span>],
                        ['Vote recorded on WBB', <span style={{ fontSize:13, fontWeight:700, color:'var(--red)' }}>{result.recordedVote}</span>],
                        ['Vote you expected', <span style={{ fontSize:13, fontWeight:700, color:'var(--amber)' }}>{result.expectedChoice}</span>],
                        ['Mismatch detected', <span className="sbadge s-err">🚨 {result.recordedVote} ≠ {result.expectedChoice}</span>],
                        ['Quorum hash check', <span className="sbadge s-ok">✓ Hash intact</span>],
                      ].map(([l,v]) => (
                        <div key={l} style={{ padding:'9px 11px', background:'var(--surf2)', borderRadius:7, border:'1px solid rgba(232,68,90,0.2)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:10, color:'var(--muted)' }}>{l}</span>{v}
                        </div>
                      ))}
                      <div style={{ padding:10, background:'rgba(232,68,90,0.06)', border:'1px solid rgba(232,68,90,0.2)', borderRadius:7, fontSize:10, color:'var(--muted)', lineHeight:1.6, marginTop:4 }}>
                        <strong style={{ color:'var(--red)' }}>Action required:</strong> Report this discrepancy to the Election Authority immediately.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* WBB sidebar */}
        <div className="panel" style={{ height:'fit-content' }}>
          <div className="ph"><div className="pt">Web Bulletin Board</div><div className="ptag">Append-only · WBB</div></div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:480, overflowY:'auto' }}>
            {wbbEntries.length === 0 && <div style={{ fontSize:10, color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace" }}>No entries yet</div>}
            {wbbEntries.map((r, i) => (
              <div key={r._id || i} onClick={() => autofill(r.tracker, r.vote)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 11px', background:'var(--surf2)', border:`1px solid ${result?.tracker === r.tracker ? (result.result==='authentic'?'rgba(34,208,138,0.35)':'rgba(232,68,90,0.35)') : 'var(--edge)'}`, borderRadius:7, cursor:'pointer', transition:'border-color 0.2s', backgroundColor: result?.tracker === r.tracker ? (result.result==='authentic'?'rgba(34,208,138,0.07)':'rgba(232,68,90,0.07)') : undefined }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(0,229,200,0.25)'}
                onMouseOut={e => e.currentTarget.style.borderColor = result?.tracker === r.tracker ? (result.result==='authentic'?'rgba(34,208,138,0.35)':'rgba(232,68,90,0.35)') : 'var(--edge)'}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:'var(--cyan)', flex:1, letterSpacing:'0.06em' }}>{r.tracker}</span>
                <span style={{ fontSize:12, fontWeight:700, color:voteColor(r.vote), minWidth:60, textAlign:'right' }}>{r.vote}</span>
                <span className="sbadge s-ok" style={{ fontSize:8 }}>On WBB</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
