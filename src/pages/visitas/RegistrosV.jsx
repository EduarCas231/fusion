import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiUser, FiClock, FiCalendar, FiBriefcase, FiFileText, FiPlus, FiX, FiDownload, FiShare2 } from 'react-icons/fi';
import '../../styles/RegistrosV.css';
import API from '../../config/api';
import NavBar from '../../navigation/NavBar';
const Registros = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    hora: '',
    dia: '',
    departamento: '',
    detalle: ''
  });

  const departamentos = [
    'Dirección',
    'Tics',
    'Almacén',
    'Sala de Juntas',
    'Sala de Usos Múltiples',
    'Fisicoquímicos',
    'Muestreo',
    'Cromatografía',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.nombre.trim()) errors.push('Nombre');
    if (!formData.apellidoPaterno.trim()) errors.push('Apellido Paterno');
    if (!formData.hora) errors.push('Hora');
    if (!formData.dia) errors.push('Fecha');
    if (!formData.departamento) errors.push('Departamento');
    return errors;
  };

  const formatFecha = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    return `${dateStr} ${timeStr}:00`;
  };

  const downloadQR = (qrBase64, codigo) => {
    try {
      // Validar que el base64 no esté vacío
      if (!qrBase64 || qrBase64.length < 100) {
        throw new Error('QR data is invalid');
      }
      
      // Convertir base64 a blob
      const binaryString = atob(qrBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/png' });
      
      // Crear URL del blob y descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_Visita_${codigo}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL del blob
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (error) {
      console.error('Download failed:', error);
      Swal.fire({
        title: 'Error al descargar',
        text: 'No se pudo descargar la imagen del QR',
        icon: 'error',
        confirmButtonColor: '#2b91e7'
      });
    }
  };

  const shareQR = async (qrBase64, codigo, nombre) => {
    // Primero intentar Web Share API (funciona bien en móviles)
    if (navigator.share && navigator.canShare) {
      try {
        // Validar que el base64 no esté vacío
        if (!qrBase64 || qrBase64.length < 100) {
          throw new Error('QR data is invalid');
        }
        
        // Convertir base64 a blob de forma más robusta
        const binaryString = atob(qrBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'image/png' });
        
        // Validar que el blob tenga contenido
        if (blob.size === 0) {
          throw new Error('Generated blob is empty');
        }
        
        const fileName = `QR_Visita_${codigo}_${Date.now()}.png`;
        const file = new File([blob], fileName, { 
          type: 'image/png',
          lastModified: Date.now()
        });
        
        // Verificar que se puede compartir archivos
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Código QR - Visita LABSA',
            text: `Código QR para la visita de ${nombre} - Código: ${codigo}`,
            files: [file]
          });
          return;
        }
      } catch (error) {
        console.log('Web Share failed:', error);
      }
    }
    
    // Fallback: mostrar opciones de compartir
    showShareOptions(qrBase64, codigo, nombre);
  };

  const showShareOptions = (qrBase64, codigo, nombre) => {
    Swal.fire({
      title: 'Compartir Código QR',
      html: `
        <div class="share-options">
          <p>Seleccione cómo desea compartir el código QR:</p>
          <div class="share-buttons">
            <button id="shareEmail" class="share-option-btn email-btn">
              📧 Enviar por Email
            </button>
            <button id="copyCode" class="share-option-btn copy-btn">
              📋 Copiar Código
            </button>
            <button id="downloadFirst" class="share-option-btn download-btn">
              💾 Descargar Imagen
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Cerrar',
      didOpen: () => {
        document.getElementById('shareEmail')?.addEventListener('click', () => {
          shareByEmail(codigo, nombre);
          Swal.close();
        });
        
        document.getElementById('copyCode')?.addEventListener('click', () => {
          copyToClipboard(codigo);
          Swal.close();
        });
        
        document.getElementById('downloadFirst')?.addEventListener('click', () => {
          downloadQR(qrBase64, codigo);
          Swal.close();
        });
      }
    });
  };

  const shareByEmail = (codigo, nombre) => {
    const subject = encodeURIComponent('Código QR - Visita LABSA');
    const body = encodeURIComponent(
      `Hola,\n\n` +
      `Te comparto el código QR para la visita de ${nombre}.\n\n` +
      `Código de visita: ${codigo}\n\n` +
      `Por favor, descarga la imagen del código QR desde el sistema y preséntala junto con tu identificación al ingresar.\n\n` +
      `Saludos,\n` +
      `Sistema LABSA`
    );
    
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
  };

  const copyToClipboard = (codigo) => {
    navigator.clipboard.writeText(codigo).then(() => {
      Swal.fire({
        title: 'Código copiado',
        text: `El código ${codigo} se ha copiado al portapapeles`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }).catch(() => {
      Swal.fire({
        title: 'Código de visita',
        text: `Código: ${codigo}`,
        icon: 'info',
        confirmButtonColor: '#2b91e7'
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      Swal.fire({
        title: 'Campos incompletos',
        html: `<p>Faltan: <strong>${errors.join(', ')}</strong></p>`,
        icon: 'warning',
        confirmButtonColor: '#2b91e7'
      });
      return;
    }

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellidoPaterno: formData.apellidoPaterno.trim(),
        apellidoMaterno: formData.apellidoMaterno.trim() || null,
        lugar: 'Labsa S.A. de C.V.',
        fecha: formatFecha(formData.dia, formData.hora),
        departamento: formData.departamento,
        detalle: formData.detalle.trim() || null
      };

      const response = await fetch(API.visitas.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      Swal.fire({
        title: '¡Registro exitoso!',
        html: `
          <div class="success-modal">
            <p>ID Visita: <strong>${data.id}</strong></p>
            <p>Nombre: <strong>${payload.nombre} ${payload.apellidoPaterno}</strong></p>
            <p>Fecha: ${formData.dia} - ${formData.hora}</p>
            <p>Departamento: ${payload.departamento}</p>
            <p>Código: <strong>${data.codigo}</strong></p>
            <img src="data:image/png;base64,${data.qr_base64}" alt="Código QR" class="qr-image"/>
            <div class="qr-actions">
              <button id="downloadQR" class="qr-btn download-btn">
                <i class="fi fi-rr-download"></i> Descargar QR
              </button>
              <button id="shareQR" class="qr-btn share-btn">
                <i class="fi fi-rr-share"></i> Compartir QR
              </button>
            </div>
            <p class="qr-instruction">Recuerde presentar su identificación al ingresar</p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#2b91e7',
        didOpen: () => {
          const downloadBtn = document.getElementById('downloadQR');
          const shareBtn = document.getElementById('shareQR');
          
          downloadBtn?.addEventListener('click', () => {
            downloadQR(data.qr_base64, data.codigo);
          });
          
          shareBtn?.addEventListener('click', () => {
            shareQR(data.qr_base64, data.codigo, `${payload.nombre} ${payload.apellidoPaterno}`);
          });
        },
        willClose: () => navigate('/visitas')
      });

    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error en el registro',
        text: `No se pudo completar el registro. ${error.message}`,
        icon: 'error',
        confirmButtonColor: '#2b91e7'
      });
    }
  };

  return (
    <div className="edit-container">
      <div className="edit-header">
        <h1>Registrar Nueva Visita</h1>
        <p>Complete el formulario para registrar una nueva visita</p>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-grid">
        
          <div className="form-group">
            <label className="form-label">
              <FiUser className="input-icon" />
              <span>Nombre*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="form-input"
              required
              autoComplete="off"
            />
          </div>

          
          <div className="form-group">
            <label className="form-label">
              <FiUser className="input-icon" />
              <span>Apellido Paterno*</span>
            </label>
            <input
              type="text"
              name="apellidoPaterno"
              value={formData.apellidoPaterno}
              onChange={handleChange}
              className="form-input"
              required
              autoComplete="off"
            />
          </div>

          
          <div className="form-group">
            <label className="form-label">
              <FiUser className="input-icon" />
              <span>Apellido Materno</span>
            </label>
            <input
              type="text"
              name="apellidoMaterno"
              value={formData.apellidoMaterno}
              onChange={handleChange}
              className="form-input"
              autoComplete="off"
            />
          </div>

          
          <div className="form-group">
            <label className="form-label">
              <FiClock className="input-icon" />
              <span>Hora*</span>
            </label>
            <input
              type="time"
              name="hora"
              value={formData.hora}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          
          <div className="form-group">
            <label className="form-label">
              <FiCalendar className="input-icon" />
              <span>Fecha*</span>
            </label>
            <input
              type="date"
              name="dia"
              value={formData.dia}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          
          <div className="form-group">
            <label className="form-label">
              <FiBriefcase className="input-icon" />
              <span>Departamento*</span>
            </label>
            <select
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Seleccione...</option>
              {departamentos.map((depto, i) => (
                <option key={i} value={depto}>{depto}</option>
              ))}
            </select>
          </div>

          
          <div className="form-group full-width">
            <label className="form-label">
              <FiFileText className="input-icon" />
              <span>Detalles adicionales</span>
            </label>
            <textarea
              name="detalle"
              value={formData.detalle}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/visitas')}
          >
            <FiX className="btn-icon" />
            Cancelar
          </button>
          <button type="submit" className="submit-btn">
            <FiPlus className="btn-icon" />
            Registrar Visita
          </button>
        </div>
      </form>
    </div>
  );
};

export default Registros;