
export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <img src="/logo.png" alt="Unique Thunder" style={{ width: 200, marginBottom: 20 }} />
      <h1>⚡ Unique Thunder ⚡</h1>
      <p>Stay Electric — Sua loja oficial de camisas</p>
    </div>
  )
}
