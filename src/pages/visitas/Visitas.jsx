import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiSearch, FiClock, FiCheckCircle, FiBell } from 'react-icons/fi';
import Swal from 'sweetalert2';
import '../../styles/Visitas.css';
import API from '../../config/api';
import NavBar from '../../navigation/NavBar';

const Visitas = () => {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [notificaciones, setNotificaciones] = useState([]);
  const [activeTab, setActiveTab] = useState('activos');
  const visitsPerPage = 10;

  
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroHora, setFiltroHora] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  const navigate = useNavigate();

  const fetchVisitas = async () => {
    try {
      if (!loading) {
        // Solo mostrar loading en carga inicial
        setError(null);
      } else {
        setLoading(true);
        setError(null);
      }

      const response = await fetch(API.visitas.getAll, {
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });

      if (!response.ok) throw new Error('Error al obtener los datos');

      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Formato inesperado de datos recibidos');
      }

      setVisitas(data.data);
      
      // Limpiar error si la petición fue exitosa
      if (error) setError(null);
    } catch (err) {
      // Solo mostrar error si es la carga inicial o si es un error diferente de timeout
      if (loading || err.name !== 'AbortError') {
        console.warn('Error al actualizar visitas:', err.message);
        if (loading) {
          setError(err.message);
          Swal.fire({
            title: 'Error',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#2b91e7'
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitas();
    fetchNotificaciones();
   
    const interval = setInterval(() => {
      // Solo actualizar si no hay errores de conexión previos
      if (!error) {
        fetchVisitas();
        fetchNotificaciones();
      }
    }, 60000); // Cambiar a 60 segundos para reducir carga
    return () => clearInterval(interval);
  }, [error]);

  const fetchNotificaciones = async () => {
    try {
      const response = await fetch(API.notificaciones.getAll, {
        signal: AbortSignal.timeout(8000) // 8 segundos timeout
      });
      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data.data || []);
      }
    } catch (error) {
      // Solo log en consola, no mostrar error al usuario para notificaciones
      if (error.name !== 'AbortError') {
        console.warn('Error al cargar notificaciones:', error.message);
      }
    }
  };

  const limpiarNotificaciones = async () => {
    try {
      const response = await fetch(API.notificaciones.markAllAsRead, {
        method: 'PUT'
      });
      if (response.ok) {
        setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      }
    } catch (error) {
      console.error('Error al marcar notificaciones como leídas:', error);
    }
  };

  const handleRegistroVisita = () => navigate('/registrosV');
  const handleEditar = (id) => navigate(`/editar/${id}`);
  const handleDetalle = (id) => navigate(`/detalles/${id}`);

  const handleBorrar = async (id) => {
    const confirmResult = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2b91e7',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmResult.isConfirmed) {
      try {
        console.log('Intentando eliminar visita ID:', id);
        
       
        const notificacionesRelacionadas = notificaciones.filter(n => n.visita_id == id);
        console.log('Notificaciones a eliminar:', notificacionesRelacionadas.length);
        
        for (const notif of notificacionesRelacionadas) {
          try {
            await fetch(`https://189.136.60.147/notificaciones/${notif.id}`, {
              method: 'DELETE',
            });
            console.log(`Notificación ${notif.id} eliminada`);
          } catch (error) {
            console.warn(`Error eliminando notificación ${notif.id}:`, error);
          }
        }
        
       
        const response = await fetch(API.visitas.delete(id), {
          method: 'DELETE',
        });

        console.log('Respuesta del servidor:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error del servidor:', errorText);
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        setVisitas(visitas.filter((visita) => visita.id !== id));
        fetchNotificaciones();
        
        Swal.fire({
          title: '¡Eliminado!',
          text: 'La visita ha sido eliminada.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error completo:', error);
        Swal.fire({
          title: 'Error',
          text: error.message || 'No se pudo eliminar la visita',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2b91e7'
        });
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' 
      };
      return date.toLocaleDateString('es-MX', options)
        .replace(/\b\w/g, l => l.toUpperCase());
    } catch {
      return 'Fecha inválida';
    }
  };


  const visitasActivas = visitas.filter(v => !v.escaneado).length;
  const visitasHistorial = visitas.filter(v => v.escaneado).length;

  const visitasFiltradas = visitas.filter((visita) => {
    const nombreCompleto = `${visita.nombre} ${visita.apellidoPaterno} ${visita.apellidoMaterno}`.toLowerCase();
    const horaVisita = visita.hora?.substring(0, 5) || '';

    const filtroNombreOk = nombreCompleto.includes(filtroNombre.trim().toLowerCase());
    const filtroHoraOk = horaVisita.includes(filtroHora.trim());
    const filtroDepartamentoOk = visita.departamento?.toLowerCase().includes(filtroDepartamento.trim().toLowerCase()) ?? true;
    const filtroFechaOk = filtroFecha ? visita.dia === filtroFecha : true;
    

    const tabFilter = activeTab === 'activos' ? !visita.escaneado : visita.escaneado;

    return filtroNombreOk && filtroHoraOk && filtroDepartamentoOk && filtroFechaOk && tabFilter;
  });

  
  const indexOfLastVisit = currentPage * visitsPerPage;
  const indexOfFirstVisit = indexOfLastVisit - visitsPerPage;
  const currentVisits = visitasFiltradas.slice(indexOfFirstVisit, indexOfLastVisit);
  const totalPages = Math.ceil(visitasFiltradas.length / visitsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroNombre, filtroHora, filtroDepartamento, filtroFecha]);

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Cargando visitas...</p>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <div className="error-card">
        <h2>Error al cargar datos</h2>
        <p>{error}</p>
        <button className="retry-btn" onClick={fetchVisitas}>
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <NavBar />
      <br />
      <br />
      <br />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-title">
            <h1>Registro de Visitas</h1>
            <div className="tabs-container">
              <button 
                className={`tab-btn ${activeTab === 'activos' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('activos');
                  setCurrentPage(1);
                }}
              >
                Activos ({visitasActivas})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('historial');
                  setCurrentPage(1);
                }}
              >
                Historial ({visitasHistorial})
              </button>
            </div>
          </div>
          <div className="header-actions">
            {notificaciones.filter(n => !n.leida).length > 0 && (
              <div className="notifications-container">
                <button className="notification-btn" onClick={() => {
                  const notifNoLeidas = notificaciones.filter(n => !n.leida);
                  const notifList = notifNoLeidas.map((n, index) => 
                    `<div class="notification-item">
                      <div class="notification-number">${index + 1}</div>
                      <div class="notification-content">
                        <div class="notification-message">${n.mensaje}</div>
                        <div class="notification-time">${(() => {
                          try {
                            const fecha = n.fecha_escaneo || n.created_at;
                            if (!fecha) return 'No disponible';
                            
                            const dateObj = new Date(fecha);
                            if (isNaN(dateObj.getTime())) return 'No disponible';
                            
                           
                            const day = dateObj.getUTCDate().toString().padStart(2, '0');
                            const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
                            const year = dateObj.getUTCFullYear();
                            const hour = dateObj.getUTCHours().toString().padStart(2, '0');
                            const minute = dateObj.getUTCMinutes().toString().padStart(2, '0');
                            
                            return `${day}/${month}/${year} - ${hour}:${minute}`;
                          } catch (error) {
                            return 'Fecha no disponible';
                          }
                        })()}</div>
                      </div>
                    </div>`
                  ).join('');
                  
                  Swal.fire({
                    title: `🔔 Nuevos Ingresos (${notifNoLeidas.length})`,
                    html: `
                      <div class="notifications-list">
                        ${notifList}
                      </div>
                    `,
                    icon: false,
                    confirmButtonColor: '#2b91e7',
                    showCancelButton: true,
                    confirmButtonText: '✓ Marcar como leídas',
                    cancelButtonText: 'Cerrar',
                    customClass: {
                      popup: 'notifications-popup',
                      htmlContainer: 'notifications-html-container'
                    },
                    width: '500px'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      limpiarNotificaciones();
                    }
                  });
                }}>
                  <FiBell className="btn-icon" />
                  <span className="notification-badge">{notificaciones.filter(n => !n.leida).length}</span>
                </button>
              </div>
            )}
            <button className="primary-btn add-btn" onClick={handleRegistroVisita}>
              <FiPlus className="btn-icon" /> Nueva Visita
            </button>
          </div>
        </div>

        <div className="stats-badge">
          <span>{visitasFiltradas.length} visitas {activeTab === 'activos' ? 'activas' : 'en historial'}</span>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <FiSearch className="filter-icon" />
            <input
              type="text"
              placeholder="Nombre del visitante"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <FiClock className="filter-icon" />
            <input
              type="text"
              placeholder="Hora (HH:MM)"
              value={filtroHora}
              onChange={(e) => setFiltroHora(e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <FiSearch className="filter-icon" />
            <input
              type="text"
              placeholder="Departamento"
              value={filtroDepartamento}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="filter-input date-input"
            />
          </div>
        </div>

        <div className="data-card">
          
          <div className="table-responsive">
            <table className="visitas-table">
              <thead className="visitas-table-header">
                <tr>
                  <th className="visitas-table-header-cell">Visitante</th>
                  <th className="visitas-table-header-cell">Lugar</th>
                  <th className="visitas-table-header-cell">Hora</th>
                  <th className="visitas-table-header-cell">Fecha</th>
                  <th className="visitas-table-header-cell">Departamento</th>
                  <th className="visitas-table-header-cell">Estado</th>
                  <th className="visitas-table-header-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentVisits.length > 0 ? (
                  currentVisits.map(visita => (
                    <tr key={visita.id} className={`visitas-table-row ${visita.escaneado ? 'escaneada' : ''}`}>
                      <td className="visitas-table-cell">
                        {`${visita.nombre} ${visita.apellidoPaterno} ${visita.apellidoMaterno}`}
                      </td>
                      <td className="visitas-table-cell">{visita.lugar || '-'}</td>
                      <td className="visitas-table-cell">{visita.hora?.substring(0, 5) || '-'}</td>
                      <td className="visitas-table-cell">{formatDate(visita.dia)}</td>
                      <td className="visitas-table-cell">{visita.departamento || '-'}</td>
                      <td className="visitas-table-cell">
                        {visita.escaneado ? (
                          <span className="status-badge ingresado">
                            <FiCheckCircle /> Ingresó
                          </span>
                        ) : (
                          <span className="status-badge pendiente">Pendiente</span>
                        )}
                      </td>
                      <td className="visitas-table-cell visitas-action-cell">
                        <button
                          className={`action-btn edit-btn ${visita.escaneado ? 'disabled' : ''}`}
                          onClick={() => !visita.escaneado && handleEditar(visita.id)}
                          title={visita.escaneado ? "No se puede editar" : "Editar"}
                          disabled={visita.escaneado}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className={`action-btn delete-btn ${visita.escaneado ? 'disabled' : ''}`}
                          onClick={() => !visita.escaneado && handleBorrar(visita.id)}
                          title={visita.escaneado ? "No se puede eliminar" : "Eliminar"}
                          disabled={visita.escaneado}
                        >
                          <FiTrash2 />
                        </button>
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleDetalle(visita.id)}
                          title="Detalles"
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="no-data-row">
                    <td colSpan="7">
                      <div className="no-data-message">
                        No se encontraron visitas con los filtros actuales
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          
          <div className="visitas-cards">
            {currentVisits.length > 0 ? (
              currentVisits.map(visita => (
                <div key={visita.id} className={`visita-card ${visita.escaneado ? 'escaneada' : ''}`}>
                  <div className="card-row">
                    <span className="card-label">Visitante:</span>
                    <span className="card-value">
                      {`${visita.nombre} ${visita.apellidoPaterno} ${visita.apellidoMaterno}`}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Lugar:</span>
                    <span className="card-value">{visita.lugar || '-'}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Hora:</span>
                    <span className="card-value">{visita.hora?.substring(0, 5) || '-'}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Fecha:</span>
                    <span className="card-value">{formatDate(visita.dia)}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Departamento:</span>
                    <span className="card-value">{visita.departamento || '-'}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Estado:</span>
                    <span className="card-value">
                      {visita.escaneado ? (
                        <span className="status-badge ingresado">
                          <FiCheckCircle /> Ingresó
                        </span>
                      ) : (
                        <span className="status-badge pendiente">Pendiente</span>
                      )}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button
                      className={`action-btn edit-btn ${visita.escaneado ? 'disabled' : ''}`}
                      onClick={() => !visita.escaneado && handleEditar(visita.id)}
                      title={visita.escaneado ? "No se puede editar" : "Editar"}
                      disabled={visita.escaneado}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className={`action-btn delete-btn ${visita.escaneado ? 'disabled' : ''}`}
                      onClick={() => !visita.escaneado && handleBorrar(visita.id)}
                      title={visita.escaneado ? "No se puede eliminar" : "Eliminar"}
                      disabled={visita.escaneado}
                    >
                      <FiTrash2 />
                    </button>
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleDetalle(visita.id)}
                      title="Detalles"
                    >
                      <FiEye />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-message">
                No se encontraron visitas con los filtros actuales
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Visitas;