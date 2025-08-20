import React, { useEffect, useState, useCallback } from 'react';
import NavBar from '../../navigation/NavBar';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/Pedidos.css';
import NormaIcon from '../../components/NormaIcon';
import API from '../../config/api';


const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPedidos = useCallback(async () => {
    try {
      if (!initialLoad) setIsLoading(true);
      const response = await fetch(API.pedidos.getAll);
      if (!response.ok) throw new Error('Error al obtener pedidos');
      const newData = await response.json();
      
      setPedidos(prevPedidos => {
        const idsPrevios = new Set(prevPedidos.map(p => p.id_pedidos));
        const nuevosIds = new Set(newData.map(p => p.id_pedidos));
        
        const sameLength = newData.length === prevPedidos.length;
        const sameContent = sameLength && newData.every(p => 
          idsPrevios.has(p.id_pedidos) && 
          JSON.stringify(p) === JSON.stringify(prevPedidos.find(prev => prev.id_pedidos === p.id_pedidos))
        );

        if (sameContent) {
          return prevPedidos;
        }
        
        const pedidosMap = new Map(prevPedidos.map(p => [p.id_pedidos, p]));
        newData.forEach(newPedido => {
          pedidosMap.set(newPedido.id_pedidos, newPedido);
        });
        
        return Array.from(pedidosMap.values()).sort((a, b) => b.id_pedidos - a.id_pedidos);
      });
    } catch (err) {
      setError(err.message);
    } finally {
      if (initialLoad) setInitialLoad(false);
      setIsLoading(false);
    }
  }, [initialLoad]);

  useEffect(() => {
    fetchPedidos();
    const intervalId = setInterval(fetchPedidos, 50000);
    return () => clearInterval(intervalId);
  }, [fetchPedidos]);

  const handleNuevoRegistro = () => {
    navigate('/registros');
  };

  const handleActualizar = (id) => {
    navigate(`/edits/${id}`); 
  };



  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const dateObj = new Date(fecha);
    dateObj.setDate(dateObj.getDate() + 1);
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrecio = (precio) => {
    if (precio === null || precio === undefined) return '';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(precio);
  };

  const formatColName = (col) => {
    return col
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatStatusText = (status) => {
    if (!status) return '';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const calcularDiasRestantes = (fechaInicio, fechaFinal) => {
    if (!fechaInicio || !fechaFinal) return null;
    
    const hoy = new Date();
    const fechaFin = new Date(fechaFinal);
    const diffTime = fechaFin - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getColorDiasRestantes = (dias) => {
    if (dias === null) return 'gray';
    if (dias < 0) return 'red';
    if (dias === 0) return 'gray';
    if (dias <= 3) return 'yellow';
    if (dias <= 5) return 'green';
    return 'blue';
  };

  const getColorEstatus = (estatus) => {
    if (!estatus) return 'gray';
    switch(estatus.toLowerCase()) {
      case 'en proceso': return 'gray';
      case 'pendiente': return 'blue';
      case 'completado': return 'green';
      default: return 'gray';
    }
  };

  const columnas = ['nombre', 'norma', 'estatus', 'fecha_inicio', 'fecha_final', 'comentario'];

  return (
    <div className="app-layout">
      <NavBar />
      <div className="content-area">
      <div className="pedidos-container">
        <div className="pedidos-header">
          <h2 className="pedidos-title">Lista de Pedidos</h2>
          <button 
            className="pedidos-button pedidos-button-success"
            onClick={handleNuevoRegistro}
          >
            <span>+</span> Nuevo Registro
          </button>
        </div>

        {error && <p className="pedidos-error-message">{error}</p>}
        
        {isLoading && !initialLoad && (
          <div className="refresh-indicator">
            <div className="loading-spinner-small"></div>
          </div>
        )}

        {initialLoad ? (
          <div className="loading-container">
            <LoadingSpinner message="Cargando pedidos..." />
          </div>
        ) : pedidos.length === 0 ? (
          <p className="pedidos-empty-message">No hay pedidos disponibles.</p>
        ) : (
          <>
           
            <div className="table-responsive">
              <table className="pedidos-table">
                <thead className="pedidos-table-header">
                  <tr>
                    {columnas.map((col) => (
                      <th key={col} className={`pedidos-table-header-cell ${col === 'comentario' ? 'comentario-cell' : ''}`}>
                        {formatColName(col)}
                      </th>
                    ))}
                    <th className="pedidos-table-header-cell">Días Restantes</th>
                    <th className="pedidos-table-header-cell">Precio</th>
                    <th className="pedidos-table-header-cell">Ultima modificación</th>
                    <th className="pedidos-table-header-cell">Acciones</th>
                  </tr>
                </thead>
              <tbody>
                {pedidos.map((pedido) => {
                  const diasRestantes = calcularDiasRestantes(pedido.fecha_inicio, pedido.fecha_final);
                  const colorDias = getColorDiasRestantes(diasRestantes);
                  const colorEstatus = getColorEstatus(pedido.estatus);
                  const isCompleted = pedido.estatus && pedido.estatus.toLowerCase() === 'completado';

                  return (
                    <tr key={pedido.id_pedidos} className={`pedidos-table-row ${isCompleted ? 'completed-row' : ''}`}>
                      {columnas.map((col) => (
                        <td key={col} className={`pedidos-table-cell ${col === 'comentario' ? 'comentario-cell' : ''}`}>
                          {col === 'estatus' ? (
                            <span className={`status-badge status-${colorEstatus}`}>
                              {formatStatusText(pedido[col])}
                            </span>
                          ) : col === 'norma' ? (
                            <NormaIcon norma={pedido[col]} />
                          ) : col.includes('fecha') ? (
                            formatFecha(pedido[col])
                          ) : (
                            pedido[col]
                          )}
                        </td>
                      ))}
                      <td className="pedidos-table-cell">
                        {diasRestantes !== null ? (
                          <span className={`dias-badge dias-${colorDias}`}>
                            {diasRestantes < 0 ? 'Expirado' : diasRestantes === 0 ? 'Hoy' : `${diasRestantes} días`}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="pedidos-table-cell">
                        {formatPrecio(pedido.precio)}
                      </td>
                      <td className="pedidos-table-cell">
                        {pedido.modificado_por_nombre
                          ? `${pedido.modificado_por_nombre} ${pedido.modificado_por_app}`
                          : 'N/A'}
                      </td>
                      <td className="pedidos-table-cell pedidos-action-cell">
                        <button
                          className="pedidos-button pedidos-button-warning"
                          onClick={() => handleActualizar(pedido.id_pedidos)}
                          disabled={pedido.estatus === 'completado'}
                        >
                          <i className="fas fa-edit"></i> Actualizar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            
            
            <div className="pedidos-cards">
              {pedidos.map((pedido) => {
                const diasRestantes = calcularDiasRestantes(pedido.fecha_inicio, pedido.fecha_final);
                const colorDias = getColorDiasRestantes(diasRestantes);
                const colorEstatus = getColorEstatus(pedido.estatus);
                const isCompleted = pedido.estatus && pedido.estatus.toLowerCase() === 'completado';

                return (
                  <div 
                    key={pedido.id_pedidos} 
                    className={`pedido-card ${isCompleted ? 'completed' : ''}`}
                  >
                    <div className="card-row">
                      <span className="card-label">Nombre:</span>
                      <span className="card-value">{pedido.nombre}</span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Norma:</span>
                      <span className="card-value">
                        <NormaIcon norma={pedido.norma} />
                      </span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Estatus:</span>
                      <span className="card-value">
                        <span className={`status-badge status-${colorEstatus}`}>
                          {formatStatusText(pedido.estatus)}
                        </span>
                      </span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Fecha Inicio:</span>
                      <span className="card-value">{formatFecha(pedido.fecha_inicio)}</span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Fecha Final:</span>
                      <span className="card-value">{formatFecha(pedido.fecha_final)}</span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Días Restantes:</span>
                      <span className="card-value">
                        {diasRestantes !== null ? (
                          <span className={`dias-badge dias-${colorDias}`}>
                            {diasRestantes < 0 ? 'Expirado' : diasRestantes === 0 ? 'Hoy' : `${diasRestantes} días`}
                          </span>
                        ) : 'N/A'}
                      </span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Precio:</span>
                      <span className="card-value">{formatPrecio(pedido.precio)}</span>
                    </div>
                    {pedido.comentario && (
                      <div className="card-row">
                        <span className="card-label">Comentario:</span>
                        <span className="card-value">{pedido.comentario}</span>
                      </div>
                    )}
                    <div className="card-row">
                      <span className="card-label">Última modificación:</span>
                      <span className="card-value">
                        {pedido.modificado_por_nombre
                          ? `${pedido.modificado_por_nombre} ${pedido.modificado_por_app}`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="card-actions">
                      <button
                        className="pedidos-button pedidos-button-warning"
                        onClick={() => handleActualizar(pedido.id_pedidos)}
                        disabled={pedido.estatus === 'completado'}
                      >
                        <i className="fas fa-edit"></i> Actualizar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
};

export default Pedidos;