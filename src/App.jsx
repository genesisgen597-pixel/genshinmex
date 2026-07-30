import { useEffect, useRef, useState } from 'react';

const PEOPLE = [
  { nombre: 'Pedro', nivel: 1, pct: 0.20, base: 100000 },
  { nombre: 'Juan',  nivel: 2, pct: 0.07, base: 2000 },
  { nombre: 'Pepe',  nivel: 3, pct: 0.07, base: 50000 },
  { nombre: 'Ana',   nivel: 4, pct: 0.07, base: 10000 },
];

const fmt = (n) => '$' + Math.round(n).toLocaleString('es-AR');

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 60);
        }
      });
    }, { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useNavDots(sectionIds) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setActive(sections.indexOf(e.target));
        }
      });
    }, { threshold: 0.5 });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [sectionIds]);
  return [active, sectionIds];
}

function HeroNetwork() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let nodes = [];
    let w = 0, h = 0;

    function setup() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      const N = 22;
      nodes = Array.from({ length: N }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 1.5,
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < w * 0.22) {
            ctx.strokeStyle = `rgba(232,196,105,${1 - d / (w * 0.22)})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = '#2dd4e0';
        ctx.shadowColor = '#2dd4e0'; ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      raf = requestAnimationFrame(frame);
    }

    setup();
    frame();
    const onResize = () => { cancelAnimationFrame(raf); setup(); frame(); };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} />;
}

function LevelsNetwork() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf; let w = 0, h = 0; let rows = [];
    const levels = [1, 2, 3, 3];
    const colors = ['#e8c469', '#2dd4e0', '#2dd4e0', '#2dd4e0'];
    const pcts = ['20%', '7%', '7%', '7%'];

    function setup() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      const marginY = 50;
      const stepY = (h - marginY * 2) / (levels.length - 1);
      rows = levels.map((count, li) => {
        const y = marginY + stepY * li;
        return Array.from({ length: count }, (_, i) => {
          const x = w / 2 + (i - (count - 1) / 2) * (w / (count + 1.4));
          return { baseX: x, baseY: y, x, y, phase: Math.random() * Math.PI * 2 };
        });
      });
    }

    let t = 0;
    function frame() {
      t += 0.012;
      ctx.clearRect(0, 0, w, h);
      rows.forEach((row) => row.forEach((n) => {
        n.x = n.baseX + Math.sin(t + n.phase) * 6;
        n.y = n.baseY + Math.cos(t * 1.3 + n.phase) * 4;
      }));
      for (let li = 0; li < rows.length - 1; li++) {
        rows[li].forEach((a) => rows[li + 1].forEach((b) => {
          ctx.strokeStyle = 'rgba(232,196,105,0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }));
      }
      rows.forEach((row, li) => row.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, li === 0 ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle = '#0c1424';
        ctx.strokeStyle = colors[li];
        ctx.lineWidth = 2.5;
        ctx.fill(); ctx.stroke();
      }));
      ctx.font = "13px 'Bebas Neue', sans-serif";
      ctx.textAlign = 'left';
      rows.forEach((row, li) => {
        ctx.fillStyle = colors[li];
        ctx.fillText(`NIVEL ${li + 1} · ${pcts[li]}`, 8, row[0].baseY + 4);
      });
      raf = requestAnimationFrame(frame);
    }

    setup();
    frame();
    const onResize = () => { cancelAnimationFrame(raf); setup(); frame(); };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} />;
}

function Calculadora() {
  const [valores, setValores] = useState(PEOPLE.map((p) => p.base));
  const total = valores.reduce((acc, v, i) => acc + v * PEOPLE[i].pct, 0);

  return (
    <div className="calc-card reveal">
      <div className="row-in">
        {PEOPLE.map((p, idx) => (
          <div className="field" key={p.nombre}>
            <label>{p.nombre} <small>Nivel {p.nivel} · {Math.round(p.pct * 1000) / 10}%</small></label>
            <input
              type="range" min="0" max="200000" step="500"
              value={valores[idx]}
              onChange={(e) => {
                const next = [...valores];
                next[idx] = +e.target.value;
                setValores(next);
              }}
            />
            <span className="val">{fmt(valores[idx])}</span>
          </div>
        ))}
      </div>
      <div className="calc-result">
        <span className="lab">Total ganado en esta línea</span>
        <span className="num">{fmt(total)}</span>
      </div>
    </div>
  );
}

const SECTION_IDS = ['hero', 'hook', 'niveles', 'calc', 'pagos', 'pasos', 'cta'];

export default function App() {
  useReveal();
  const [active] = useNavDots(SECTION_IDS);

  return (
    <>
      <div className="felt"></div>

      <div className="dots">
        {SECTION_IDS.map((id, i) => (
          <div
            key={id}
            className={'dot' + (i === active ? ' active' : '')}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
          />
        ))}
      </div>

      <section id="hero">
        <h1>CONVERTITE EN SOCIO<br />SIN PONER UN PESO<br />PARA SIEMPRE</h1>
        <p className="sub">La casa siempre gana. Ahora vos también.</p>
        <div className="phone-frame">
          <video src="/media/testimonio.mp4" controls playsInline preload="metadata" />
        </div>
        <div className="scroll-cue">SCROLL ↓</div>
      </section>

      <section id="hook">
        <div className="eyebrow reveal">LA PROPUESTA</div>
        <h2 className="reveal">LA CASA SIEMPRE GANA.<br />AHORA VOS TAMBIÉN.</h2>
        <p className="reveal">Sumate al proyecto de casino legal en México y convertite en socio de cada cliente que traigas, para siempre. No vendés nada, no invertís nada: solo abrís la puerta.</p>
        <div className="perks">
          <div className="perk reveal"><span className="ic">💰</span><b>Comisión de por vida</b><span>Sobre cada cliente que refieras, sin vencimiento.</span></div>
          <div className="perk reveal"><span className="ic">⚡</span><b>Cobrás en menos de 24 hs</b><span>Pagos diarios, sin esperas ni trámites.</span></div>
          <div className="perk reveal"><span className="ic">🔗</span><b>Tu link, tu red</b><span>Vos abrís la puerta, nosotros el trabajo.</span></div>
        </div>
      </section>

      <section id="niveles">
        <div className="eyebrow reveal">CÓMO FUNCIONA</div>
        <h2 className="reveal">4 niveles. Un solo link.</h2>
        <p className="sub reveal">Mientras más referís, más ganás — sin límite de tiempo ni de personas a las que podés ofrecerles el beneficio.</p>
        <div className="network-diagram reveal"><LevelsNetwork /></div>
        <div className="lvl-legend">
          <div className="lvl-tag in"><span className="dot-c" style={{ background: 'var(--gold)' }}></span>Vos → <b>20%</b> nivel 1 (directo)</div>
          <div className="lvl-tag in"><span className="dot-c" style={{ background: 'var(--cyan)' }}></span>Niveles 2, 3 y 4 → <b>7%</b> c/u</div>
        </div>
        <div className="total-badge reveal">TOTAL POSIBLE POR LÍNEA: 41%</div>
      </section>

      <section id="calc">
        <div className="eyebrow reveal">EJEMPLO NUMÉRICO</div>
        <h2 className="reveal">Movelo vos mismo</h2>
        <p className="sub reveal">Ajustá lo que dejó cada persona de tu línea y mirá cuánto cobrás.</p>
        <Calculadora />
      </section>

      <section id="pagos">
        <div className="eyebrow reveal">PAGOS</div>
        <h2 className="reveal">Todos los días. Sin excusas.</h2>
        <div className="clockwrap">
          <div className="clock reveal"><div className="hand h"></div><div className="hand m"></div></div>
          <div className="paylist reveal">
            <div>💸 <b>Frecuencia:</b> todos los días</div>
            <div>🕐 <b>Corte:</b> 1 AM horario México</div>
            <div>📊 <b>Cálculo:</b> sobre la ganancia neta de tus referidos ese día</div>
            <div>⚠️ <b>Día en pérdida:</b> no se cobra, se retoma solo cuando vuelve la ganancia</div>
            <div>🔁 Sin deuda acumulada — simplemente se pausa y sigue</div>
          </div>
        </div>
      </section>

      <section id="pasos">
        <div className="eyebrow reveal">CÓMO EMPEZAR</div>
        <h2 className="reveal">4 pasos. Cero inversión.</h2>
        <div className="steps">
          <div className="step reveal"><p>Registrate y pedí tu link único de socio</p></div>
          <div className="step reveal"><p>Compartilo por redes, WhatsApp, donde quieras</p></div>
          <div className="step reveal"><p>Cada persona que entra queda vinculada a vos para siempre</p></div>
          <div className="step reveal"><p>Empezás a cobrar desde el primer día de ganancia</p></div>
        </div>
      </section>

      <section id="cta">
        <h2 className="reveal">¿Listo para ser socio?<br />Empezá hoy.</h2>
        <p className="reveal">Sin invertir. Sin arriesgar. Solo compartiendo.</p>
        <a href="/wsp.html" className="btn reveal">📲 QUIERO MI LINK</a>
      </section>

      <footer>
        <div className="recash-logo"><span className="dotmark"></span>RECASH</div>
        <small>POWERED BY RECASH</small>
      </footer>
    </>
  );
}
