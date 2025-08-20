import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../navigation/NavBar';
import API from '../../config/api';

const NewR = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo_new: '',
    detalle_new: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API.news.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al crear la noticia');
      }

      
      navigate('/news');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <br />
      <br />
      <br />
      <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2>Crear Nueva Noticia</h2>
        
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
              disabled={loading}
              style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                padding: '10px 15px', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Guardando...' : 'Guardar Noticia'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewR;