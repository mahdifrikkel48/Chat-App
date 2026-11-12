import React, { useEffect, useState } from 'react';
import './App.css';

function Profil() {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {

        const getProfil = async () => {

            const token = localStorage.getItem('token');

            if (!token) {
                window.location.href = '/';
                return;
            }

            try {

                const response = await fetch(
                    'http://127.0.0.1:8000/api/profil',
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {

                    if (response.status === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/';
                        return;
                    }

                    throw new Error(data.message || 'Erreur de chargement');
                }

                setUser(data.user);

            } catch (error) {
                console.log(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        getProfil();

    }, []);


    // DECONNEXION
    const logout = async () => {

        const token = localStorage.getItem('token');

        try {

            const response = await fetch(
                'http://127.0.0.1:8000/api/logout',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Erreur de déconnexion');
            }

            localStorage.removeItem('token');
            localStorage.removeItem('user');

            window.location.href = '/';

        } catch (error) {
            console.log(error);
            setError(error.message);
        }
    };


    // ---------- chargement ----------
    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <div className="profile-loading">
                        <span className="spinner dark"></span> Chargement du profil...
                    </div>
                </div>
            </div>
        );
    }

    // ---------- erreur sans données ----------
    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <h1>Profil</h1>
                    <p className="subtitle">
                        {error ? '' : 'Aucun utilisateur trouvé'}
                    </p>
                    {error && <div className="error">{error}</div>}
                    <button
                        type="button"
                        className="btn"
                        onClick={() => { window.location.href = '/'; }}
                    >
                        Retour à la connexion
                    </button>
                </div>
            </div>
        );
    }

    const initials =
        `${(user.prenom || '').charAt(0)}${(user.name || '').charAt(0)}`.toUpperCase() || '?';

    const birth = user.date_nais
        ? new Date(user.date_nais).toLocaleDateString('fr-FR')
        : '—';

    const rows = [
        ['Nom', user.name],
        ['Prénom', user.prenom],
        ['Date de naissance', birth],
        ['Email', user.email],
        ['Pays', user.country],
    ];

    return (
        <div className="profile-page">
            <div className="profile-card">

                <div className="profile-avatar">{initials}</div>

                <h1>Mon Profil</h1>
                <p className="subtitle">{`${user.prenom || ''} ${user.name || ''}`.trim()}</p>

                <ul className="profile-list">
                    {rows.map(([label, value]) => (
                        <li key={label}>
                            <span>{label}</span>
                            <b>{value || '—'}</b>
                        </li>
                    ))}
                </ul>

                {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}

                <button type="button" className="btn" onClick={logout}>
                    Déconnexion
                </button>

            </div>
        </div>
    );
}

export default Profil;