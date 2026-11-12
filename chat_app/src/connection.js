import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function Character({ className }) {
    return (
        <div className={`char ${className}`}>
            <div className="body">
                <div className="face">
                    <div className="eyes">
                        <div className="eye"><div className="pupil"></div></div>
                        {className !== 'ball' && <div className="eye"><div className="pupil"></div></div>}
                    </div>
                    <div className="mouth"></div>
                </div>
            </div>
        </div>
    );
}

function Connection() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [show, setShow] = useState(false);
    const [focus, setFocus] = useState(null);   // 'email' | 'password' | null
    const [shake, setShake] = useState(false);
    const castRef = useRef(null);

    // les yeux suivent la souris
    const onMouseMove = (e) => {
        if (!castRef.current) return;
        castRef.current.querySelectorAll('.char').forEach((el) => {
            const r = el.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
            const dy = (e.clientY - (r.top + r.height / 3)) / (window.innerHeight / 2);
            el.style.setProperty('--px', Math.max(-1, Math.min(1, dx)).toFixed(2));
            el.style.setProperty('--py', Math.max(-1, Math.min(1, dy)).toFixed(2));
        });
    };

    // humeur des personnages
    let mood = 'idle';
    if (success) mood = 'success';
    else if (error) mood = 'error';
    else if (focus === 'password') mood = show ? 'peek' : 'hide';
    else if (focus === 'email') mood = 'typing';

    const showError = (msg) => {
        setError(msg);
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const connection = async (e) => {
        e.preventDefault();

        setError('');

        if (!email || !password) {
            showError('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/api/connection',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showError(data.message || 'Erreur de connexion');
                return;
            }

            // Sauvegarder le token
            localStorage.setItem('token', data.token);

            // Sauvegarder les informations utilisateur
            localStorage.setItem('user', JSON.stringify(data.user));

            // Petite animation de succès, puis on va vers le profil
            setSuccess(true);
            setTimeout(() => {
                window.location.href = '/profil';
            }, 1200);

        } catch (error) {
            console.log(error);
            showError('Impossible de contacter le serveur Laravel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" data-mood={mood} onMouseMove={onMouseMove}>
            <div className="stars"></div>
            <div className="stars s2"></div>

            {/* ---------- scène ---------- */}
            <section className="stage">
                <div className="portal glow"></div>
                <div className="portal ring"></div>
                <div className="portal ring2"></div>
                <span className="spark a"></span>
                <span className="spark b"></span>
                <span className="spark c"></span>
                <span className="spark d"></span>

                <div className="cast" ref={castRef}>
                    <Character className="blue" />
                    <Character className="red" />
                    <Character className="black" />
                    <Character className="ball" />
                </div>

                <div className="caption"><b>Bienvenue</b> · espace membre</div>
            </section>

            {/* ---------- formulaire ---------- */}
            <section className="panel">
                <div className={`card${shake ? ' shake' : ''}`}>

                    <span className="badge"><i></i>ESPACE MEMBRE</span>
                    <h1>Connexion</h1>
                    <p className="subtitle">Entrez vos identifiants pour accéder à votre compte.</p>

                    <form className="form" onSubmit={connection} noValidate>

                        <div className="field" style={{ '--i': 0 }}>
                            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="5" width="18" height="14" rx="3" />
                                <path d="m4 7 8 6 8-6" />
                            </svg>
                            <input
                                id="email"
                                type="email"
                                placeholder=" "
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                onFocus={() => setFocus('email')}
                                onBlur={() => setFocus(null)}
                            />
                            <label htmlFor="email">Email</label>
                        </div>

                        <div className="field" style={{ '--i': 1 }}>
                            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="4" y="11" width="16" height="9" rx="3" />
                                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                            </svg>
                            <input
                                id="password"
                                type={show ? 'text' : 'password'}
                                placeholder=" "
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                onFocus={() => setFocus('password')}
                                onBlur={() => setFocus(null)}
                            />
                            <label htmlFor="password">Mot de passe</label>
                            <button
                                type="button"
                                className="toggle"
                                aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShow(!show)}
                            >
                                {show ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 3l18 18" />
                                        <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.7A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4-.8" />
                                        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {error && <div className="error">{error}</div>}

                        <button className="btn" type="submit" disabled={loading || success}>
                            {loading && <span className="spinner"></span>}
                            {loading ? 'Connexion...' : success ? 'Connecté ✓' : 'Se connecter'}
                        </button>
                    </form>

                    <p className="switch">
                        Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
                    </p>

                </div>
            </section>
        </div>
    );
}

export default Connection;