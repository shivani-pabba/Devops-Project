import { useEffect, useState } from 'react';
import api from '../utils/api';

export function MixnetSection() {
  return (
    <div>
      <div style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--cyan)', marginBottom:4 }}>Verificatum · Re-encryption Mix-net · 4 Teller Nodes</div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:'#fff', marginBottom:20 }}>
        Mix-net <span style={{ color:'var(--cyan)', fontStyle:'italic' }}>Protocol</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
        {['Teller Node 1\nCES · London DC1','Teller Node 2\nCES · London DC2','Teller Node 3\nUoS · Surrey','Teller Node 4\nAWS · EU-West'].map((n,i) => {
          const [title,sub] = n.split('\n');
          return (
            <div key={i} className="mix-node">
              <div className="mix-node-id">TELLER-{i+1}</div>
              <div className="mix-node-stat">{title}</div>
              <div style={{ fontSize:9, color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace" }}>{sub}</div>
              <span className="sbadge s-ok">Active</span>
            </div>
          );
        })}
      </div>
      <div className="g2">
        <div className="panel">
          <div className="ph"><div className="pt">Mix-net shuffle stages</div><div className="ptag">Fig. 3 · Protocol</div></div>
          {[
            ['1','Encrypt (tracker, vote) pairs','CES encrypts each pair under election public key (ElGamal).','done','Done'],
            ['2','Sequential Shuffle Rounds','Each teller re-encrypts and permutes the set. NIZKPoK proof generated.','done','Done'],
            ['3','Threshold Decryption','(k,t)-threshold decryption; at least k tellers needed.','done','Done'],
            ['4','Generate α Values (Randoms)','Each teller shares g^r_{i,j} with Selene Layer. α_i computed and sent.','prog','In progress'],
          ].map(([n,t,d,cls,lbl]) => (
            <div key={n} className="proto-step">
              <div className="ps-num">{n}</div>
              <div style={{ flex:1 }}><div className="ps-t">{t}</div><div className="ps-d">{d}</div></div>
              <span className={`ps-badge ${cls}`}>{lbl}</span>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="ph"><div className="pt">Cryptographic parameters</div><div className="ptag">Election key</div></div>
          {[
            ['Key length','3027 bits'],['Encryption scheme','ElGamal (k,t)-threshold'],
            ['Cyclic group G, order p','2048-bit prime'],['Signature algorithm','DSA (NIST FIPS 186-5)'],
            ['Tracker format','8-digit unique numbers'],['Mix-net implementation','Verificatum (open source)'],
            ['Data size (1000 voters)','~4 MB per CSV file'],
          ].map(([l,v]) => (
            <div key={l} style={{ padding:'8px 0', borderBottom:'1px solid var(--edge)', fontSize:10, display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--muted)' }}>{l}</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--txt)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WBBSection() {
  const [entries, setEntries] = useState([]);
  const [electionId, setElectionId] = useState(null);

  useEffect(() => {
    api.get('/elections/active').then(r => {
      setElectionId(r.data._id);
      return api.get(`/votes/wbb/${r.data._id}`);
    }).then(r => setEntries(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--cyan)', marginBottom:4 }}>Web Bulletin Board · Quorum DLT · Append-only</div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:'#fff', marginBottom:20 }}>
        Bulletin <span style={{ color:'var(--cyan)', fontStyle:'italic' }}>Board</span>
      </div>
      <div className="g4" style={{ marginBottom:14 }}>
        <div className="panel">
          <div className="ph"><div className="pt">Quorum Node Status</div><div className="ptag">DLT Network</div></div>
          {['CES Node 1 · London','CES Node 2 · London','UoS Node 1 · Surrey','UoS Node 2 · AWS'].map(n => (
            <div key={n} style={{ padding:8, background:'var(--surf2)', borderRadius:7, border:'1px solid var(--edge)', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:10, color:'var(--muted)' }}>{n}</span><span className="sbadge s-ok">Consensus</span>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="ph"><div className="pt">Published files</div><div className="ptag">Data Lake · SHA-256</div></div>
          {[['Election public key','Committed'],['Encrypted trackers','Committed'],['β commitments','Committed'],['Shuffle proofs (NIZKPoK)','Committed'],['Plaintext (tracker, vote) pairs','Committed'],['α values (voter notification)','Publishing']].map(([f,s]) => (
            <div key={f} style={{ padding:'7px 0', borderBottom:'1px solid var(--edge)', fontSize:10, display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--muted)' }}>{f}</span>
              <span className={`sbadge ${s==='Publishing'?'s-warn':'s-ok'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="ph"><div className="pt">WBB entries — SHA-256 hashes committed to Quorum</div><div className="ptag">Append-only · Immutable</div></div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {entries.length === 0 && <div style={{ fontSize:10, color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace" }}>No entries yet</div>}
          {entries.map((e,i) => (
            <div key={e._id || i} style={{ display:'grid', gridTemplateColumns:'1fr 80px 1fr auto', gap:12, padding:'10px 12px', background:'var(--surf2)', borderRadius:8, border:'1px solid var(--edge)', alignItems:'center', fontSize:10 }}>
              <div>
                <div style={{ color:'var(--muted)', marginBottom:2, fontFamily:"'JetBrains Mono',monospace", fontSize:9 }}>Tracker</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--cyan)', fontSize:13 }}>{e.tracker}</div>
              </div>
              <div>
                <div style={{ color:'var(--muted)', marginBottom:2, fontFamily:"'JetBrains Mono',monospace", fontSize:9 }}>Vote</div>
                <div style={{ fontWeight:700, color: e.vote==='YES'?'var(--green)':e.vote==='NO'?'var(--red)':'var(--amber)', fontSize:13 }}>{e.vote}</div>
              </div>
              <div>
                <div style={{ color:'var(--muted)', marginBottom:2, fontFamily:"'JetBrains Mono',monospace", fontSize:9 }}>Quorum Hash</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--muted)', fontSize:9, wordBreak:'break-all' }}>{e.quorumHash?.slice(0,32)}...</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end' }}>
                <span className="sbadge s-ok">{e.nodeConsensus}/{e.totalNodes} nodes</span>
                <span style={{ fontSize:8, color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace" }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RoadmapSection() {
  return (
    <div>
      <div style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--cyan)', marginBottom:4 }}>Section I-A · Paper · Incremental Deployment</div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:'#fff', marginBottom:20 }}>
        Security <span style={{ color:'var(--cyan)', fontStyle:'italic' }}>Roadmap</span>
      </div>
      <div className="g2">
        <div className="panel">
          <div className="ph"><div className="pt">5-Step roadmap to full E2E verifiability</div><div className="ptag">Section I-A · Paper</div></div>
          {[
            ['1','curr','Independent Verifiability (VMV — This paper)','Selene verifiability layer deployed externally. Not trusted for privacy. Enables voters to verify recorded-as-cast. CES unchanged.'],
            ['2','next','Casting Encrypted Ballots','Voting front-end collects encrypted ballots directly. CES no longer sees plaintext at vote time.'],
            ['3','next','Voter Credentials','Generate & store voter key pairs. Voters can recover credentials to verify independently.'],
            ['4','next','Voter Self-Registration','Voters generate and register their own cryptographic credentials.'],
            ['5','next','Coercion Mitigation','Fake α values, deniable channels. Full end-to-end security achieved.'],
          ].map(([n,cls,t,d]) => (
            <div key={n} className="road-item">
              <div className={`road-step rs-${cls}`}>{n}</div>
              <div>
                <div className="road-t">{t}{cls==='curr' && <em style={{ color:'var(--cyan)', fontSize:10 }}> ← Current</em>}</div>
                <div className="road-d">{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="panel" style={{ marginBottom:14 }}>
            <div className="ph"><div className="pt">Security properties</div><div className="ptag">Fig. 4 · Paper</div></div>
            {[
              ['s-ok','✓ Individual Verifiability','Provided when both CES and VMV are honest. Voters can confirm vote recorded-as-cast using tracker.'],
              ['s-info','✓ Universal Verifiability','Anyone can verify NIZKPoK proofs of shuffling and decryption. Tally correctness independently auditable.'],
              ['s-warn','⚠ Ballot Privacy','Handled by CES business processes. VMV is NOT trusted for privacy. End-to-end encryption is future work.'],
            ].map(([cls,t,d]) => (
              <div key={t} style={{ padding:10, background:'var(--surf2)', borderRadius:8, border:'1px solid var(--edge)', marginBottom:8 }}>
                <div style={{ fontSize:10, fontWeight:600, marginBottom:3 }} className={`sbadge ${cls}`}>{t}</div>
                <div style={{ fontSize:10, color:'var(--muted)', marginTop:6 }}>{d}</div>
              </div>
            ))}
          </div>
          <div className="panel">
            <div className="ph"><div className="pt">Adversary model</div><div className="ptag">Section IV · Paper</div></div>
            {[
              ['Honest-but-curious CES','Full individual verifiability'],
              ['"Dishonest but cautious"','Detection is sufficient deterrent'],
              ['Universal verifier','NIZKPoK publicly auditable'],
              ['Coercion resistance','Future step 5 of roadmap'],
            ].map(([m,r]) => (
              <div key={m} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--edge)', fontSize:10 }}>
                <span style={{ color:'var(--muted)' }}>{m}</span>
                <span style={{ color:'var(--txt)', fontFamily:"'JetBrains Mono',monospace", fontSize:9 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
