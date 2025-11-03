import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);
        
        if (result.success) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user.role === 'student') {
                navigate('/student-dashboard');
            } else if (user.role === 'teacher') {
                navigate('/teacher-dashboard');
            } else {
                navigate('/admin-dashboard');
            }
        } else {
            setError(result.message);
        }
        
        setLoading(false);
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        },
        card: {
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            padding: '40px',
            width: '100%',
            maxWidth: '400px'
        },
        title: {
            textAlign: 'center',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '10px'
        },
        subtitle: {
            textAlign: 'center',
            color: '#666',
            marginBottom: '30px'
        },
        label: {
            display: 'block',
            fontWeight: '600',
            color: '#333',
            marginBottom: '8px'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            marginBottom: '20px',
            outline: 'none'
        },
        button: {
            width: '100%',
            padding: '14px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
        },
        error: {
            background: '#fee',
            border: '1px solid #fcc',
            color: '#c33',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
        },
        demo: {
            marginTop: '30px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#666',
            borderTop: '1px solid #eee',
            paddingTop: '20px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🎓 Student Performance System</h1>
                <p style={styles.subtitle}>Login to continue</p>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={styles.demo}>
                    <p style={{fontWeight: 'bold', marginBottom: '10px'}}>Demo Credentials:</p>
                    <p>👨‍🏫 Teacher: teacher1 / teacher123</p>
                    <p>👨‍🎓 Student: student1 / student123</p>
                    <p>👨‍💼 Admin: admin / admin123</p>
                </div>
            </div>
        </div>
    );
}

export default Login;