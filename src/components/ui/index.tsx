export function Spinner({ size = 22 }: { size?: number }) {
  return <div className="spin" style={{ width: size, height: size }} />;
}

export function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={36} />
    </div>
  );
}

export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="ferr">{msg}</p>;
}

export function Alert({ type, children }: { type: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const cls = type === 'error' ? 'alert-err' : type === 'success' ? 'alert-ok' : 'alert-info';
  return <div className={`alert ${cls}`}>{children}</div>;
}
