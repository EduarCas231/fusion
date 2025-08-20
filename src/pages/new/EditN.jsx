import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../navigation/NavBar';
import API from '../../config/api';

const EditN = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    titulo_new: '',
    detalle_new: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
   
    const fetchNoticia = async () => {
      try {
        console.log("Intentando cargar noticia con ID:", id);
        
       
        const response = await fetch(API.news.getAll);
        if (!response.ok) {
          throw new Error('Error al cargar las noticias');
        }
        
        const noticias = await response.json();
        console.log("Noticias cargadas:", noticias);
        
        
        const noticiaEncontrada = noticias.find(noticia => 
          noticia.id_new.toString() === id.toString()
        );
        
        console.log("Noticia encontrada:", noticiaEncontrada);
        
        if (noticiaEncontrada) {
          setFormData({
            titulo_new: noticiaEncontrada.titulo_new,
            detalle_new: noticiaEncontrada.detalle_new
          });
        } else {
          throw new Error('Noticia no encontrada');
        }
      } catch (err) {
        console.error("Error al cargar la noticia:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticia();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      
      const idNumerico = parseInt(id, 10);
      
      
      const response = await fetch(API.news.update(idNumerico), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la noticia');
      }

      
      navigate('/News');
    } catch (err) {
      console.error("Error al actualizar:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <br />
        <br />
        <br />
        <div className="container" style={{ padding: '20px' }}>
          <p>Cargando datos de la noticia...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <br />
      <br />
      <br />
      <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2>Editar Noticia</h2>
        
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="titulo_new" style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
            <input
              type="text"
              id="titulo_new"
              name="titulo_new"
              value={formData.titulo_new}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="detalle_new" style={{ display: 'block', marginBottom: '5px' }}>Detalle:</label>
            <textarea
              id="detalle_new"
              name="detalle_new"
              value={formData.detalle_new}
              onChange={handleChange}
              required
              rows="6"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => navigate('/news')}
              style={{ 
                backgroundColor: '#f44336', 
                color: 'white', 
                padding: '10px 15px', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={saving}
              style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                padding: '10px 15px', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditN;