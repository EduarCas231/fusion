import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../navigation/NavBar';
import API from '../../config/api';
import { FaUsers, FaUserTag, FaTh, FaList, FaEdit } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/Users.css';

const Users = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('grid'); 

  const handleEditUser = (userId) => {
    navigate(`/users/edit/${userId}`);
  };

  useEffect(() => {
    const fetchUsuarios = async () => {
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

        const data = await response.json();
        setUsuarios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  const getTipoUsuario = (tipo) => {
    const tipos = {
      1: { nombre: 'Administrador', color: '#e74c3c' },
      2: { nombre: 'Operador', color: '#3498db' },
      3: { nombre: 'Semáforo', color: '#f39c12' },
      4: { nombre: 'Visitas', color: '#2ecc71' },
      5: { nombre: 'Escáner', color: '#9b59b6' }
    };
    return tipos[tipo] || { nombre: 'Desconocido', color: '#95a5a6' };
  };

  if (loading) {
    return (
      <div>
        <NavBar />
        <div className="users-container">
          <LoadingSpinner message="Cargando usuarios..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <NavBar />
        <div className="users-container">
          <div className="error-message">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="users-container">
        <div className="users-header">
          <div className="header-left">
            <FaUsers className="header-icon" />
            <h2>Gestión de Usuarios</h2>
          </div>
          <div className="header-right">
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewType === 'grid' ? 'active' : ''}`}
                onClick={() => setViewType('grid')}
              >
                <FaTh />
              </button>
              <button 
                className={`toggle-btn ${viewType === 'list' ? 'active' : ''}`}
                onClick={() => setViewType('list')}
              >
                <FaList />
              </button>
            </div>
            <span className="users-count">{usuarios.length} usuarios</span>
          </div>
        </div>
        
        <div className={`users-container-view ${viewType === 'list' ? 'list-view' : 'grid-view'}`}>
          {usuarios.map((usuario) => {
            const tipoInfo = getTipoUsuario(usuario.tipo);
            return (
              <div key={usuario.id_user} className={`user-card ${viewType}`}>
                <div className="user-avatar">
                  <FaUserTag />
                </div>
                <div className="user-info">
                  <h3 className="user-name">
                    {usuario.nombre} {usuario.app} {usuario.apm}
                  </h3>
                  <div 
                    className="user-type"
                    style={{ backgroundColor: tipoInfo.color }}
                  >
                    {tipoInfo.nombre}
                  </div>
                </div>
                <button 
                  className="edit-btn"
                  onClick={() => handleEditUser(usuario.id_user)}
                  title="Editar usuario"
                >
                  <FaEdit />
                </button>
              </div>
            );
          })}
        </div>
        
        {usuarios.length === 0 && (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <p>No hay usuarios registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;