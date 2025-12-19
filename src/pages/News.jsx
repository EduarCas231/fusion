import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../navigation/NavBar';
import '../styles/News.css';
import API from '../config/api';

const News = () => {
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const response = await fetch(API.news.getAll, {
          signal: AbortSignal.timeout(10000) // 10 segundos timeout
        });
        if (!response.ok) {
          throw new Error('Error al cargar las noticias');
        }
        const data = await response.json();
        setNoticias(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setCargando(false);
      }
    };

    fetchNoticias();
  }, []);

  const handleCrearNoticia = () => {
    navigate('/NewR');
  };

  const handleEditarNoticia = (id) => {
    navigate(`/EditN/${id}`);
  };

  const handleEliminarNoticia = async (id) => {
    setEliminandoId(id);
    
    try {
      const response = await fetch(API.news.delete(id), {
        method: 'DELETE',
        signal: AbortSignal.timeout(8000) // 8 segundos timeout
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la noticia');
      }
      
      const noticiaElement = document.getElementById(`noticia-${id}`);
      if (noticiaElement) {
        noticiaElement.classList.add('fade-out');
        setTimeout(() => {
          setNoticias(noticias.filter(noticia => noticia.id_new !== id));
          setEliminandoId(null);
        }, 300);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
      setEliminandoId(null);
    }
  };

  const confirmarEliminacion = (id) => {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <h3>¿Eliminar Evento?</h3>
        <p>Esta acción no se puede deshacer si es eliminada</p>
        <div class="modal-buttons">
          <button class="cancel-btn">Cancelar</button>
          <button class="confirm-btn">Eliminar</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const cancelBtn = modal.querySelector('.cancel-btn');
    const confirmBtn = modal.querySelector('.confirm-btn');
    
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    
    cancelBtn.addEventListener('click', closeModal);
    
    confirmBtn.addEventListener('click', () => {
      closeModal();
      handleEliminarNoticia(id);
    });
    
   
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  };

  return (
    <>
      <NavBar />
      <br />
      <br />
      <div className="news-container">
        <div className="news-header">
          <h2>Eventos</h2>
          <button 
            onClick={handleCrearNoticia}
            className="create-button"
          >
            <span className="plus-icon">+</span> Crear Evento
          </button>
        </div>

        {cargando ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando evento...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Reintentar
            </button>
          </div>
        ) : noticias.length === 0 ? (
          <div className="empty-state">
            <p>No hay eventos disponibles</p>
            <button onClick={handleCrearNoticia} className="create-button">
              Crear primer evento
            </button>
          </div>
        ) : (
          <ul className="news-list">
            {noticias.map((noticia) => (
              <li 
                key={noticia.id_new} 
                id={`noticia-${noticia.id_new}`}
                className="news-item"
              >
                <div className="news-content">
                  <h3>{noticia.titulo_new}</h3>
                  <p>{noticia.detalle_new}</p>
                </div>
                <div className="news-actions">
                  <button
                    onClick={() => handleEditarNoticia(noticia.id_new)}
                    className="edit-button"
                    disabled={eliminandoId === noticia.id_new}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={() => confirmarEliminacion(noticia.id_new)}
                    className="delete-button"
                    disabled={eliminandoId === noticia.id_new}
                  >
                    {eliminandoId === noticia.id_new ? (
                      <div className="delete-spinner"></div>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                        Eliminar
                      </>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default News;