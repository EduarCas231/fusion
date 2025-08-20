import React from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Divider, 
  Box 
} from '@mui/material';
import NavBar from '../navigation/NavBar';
import '../styles/Contra.css'; 

const Contra = () => {
  const handleContactSupport = () => {
    const email = 'soporte@tics.com';
    const subject = 'Solicitud de cambio de contraseña';
    const body = `Estimado equipo de soporte:\n\nPor favor necesito ayuda con mi contraseña.\n\n` +
                `Mi usuario es: [por favor ingrese su usuario]\n\n` +
                `Motivo: [describa el motivo de su solicitud]\n\n` +
                `Fecha: ${new Date().toLocaleDateString()}`;
    
    window.open(
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank'
    );
  };

  return (
    <div className="page-container">
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Card elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <span className="lock-icon">🔒</span>
            <Typography variant="h4" component="h1" color="primary">
              Restablecer contraseña
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ backgroundColor: '#f8f9fa', p: 3, borderRadius: 1, mb: 3 }}>
            <Typography variant="body1" paragraph>
              Actualmente, el restablecimiento de contraseñas debe realizarse a través del equipo de Soporte TIC.
            </Typography>
            
            <div className="support-box">
              <span style={{ marginRight: '0.5rem' }}>🛠️</span>
              <Typography variant="body2">
                Contacta al equipo de Soporte TIC para asistencia con tu contraseña.
              </Typography>
            </div>
          </Box>
        </Card>
      </Box>
    </div>
  );
};

export default Contra;
