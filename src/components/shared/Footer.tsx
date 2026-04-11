import { Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="appfooter">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#6B7280' }}>Powered by</span>
        <span style={{ color: '#A78BFA', fontWeight: 700, fontSize: 12, letterSpacing: '.03em' }}>AKIj RESOURCE</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, color: '#6B7280' }}>
        <span>Helpline</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Phone size={11} /> +88 0 1912371253
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Mail size={11} /> support@akij.work
        </span>
      </div>
    </footer>
  );
}
