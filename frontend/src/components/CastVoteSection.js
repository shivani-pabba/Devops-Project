import { useState, useEffect } from 'react';
import api from '../utils/api';
import { showToast } from './Toast';

export default function CastVoteSection({ user, onVoteCast }) {
  const [election, setElection] = useState(null);
  const [choice, setChoice] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [hasVoted, setHasVoted] = useState(user?.hasVoted || false);

  useEffect(() => {
    api.get('/elections/active').then(r => setElection(r.data)).catch(() => {});
  }, []);

  const castVote = async () => {
    if (!choice) { showToast('⚠ Please select your vote'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/votes/cast', { electionId: election._id, choice });
      setReceipt(data);
      setHasVoted(true);
      onVoteCast && onVoteCast();
      showToast('✅ Vote cast — save your tracker!');
    } catch (err) {
      showToast(`⚠ ${err.response?.data?.message || 'Failed to cast vote'}`);
    } finally {
      setLoading(false);
    }
  };

  if (hasVoted && receipt) {
    return (
      <div>
        <div style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--cyan)', marginBottom:4 }}>Vote Cast Successfully</div>
        <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:'#fff', marginBottom:20 }}>
          Your <span style={{ color:'var(--green)', fontStyle:'italic' }}>Receipt</span>
        </div>
        <div className="panel" style={{ maxWidth:520, borderColor:'rgba(34,208,138,0.2)' }}>
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:48, marginBottom:8 }}>🗳️</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:'var(--green)', fontWeight:700 }}>Vote Recorded!</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              ['Your Tracker (8-digit)', receipt.tracker, 'var(--cyan)', "'JetBrains Mono',monospace", 18],
              ['α Value', receipt.alphaValue, 'var(--violet)', "'JetBrains Mono',monospace", 10],
              ['β Commitment', receipt.betaCommitment, 'var(--muted)', "'JetBrains Mono',monospace", 10],
              ['Quorum Hash', receipt.quorumHash?.slice(0,32)+'...', 'var(--muted)', "'JetBrains Mono',monospace", 10],
            ].map(([l,v,c,ff,fs]) => (
              <div key={l} style={{ padding:'10px 12px', background:'var(--surf2)', borderRadius:8, border:'1px solid var(--edge)' }}>
                <div style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:'var(--muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.1em' }}>{l}</div>
                <div style={{ fontFamily:ff, fontSize:fs, color:c, wordBreak:'break-all' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, padding:'10px 12px', background:'rgba(245,166,35,0.06)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:8, fontSize:10, color:'var(--amber)', lineHeight:1.6 }}>
            ⚠ <strong>Save your tracker number!</strong> You will need it to verify your vote on the Web Bulletin Board after the election closes.
          </div>
          <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop:14 }}>
            ↩ Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div>
        <div style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--cyan)', marginBottom:4 }}>Cast Your Vote</div>
        <div className="panel" style={{ maxWidth:520 }}>
          <div style={{ textAlign:'center', padding:20 }}>
            <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:'var(--green)', fontWeight:700 }}>You have already voted!</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:8 }}>Use the <strong style={{ color:'var(--cyan)' }}>Verify Vote</strong> tab to confirm your vote was recorded correctly.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--cyan)', marginBottom:4 }}>Cast Your Vote · Selene Protocol · E2E Verifiable</div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:'#fff', marginBottom:20 }}>
        Cast your <span style={{ color:'var(--cyan)', fontStyle:'italic' }}>Vote</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16 }}>
        <div className="panel">
          <div className="ph"><div className="pt">{election?.title || 'Active Election'}</div><div className="ptag">{election?.status?.toUpperCase()}</div></div>
          {election?.description && <div style={{ fontSize:12, color:'var(--muted)', marginBottom:16, lineHeight:1.6 }}>{election.description}</div>}
          <div style={{ marginBottom:20 }}>
            <label className="fl">Your Selection</label>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {(election?.options || ['YES','NO','ABSTAIN']).map(opt => (
                <label key={opt} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background: choice===opt ? 'rgba(0,229,200,0.07)' : 'var(--surf2)', border:`2px solid ${choice===opt ? 'var(--cyan)' : 'var(--edge)'}`, borderRadius:10, cursor:'pointer', transition:'all 0.2s' }}>
                  <input type="radio" name="vote" value={opt} checked={choice===opt} onChange={() => setChoice(opt)} style={{ accentColor:'var(--cyan)' }} />
                  <span style={{ fontSize:16, fontWeight:700, color: opt==='YES' ? 'var(--green)' : opt==='NO' ? 'var(--red)' : 'var(--amber)' }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={castVote} disabled={loading || !choice}>
            {loading ? '⏳ Casting vote...' : '🗳️ Cast My Vote'}
          </button>
          <div className="enc-bar" style={{ marginTop:12 }}>
            <div className="enc-dot" />
            <span>ElGamal encrypted · SHA-256 hashed · Published to Quorum WBB</span>
          </div>
        </div>
        <div>
          <div className="panel" style={{ marginBottom:14 }}>
            <div className="ph"><div className="pt">Your credentials</div><div className="ptag">CES Session</div></div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ padding:'8px 10px', background:'var(--surf2)', borderRadius:7, border:'1px solid var(--edge)', fontSize:10 }}>
                <div style={{ color:'var(--muted)', marginBottom:2 }}>Voter ID</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--cyan)' }}>{user?.voterCredential || '—'}</div>
              </div>
              <div style={{ padding:'8px 10px', background:'var(--surf2)', borderRadius:7, border:'1px solid var(--edge)', fontSize:10 }}>
                <div style={{ color:'var(--muted)', marginBottom:2 }}>β Commitment</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--txt)', fontSize:9, wordBreak:'break-all' }}>{user?.betaCommitment || '—'}</div>
              </div>
              <div style={{ padding:'8px 10px', background:'var(--surf2)', borderRadius:7, border:'1px solid rgba(34,208,138,0.15)', fontSize:10 }}>
                <div style={{ color:'var(--muted)', marginBottom:2 }}>WBB Status</div>
                <span className="sbadge s-ok">Accepting Votes</span>
              </div>
            </div>
          </div>
          <div className="panel" style={{ background:'rgba(124,110,247,0.06)', borderColor:'rgba(124,110,247,0.2)' }}>
            <div style={{ fontSize:10, color:'var(--muted)', lineHeight:1.7 }}>
              <strong style={{ color:'var(--violet)' }}>Privacy note</strong><br/>
              Your ballot is ElGamal-encrypted before submission. The system will assign you a random 8-digit tracker which appears on the WBB next to your vote choice after mixing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
