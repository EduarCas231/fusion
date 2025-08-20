import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../navigation/NavBar';
import API from '../../config/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaUser, FaSave, FaArrowLeft } from 'react-icons/fa';
import '../../styles/EditUser.css';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    app: '',
    apm: '',
    correo: '',
    password: '',
    tipo: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API.users.getAll, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener usuarios');
        }

        const users = await response.json();
        const user = users.find(u => u.id_user === parseInt(id));
        
        if (user) {
          setFormData({
            nombre: user.nombre || '',
            app: user.app || '',
            apm: user.apm || '',
            correo: user.correo || '',
            password: '',
            tipo: user.tipo || ''
          });
        } else {
          setError('Usuario no encontrado');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const updateData = {};
      
      
      if (formData.nombre.trim()) updateData.nombre = formData.nombre.trim();
      if (formData.app.trim()) updateData.app = formData.app.trim();
      if (formData.apm.trim()) updateData.apm = formData.apm.trim();
      if (formData.correo.trim()) updateData.correo = formData.correo.trim();
      if (formData.password.trim()) updateData.password = formData.password.trim();
      if (formData.tipo) updateData.tipo = parseInt(formData.tipo);

      const response = await fetch(API.users.update(id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar usuario');
      }

      navigate('/users');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <NavBar />
        <div className="edit-user-container">
          <div className="loading-container">
            <LoadingSpinner message="Cargando usuario..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="edit-user-container">
        <div className="edit-user-header">
          <button className="back-btn" onClick={() => navigate('/users')}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="header-content">
            <FaUser className="header-icon" />
            <h2>Editar Usuario</h2>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingrese el nombre"
              />
            </div>
            <div className="form-group">
              <label htmlFor="app">Apellido Paterno</label>
              <input
                type="text"
                id="app"
                name="app"
                value={formData.app}
                onChange={handleChange}
                placeholder="Ingrese el apellido paterno"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="apm">Apellido Materno</label>
              <input
                type="text"
                id="apm"
                name="apm"
                value={formData.apm}
                onChange={handleChange}
                placeholder="Ingrese el apellido materno"
              />
            </div>
            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="Ingrese el correo electrónico"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Dejar vacío para mantener la actual"
              />
            </div>
            <div className="form-group">
              <label htmlFor="tipo">Tipo de Usuario</label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
              >
                <option value="">Seleccionar tipo</option>
                <option value="1">Administrador</option>
                <option value="2">Operador</option>
                <option value="3">Semáforo</option>
                <option value="4">Visitas</option>
                <option value="5">Escáner</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/users')}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={saving}
            >
              <FaSave />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;