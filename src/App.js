import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const password = "micontraseña123";

export default function App() {
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [intento, setIntento] = useState("");
  const [precios, setPrecios] = useState([]);
  const [horas, setHoras] = useState([]);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/energy-prices/main/data/electricity-prices.csv')
      .then(res => res.text())
      .then(csv => {
        const rows = csv.split('\n').slice(1, 9); // ejemplo con 8 horas
        const h = [];
        const p = [];
        rows.forEach(row => {
          const parts = row.split(',');
          h.push(parts[0].split(' ')[1]);
          p.push(parseFloat(parts[1]) || 0.12);
        });
        setHoras(h);
        setPrecios(p);
      });
  }, []);

  const mejorHora = horas[precios.indexOf(Math.min(...precios))] || "desconocida";
  const precioActual = precios[0] || 0.12;

  const handleLogin = () => {
    if (intento === password) setAccesoPermitido(true);
    else alert("Contraseña incorrecta");
  };

  if (!accesoPermitido) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
        <h1>Introduce la contraseña</h1>
        <input type="password" value={intento} onChange={(e) => setIntento(e.target.value)} />
        <button onClick={handleLogin}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Precio actual de la luz</h1>
      <p>
        🔌 {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {precioActual.toFixed(3)} €/kWh
      </p>
      <p style={{
        color: precioActual < 0.10 ? 'green' : precioActual < 0.14 ? 'orange' : 'red'
      }}>
        {precioActual < 0.10
          ? '¡Buen momento para consumir!'
          : precioActual < 0.14
          ? 'Precio medio, puedes esperar'
          : 'Precio alto, mejor espera'}
      </p>

      <h2>Precios por hora</h2>
      <Line data={{
        labels: horas,
        datasets: [{
          label: '€/kWh',
          data: precios,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
        }],
      }} />

      <p style={{ marginTop: 20 }}>
        ⏱️ Mejor hora para consumir hoy: <strong>{mejorHora}</strong>
      </p>
    </div>
  );
}
