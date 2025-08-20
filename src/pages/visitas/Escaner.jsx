import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'react-qr-scanner';
import Swal from 'sweetalert2';
import { FiCamera, FiCheckCircle, FiKey, FiRefreshCw, FiX } from 'react-icons/fi';
import '../../styles/Escanear.css';
import API from '../../config/api';
import NavBar from '../../navigation/NavBar';

function Escaner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [hasCameraSupport, setHasCameraSupport] = useState(true);
  const [currentVisita, setCurrentVisita] = useState(null);
  const [showVisitaInfo, setShowVisitaInfo] = useState(false);
  const qrScannerRef = useRef(null);

  useEffect(() => {
    const checkCameraSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setHasCameraSupport(false);
          return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length < 2) {
          setHasCameraSupport(false);
        }
      } catch (error) {
        console.error('Error al verificar cámaras:', error);
        setHasCameraSupport(false);
      }
    };

    checkCameraSupport();
  }, []);

  const verificarVisita = async (codigo) => {
    console.log('[DEBUG] Verificando código:', codigo);

    try {
      const cleanCode = codigo.trim();
      const apiUrl = API.visitas.getByCode(cleanCode);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Visita no encontrada');
      }

      const visita = await response.json();
      return visita;
    } catch (error) {
      throw error;
    }
  };

  const marcarComoEscaneado = async (visitaId) => {
    try {
      const response = await fetch(API.visitas.markScanned(visitaId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          escaneado: true
        })
      });

      if (!response.ok) {
        console.error('Error al marcar como escaneado');
      }
    } catch (error) {
      console.error('Error al marcar como escaneado:', error);
    }
  };

  const handleScan = async (codigo) => {
    if (!codigo) return;

    setScanning(false);

    try {
      const visita = await verificarVisita(codigo);
      setCurrentVisita(visita);
      
      if (visita.escaneado) {
        Swal.fire({
          title: '⚠️ CÓDIGO YA UTILIZADO',
          html: `
            <div class="alert-container already-used">
              <div class="alert-icon">
                <div class="warning-circle">
                  <span>⚠️</span>
                </div>
              </div>
              <div class="visitor-card">
                <div class="visitor-header">
                  <h3>${visita.nombre} ${visita.apellidoPaterno} ${visita.apellidoMaterno || ''}</h3>
                  <div class="status-badge invalid">
                    <span class="status-icon">🚫</span>
                    ACCESO YA REGISTRADO
                  </div>
                </div>
                <div class="visit-details">
                  <div class="detail-item">
                    <span class="detail-label">🏢 Departamento:</span>
                    <span class="detail-value">${visita.departamento}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">📅 Fecha de visita:</span>
                    <span class="detail-value">${visita.dia}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">⏰ Hora programada:</span>
                    <span class="detail-value">${visita.hora?.substring(0, 5)}</span>
                  </div>
                  ${visita.detalle ? `
                    <div class="detail-item">
                      <span class="detail-label">📋 Motivo de la visita:</span>
                      <span class="detail-value">${visita.detalle}</span>
                    </div>
                  ` : ''}
                </div>
                <div class="alert-message">
                  <p><strong>Este código QR ya fue escaneado anteriormente</strong></p>
                  <p class="sub-message">No se permite el acceso duplicado</p>
                </div>
              </div>
            </div>
          `,
          icon: false,
          confirmButtonColor: '#ef4444',
          confirmButtonText: '✓ Entendido',
          customClass: {
            popup: 'custom-alert-popup',
            confirmButton: 'custom-confirm-btn'
          },
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        }).then(() => {
          setScanning(true);
        });
        return;
      }
      
      await marcarComoEscaneado(visita.id);
      setShowVisitaInfo(true);
      
    } catch (error) {
      Swal.fire({
        title: '❌ CÓDIGO NO VÁLIDO',
        html: `
          <div class="alert-container invalid-code">
            <div class="alert-icon">
              <div class="error-circle">
                <span>❌</span>
              </div>
            </div>
            <div class="error-content">
              <h3>Código no reconocido</h3>
              <div class="error-details">
                <p class="error-message">${error.message}</p>
                <div class="suggestions">
                  <h4>💡 Sugerencias:</h4>
                  <ul>
                    <li>Verifica que el código QR esté completo y legible</li>
                    <li>Asegúrate de que la cámara tenga buena iluminación</li>
                    <li>Intenta ingresar el código manualmente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `,
        icon: false,
        confirmButtonColor: '#2b91e7',
        confirmButtonText: '🔄 Reintentar',
        showCancelButton: true,
        cancelButtonText: '✏️ Ingreso manual',
        customClass: {
          popup: 'custom-alert-popup',
          confirmButton: 'custom-confirm-btn',
          cancelButton: 'custom-cancel-btn'
        },
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          setScanning(true);
        } else if (result.isDismissed) {
          
          setScanning(true);
          setTimeout(() => {
            const manualInput = document.querySelector('.manual-input');
            if (manualInput) {
              manualInput.focus();
              manualInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      });
    }
  };

  const closeVisitaInfo = () => {
    setShowVisitaInfo(false);
    setScanning(true);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      Swal.fire({
        title: 'Advertencia', 
        text: 'Ingresa un código válido',
        icon: 'warning',
        confirmButtonColor: '#2b91e7'
      });
      return;
    }

    await handleScan(manualCode);
  };

  const toggleCamera = () => {
    setScanning(!scanning);
    setManualCode('');
  };

  const switchCamera = async () => {
    try {
      if (qrScannerRef.current) {
        const videoElement = qrScannerRef.current.video;
        if (videoElement && videoElement.srcObject) {
          const stream = videoElement.srcObject;
          stream.getTracks().forEach(track => track.stop());
        }
      }

      const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(newFacingMode);
      
      setScanning(false);
      setTimeout(() => setScanning(true), 100);
      
    } catch (error) {
      console.error('Error al cambiar cámara:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cambiar la cámara. Intente recargar la página.',
        icon: 'error',
        confirmButtonColor: '#2b91e7'
      });
    }
  };

  return (
    <>
      <NavBar />
      <br />
      <br />
      <br />
      <br />
      <br />
      <div className="scanner-container">
        <div className="scanner-header">
          <h1>Escanear Visita</h1>
          <p>Escanea el código QR o ingresa manualmente el código</p>
        </div>

        <div className="scanner-content">
          {scanning ? (
            <>
              <div className="qr-reader-container">
                <div className="qr-reader-wrapper">
                  {scanning && (
                    <QrScanner
                      key={`scanner-${facingMode}`}
                      ref={qrScannerRef}
                      delay={500}
                      onError={(err) => {
                        console.error('[QR Error]', err);
                        if (err.name === 'NotAllowedError') {
                          Swal.fire({
                            title: 'Permiso denegado',
                            text: 'Por favor permite el acceso a la cámara',
                            icon: 'error',
                            confirmButtonColor: '#2b91e7'
                          });
                        }
                      }}
                      onScan={(result) => {
                        if (result) {
                          handleScan(result.text || result);
                        }
                      }}
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      facingMode={facingMode}
                      constraints={{
                        audio: false,
                        video: {
                          facingMode: facingMode,
                          width: { ideal: 480, max: 640 },
                          height: { ideal: 640, max: 960 },
                          aspectRatio: 0.75
                        }
                      }}
                    />
                  )}
                  <div className="scan-frame"></div>
                  {hasCameraSupport && (
                    <button 
                      className="switch-camera-btn"
                      onClick={switchCamera}
                      title={`Cambiar a cámara ${facingMode === 'environment' ? 'frontal' : 'trasera'}`}
                    >
                      <FiRefreshCw size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="manual-entry">
                <div className="manual-entry-header">
                  <FiKey className="input-icon" />
                  <h3>Ingreso manual</h3>
                </div>
                <form onSubmit={handleManualSubmit} className="manual-form">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ej: abc123xyz"
                    autoComplete="off"
                    className="manual-input"
                  />
                  <button type="submit" className="btn-primary">
                    Verificar código
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="scan-success">
              {showVisitaInfo && currentVisita && (
                <div className="minimal-success-card">
                  <div className="success-check-circle">
                    <div className="checkmark">
                      <div className="checkmark-stem"></div>
                      <div className="checkmark-kick"></div>
                    </div>
                  </div>
                  <h2>Acceso Autorizado</h2>
                  
                  <div className="visitor-card">
                    <div className="visitor-name">
                      {currentVisita.nombre} {currentVisita.apellidoPaterno} {currentVisita.apellidoMaterno || ''}
                    </div>
                    <div className="visit-details">
                      <span><strong>Departamento:</strong> 🏢 {currentVisita.departamento}</span>
                      <span><strong>Fecha:</strong> 📅 {currentVisita.dia}</span>
                      <span><strong>Hora:</strong> ⏰ {currentVisita.hora?.substring(0, 5)}</span>
                    </div>
                    {currentVisita.detalle && (
                      <div className="visit-purpose">
                        <strong>Motivo:</strong> 📋 {currentVisita.detalle}
                      </div>
                    )}
                  </div>
                  
                  <div className="welcome-msg"> 
                    🎉 ¡Bienvenido a LABSA!<br/>
                    Favor de pasar al área asignada
                  </div>
                  
                  <div className="security-notice">
                    ⚠️ ¡Por su seguridad dentro de LABSA usted estará siendo grabado!<br/>
                  </div>
                </div>
              )}
              
              <div className="action-buttons">
                <button className="scan-btn" onClick={toggleCamera}>
                  <FiCamera size={18} />
                  Escanear otro
                </button>
                <button className="close-btn" onClick={closeVisitaInfo}>
                  <FiX size={18} />
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
    </>
  );
}

export default Escaner;