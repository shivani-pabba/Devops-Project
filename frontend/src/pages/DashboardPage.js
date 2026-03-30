import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Toast } from '../components/Toast';
import OverviewSection from '../components/OverviewSection';
import VerifySection from '../components/VerifySection';
import CastVoteSection from '../components/CastVoteSection';
import { MixnetSection, WBBSection, RoadmapSection } from '../components/OtherSections';

const NAV_VOTER = ['overview','cast','verify','mixnet','bulletin','roadmap'];
const NAV_ADMIN = ['overview','verify','mixnet','bulletin','roadmap'];
const NAV_AUDITOR = ['overview','verify','bulletin','roadmap'];

const LABELS = { overview:'Overview', cast:'Cast Vote', verify:'Verify Vote', mixnet:'Mix-net', bulletin:'Bulletin Board', roadmap:'Roadmap' };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState('overview');
  const [showLogout, setShowLogout] = useState(false);

  const nav = user?.role === 'voter' ? NAV_VOTER : user?.role === 'admin' ? NAV_ADMIN : NAV_AUDITOR;
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'U';

  const renderSection = () => {
    switch(section) {
      case 'overview':  return <OverviewSection user={user} />;
      case 'cast':      return <CastVoteSection user={user} onVoteCast={() => setSection('verify')} />;
      case 'verify':    return <VerifySection user={user} />;
      case 'mixnet':    return <MixnetSection />;
      case 'bulletin':  return <WBBSection />;
      case 'roadmap':   return <RoadmapSection />;
      default:          return <OverviewSection user={user} />;
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1, display:'flex', flexDirection:'column' }}>
      <Toast />

      {/* Logout modal */}
      {showLogout && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'var(--surf)', border:'1px solid var(--edge2)', borderRadius:16, padding:28, maxWidth:340, width:'100%', margin:'0 16px', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>↩</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:'#fff', marginBottom:8 }}>Sign out?</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginBottom:20 }}>You will need to authenticate again to access VMV.</div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowLogout(false)} style={{ flex:1, padding:'10px', background:'var(--surf2)', border:'1px solid var(--edge)', borderRadius:9, color:'var(--txt)', cursor:'pointer', fontSize:13 }}>Cancel</button>
              <button onClick={logout} style={{ flex:1, padding:'10px', background:'var(--red-d)', border:'1px solid var(--red)', borderRadius:9, color:'var(--red)', cursor:'pointer', fontSize:13, fontWeight:700 }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      <div className="topbar">
        <div className="tb-l">
          <div className="tb-brand">
            <div className="tb-hex">VMV</div>
            <div className="tb-name">Verify My Vote</div>
          </div>
          <div className="tb-nav">
            {nav.map(s => (
              <button key={s} className={`tnav${section===s?' on':''}`} onClick={() => setSection(s)}>{LABELS[s]}</button>
            ))}
          </div>
        </div>
        <div className="tb-r">
          <div className="live-chip"><div className="blink-dot" />Election Active</div>
          <div className="voter-av" title={user?.name}>{initials}</div>
          <div style={{ fontSize:11, color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace" }}>{user?.role?.toUpperCase()}</div>
          <button className="btn-out" onClick={() => setShowLogout(true)}>↩ Logout</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'22px 26px 32px', scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.06) transparent' }}>
        {renderSection()}
      </div>
    </div>
  );
}
