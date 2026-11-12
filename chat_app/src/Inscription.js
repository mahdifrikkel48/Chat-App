// src/Inscription.js
import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const ICONS = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6',
  lock: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z M7 11V7a5 5 0 0 1 10 0v4',
  globe:
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M2 12h20 M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z',
  calendar:
    'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M16 2v4 M8 2v4 M3 10h18',
};

function Icon({ name }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

function Eye() {
  return (
    <span className="eye">
      <span className="pupil" />
    </span>
  );
}

function Char({ cls, eyes = 2 }) {
  return (
    <div className={`char ${cls}`}>
      <div className="body">
        <div className="face">
          <div className="eyes">
            {Array.from({ length: eyes }).map((_, i) => (
              <Eye key={i} />
            ))}
          </div>
          <div className="mouth" />
        </div>
      </div>
    </div>
  );
}

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return pw ? Math.max(score, 1) : 0;
}

const LABELS = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];

function Inscription() {
  const stageRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const lastType = useRef(0);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [password, setPassword] = useState('');
  const [focusField, setFocusField] = useState(null);

  // ---- les yeux des personnages suivent la cible (souris ou champ actif) ----
  const look = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const { x: tx, y: ty } = target.current;

    stage.querySelectorAll('.char').forEach((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + Math.min(r.height * 0.25, 60);
      const dx = tx - cx;
      const dy = ty - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, dist / 280);
      el.style.setProperty('--px', ((dx / dist) * k).toFixed(3));
      el.style.setProperty('--py', ((dy / dist) * k).toFixed(3));
    });
  }, []);

  useEffect(() => {
    target.current = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.4 };
    look();

    const onMove = (e) => {
      // pendant qu'on tape, ils regardent le champ
      if (Date.now() - lastType.current < 1500) return;
      target.current = { x: e.clientX, y: e.clientY };
      look();
    };

    const onField = (e) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement)) return;
      const r = t.getBoundingClientRect();
      target.current = {
        x: r.left + Math.min(r.width - 24, 24 + t.value.length * 8),
        y: r.top + r.height / 2,
      };
      lastType.current = Date.now();
      look();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', look);
    document.addEventListener('focusin', onField);
    document.addEventListener('input', onField);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', look);
      document.removeEventListener('focusin', onField);
      document.removeEventListener('input', onField);
    };
  }, [look]);

  const triggerError = (msg) => {
    setError(msg);
    setFlash(true);
    setTimeout(() => setFlash(false), 1600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formElement = e.target;
    const form = new FormData(formElement);

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/Chat_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: form.get('name'),
          prenom: form.get('prenom'),
          date_nais: form.get('date_nais'),
          country: form.get('country'),
          email: form.get('email'),
          password: form.get('password'),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        const msg = data.errors
          ? Object.values(data.errors).flat().join('\n')
          : data.message || 'Une erreur est survenue.';
        triggerError(msg);
        return;
      }

      formElement.reset();
      setPassword('');
      setSuccess(true);
    } catch (err) {
      console.log(err);
      triggerError('Impossible de contacter le serveur. Vérifie que Laravel est lancé.');
    } finally {
      setLoading(false);
    }
  };

  // ---- humeur des personnages ----
  let mood = 'idle';
  if (success) mood = 'success';
  else if (flash) mood = 'error';
  else if (focusField === 'password') mood = showPw ? 'peek' : 'hide';
  else if (focusField) mood = 'typing';

  const strength = getStrength(password);

  return (
    <div className="page" data-mood={mood}>
      <div className="stars" />
      <div className="stars s2" />

      {/* ============ SCÈNE ============ */}
      <section className="stage" ref={stageRef}>
        <span className="spark a" />
        <span className="spark b" />
        <span className="spark c" />
        <span className="spark d" />

        <div className="portal glow" />
        <div className="portal ring" />
        <div className="portal ring2" />

        <div className="cast">
          <Char cls="red" />
          <Char cls="black" />
          <Char cls="blue" />
          <Char cls="ball" eyes={1} />
        </div>

        <div className="caption">
          <b>Ils</b> te regardent…
        </div>
      </section>

      {/* ============ FORMULAIRE ============ */}
      <section className="panel">
        <div className={`card ${flash ? 'shake' : ''}`}>
          {success ? (
            <div className="success">
              <svg className="check" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#e11d2e" />
                    <stop offset="100%" stopColor="#0a0a0a" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="46" />
                <path d="M30 52 L44 66 L71 36" />
              </svg>
              <h2>Bienvenue !</h2>
              <p>Ton compte a été créé. Tu fais maintenant partie de l'autre monde.</p>
              <Link to="/" className="btn ghost" style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }}>
                Se connecter
              </Link>
            </div>
          ) : (
            <>
              <span className="badge">
                <i /> INSCRIPTION
              </span>
              <h1>Entre dans l'autre monde</h1>
              <p className="subtitle">
                Crée ton compte en quelques secondes. Nos petits amis t'attendent.
              </p>

              <form
                className="form"
                onSubmit={handleSubmit}
                onFocus={(e) => setFocusField(e.target.name || null)}
                onBlur={() => setFocusField(null)}
              >
                <div className="row">
                  <div className="field" style={{ '--i': 0 }}>
                    <Icon name="user" />
                    <input id="name" name="name" placeholder=" " required autoComplete="family-name" />
                    <label htmlFor="name">Nom</label>
                  </div>
                  <div className="field" style={{ '--i': 1 }}>
                    <Icon name="user" />
                    <input id="prenom" name="prenom" placeholder=" " required autoComplete="given-name" />
                    <label htmlFor="prenom">Prénom</label>
                  </div>
                </div>

                <div className="row">
                  <div className="field always" style={{ '--i': 2 }}>
                    <Icon name="calendar" />
                    <input id="date_nais" type="date" name="date_nais" placeholder=" " required />
                    <label htmlFor="date_nais">Date de naissance</label>
                  </div>
                  <div className="field" style={{ '--i': 3 }}>
                    <Icon name="globe" />
                    <input id="country" name="country" placeholder=" " required autoComplete="country-name" />
                    <label htmlFor="country">Pays</label>
                  </div>
                </div>

                <div className="field" style={{ '--i': 4 }}>
                  <Icon name="mail" />
                  <input id="email" name="email" type="email" placeholder=" " required autoComplete="email" />
                  <label htmlFor="email">Adresse email</label>
                </div>

                <div>
                  <div className="field" style={{ '--i': 5 }}>
                    <Icon name="lock" />
                    <input
                      id="password"
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      placeholder=" "
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <label htmlFor="password">Mot de passe</label>
                    <button
                      type="button"
                      className="toggle"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPw(!showPw)}
                      aria-label="Afficher / masquer le mot de passe"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {showPw ? (
                          <>
                            <path d="M17.94 17.94A10 10 0 0 1 12 20C5 20 1 12 1 12a18 18 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19" />
                            <path d="M1 1l22 22" />
                          </>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>

                  <div className={`strength lvl-${strength}`}>
                    <div className="bars">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                    <small>{LABELS[strength]}</small>
                  </div>
                </div>

                {error && <div className="error">{error}</div>}

                <button className="btn" type="submit" disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? 'Envoi en cours...' : "S'inscrire"}
                </button>
              </form>

              <p className="switch">
                Déjà un compte ? <Link to="/">Se connecter</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Inscription;