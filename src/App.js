import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const password = "1234";

export default function App() {
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [intento, setIntento] = useState("");
  const [precios, setPrecios] = useState([]);
  const [horas, setHoras] = useState([]);

    useEffect(() => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const fecha = `${yyyy}${mm}${dd}`;
    const url = `https://www.omie.es/sites/default/files/dados/AGNO_${yyyy}/MES_${mm}/DIA_${dd}/INT_PBC_EV_H_1_1_${fecha}.CSV`;

    fetch(url)
      .then(res => res.text())
      .then(texto => {
        const lineas = texto.split('\\n');
        const h = [];
        const p = [];
        for (let i = 1; i <= 24; i++) {
          const columnas = lineas[i]?.split(';');
          if (columnas && columnas.length >= 5) {
            h.push(columnas[1]);
            p.push(parseFloat(columnas[4].replace(',', '.')));
          }
        }
        setHoras(h);
        setPrecios(p);
      })
      .catch(err => console.error("Error al cargar CSV:", err));
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
      {horas.length && precios.length ? (
  <Line data={{
    labels: horas,
    datasets: [{
      label: '€/MWh',
      data: precios,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
    }],
  }} />
) : (
  <p>Cargando datos...</p>
)}

      <p style={{ marginTop: 20 }}>
        ⏱️ Mejor hora para consumir hoy: <strong>{mejorHora}</strong>
      </p>
    </div>
  );
}
