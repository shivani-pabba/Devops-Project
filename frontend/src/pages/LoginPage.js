import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ROLE_FIELDS = {
  voter: {
    fields: [
      { label: 'Email', id: 'email', type: 'text', placeholder: 'alice@vmv.test' },
      { label: 'Password', id: 'password', type: 'password', placeholder: '••••••••' },
    ],
    hint: 'Your β commitment was sent with your credentials. Keep it private until after the election.',
  },
  admin: {
    fields: [
      { label: 'Administrator Email', id: 'email', type: 'text', placeholder: 'admin@vmv.test' },
      { label: 'Password', id: 'password', type: 'password', placeholder: '••••••••' },
    ],
  },
  auditor: {
    fields: [
      { label: 'Organisation Email', id: 'email', type: 'text', placeholder: 'auditor@vmv.test' },
      { label: 'Audit Access Token', id: 'password', type: 'password', placeholder: 'Issued by election authority' },
    ],
  },
};

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('voter');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('form'); // form | loading
  const [loadMsg, setLoadMsg] = useState('');
  const [progress, setProgress] = useState(0);

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('All fields are required'); return; }
    setError('');
    setPhase('loading');

    const messages = [
      'Authenticating credentials...',
      'Verifying CES session token...',
      'Loading Selene layer keys...',
      'Establishing Quorum connection...',
    ];
    let i = 0;
    const iv = setInterval(() => {
      setLoadMsg(messages[i % messages.length]);
      setProgress(((i + 1) / messages.length) * 100);
      i++;
    }, 400);

    try {
      await login(form.email, form.password, role);
      clearInterval(iv);
      setProgress(100);
      setTimeout(() => navigate('/'), 300);
    } catch (err) {
      clearInterval(iv);
      setPhase('form');
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  if (phase === 'loading') {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:52, height:52, border:'1.5px solid rgba(0,229,200,0.12)', borderTopColor:'var(--cyan)', borderRadius:'50%', animation:'spin 0.8s linear infinite', marginBottom:18 }} />
        <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:'#fff', marginBottom:6 }}>VMV · Verify My Vote</div>
        <div style={{ fontSize:10, color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.12em' }}>{loadMsg}</div>
        <div style={{ width:180, height:1, background:'rgba(255,255,255,0.06)', borderRadius:99, marginTop:18, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,var(--cyan),var(--violet))', borderRadius:99, transition:'width 0.5s ease' }} />
        </div>
      </div>
    );
  }

  const cfg = ROLE_FIELDS[role];

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', width:'100%', maxWidth:1080, height:'100vh', padding:'0 44px', alignItems:'center', gap:0 }}>

        {/* Hero left */}
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'5px 14px 5px 8px', border:'1px solid rgba(0,229,200,0.2)', borderRadius:100, background:'var(--cyan-d)', fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--cyan)', marginBottom:26 }}>
            <div className="blink-dot" />VMV · Cryptographic Voting
          </div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(2.6rem,4.2vw,4rem)', fontWeight:700, lineHeight:1.08, color:'#fff', marginBottom:18, letterSpacing:'-0.02em' }}>
            Verifiable<br/><em style={{ fontStyle:'italic', color:'var(--cyan)' }}>Online Voting</em><br/>Made Real.
          </div>
          <div style={{ fontSize:14, color:'var(--muted)', lineHeight:1.8, maxWidth:400, marginBottom:32, fontWeight:300 }}>
            A Selene-protocol demonstrator with end-to-end verifiability, NIZKPoK shuffle proofs and a Quorum distributed ledger.
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:36 }}>
            {['Selene Protocol','ElGamal Encryption','NIZKPoK','Quorum DLT','Mix-net','SHA-256','DSA Signatures','GDPR Compliant'].map(p => (
              <span key={p} style={{ padding:'5px 12px', borderRadius:5, fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', border:'1px solid var(--edge)', color:'var(--muted)', background:'var(--surf)', cursor:'default' }}>{p}</span>
            ))}
          </div>
          <div style={{ display:'flex', gap:28 }}>
            {[['4,821','Registered Voters'],['74.9%','Turnout Rate'],['100%','NIZKPoK Valid']].map(([n,l]) => (
              <div key={l} style={{ borderLeft:'2px solid var(--cyan)', paddingLeft:12 }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.9rem', fontWeight:700, color:'#fff', lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:10, color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.08em', marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Login card */}
        <div style={{ background:'rgba(20,28,48,0.85)', backdropFilter:'blur(24px)', border:'1px solid var(--edge2)', borderRadius:18, padding:34, position:'relative', overflow:'hidden', animation:'slideIn 0.65s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--cyan),var(--violet),transparent)' }} />

          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:26 }}>
            <div style={{ width:38, height:38, background:'linear-gradient(135deg,var(--cyan),var(--cyan2))', clipPath:'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:600, color:'#000' }}>VMV</div>
            <div>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:700, color:'#fff' }}>Verify My Vote</div>
              <div style={{ fontSize:10, color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.06em' }}>CES Commercial System · Selene Layer</div>
            </div>
          </div>

          <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:'#fff', marginBottom:4 }}>Secure Access</div>
          <div style={{ fontSize:10, color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace", marginBottom:22, letterSpacing:'0.06em' }}>SELECT YOUR ROLE TO CONTINUE</div>

          <div className="role-tabs">
            {['voter','admin','auditor'].map(r => (
              <button key={r} className={`rtab${role===r?' on':''}`} onClick={() => { setRole(r); setError(''); }}>{r}</button>
            ))}
          </div>

          {cfg.hint && (
            <div className="tracker-hint">
              <span style={{ color:'var(--violet)' }}>🔑</span>
              <span>{cfg.hint}</span>
            </div>
          )}

          {cfg.fields.map(f => (
            <div key={f.id} className="fg">
              <label className="fl">{f.label}</label>
              <input className="fi" type={f.type} placeholder={f.placeholder}
                value={form[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          ))}

          {error && <div style={{ fontSize:11, color:'var(--red)', marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>⚠ {error}</div>}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Authenticating...' : '🔐 Authenticate & Proceed'}
          </button>
          <div className="enc-bar">
            <div className="enc-dot" />
            <span>TLS 1.3 · ElGamal Encrypted · DSA Signed · GDPR Compliant</span>
          </div>

          <div style={{ marginTop:16, padding:'10px 12px', background:'rgba(0,229,200,0.04)', border:'1px solid rgba(0,229,200,0.12)', borderRadius:8, fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:'var(--muted)', lineHeight:1.7 }}>
            <span style={{ color:'var(--cyan)' }}>Demo credentials</span><br/>
            Voter: alice@vmv.test / voter@2024<br/>
            Admin: admin@vmv.test / selene@admin2024
          </div>
        </div>
      </div>
    </div>
  );
}
