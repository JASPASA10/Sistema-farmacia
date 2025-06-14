import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onToggleForm: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Google Sign-In initialization
  useEffect(() => {
    const initGoogleLogin = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "TU_CLIENT_ID_GOOGLE.apps.googleusercontent.com",
          callback: handleGoogleLogin
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-login-btn"),
          { 
            type: "icon",
            shape: "pill",
            theme: "outline",
            size: "large",
            text: "signin_with",
            logo_alignment: "left"
          }
        );
      }
    };

    // Load Google Sign-In script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogleLogin;
      document.head.appendChild(script);
    } else {
      initGoogleLogin();
    }
  }, []);

  const handleGoogleLogin = (response: any) => {
    try {
      const userData = JSON.parse(atob(response.credential.split('.')[1]));
      console.log("Datos del usuario Google:", userData);
      
      // Simulate login with Google data
      login({
        email: userData.email,
        password: 'google-auth' // Special password for Google auth
      });
    } catch (error) {
      setError('Error al iniciar sesión con Google');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    const success = await login(formData);
    if (!success) {
      setError('Credenciales inválidas. Intenta con admin@farmacia.com / admin123');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>Bienvenido de nuevo</h1>
        <p>Inicia sesión para acceder a tu cuenta</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-control"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="divider">o continúa con</div>

      <div id="google-login-btn" className="btn btn-google">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </div>

      <div className="login-footer">
        ¿No tienes una cuenta? <a href="#" onClick={(e) => { e.preventDefault(); onToggleForm(); }}>Regístrate</a>
      </div>

      <div className="demo-credentials">
        <h4>Credenciales de Prueba:</h4>
        <div className="credentials-list">
          <p><strong>Admin:</strong> admin@farmacia.com / admin123</p>
          <p><strong>Farmacéutico:</strong> farmacia@demo.com / demo123</p>
        </div>
      </div>
    </div>
  );
};