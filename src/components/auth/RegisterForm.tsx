import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormProps {
  onToggleForm: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'pharmacist',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const success = await register(formData);
    if (!success) {
      setError('Error al crear la cuenta. Intenta nuevamente.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>Crear Cuenta</h1>
        <p>Únete al sistema de farmacia</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre Completo</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            placeholder="Tu nombre completo"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

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
          <label htmlFor="role">Tipo de Usuario</label>
          <select
            id="role"
            name="role"
            className="form-control"
            value={formData.role}
            onChange={handleInputChange}
          >
            <option value="user">Usuario General</option>
            <option value="pharmacist">Farmacéutico</option>
          </select>
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

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className={`form-control ${formData.confirmPassword ? (passwordsMatch ? 'valid' : 'invalid') : ''}`}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          {formData.confirmPassword && (
            <div className={`password-match ${passwordsMatch ? 'match' : 'no-match'}`}>
              {passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>

      <div className="login-footer">
        ¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); onToggleForm(); }}>Inicia sesión aquí</a>
      </div>
    </div>
  );
};