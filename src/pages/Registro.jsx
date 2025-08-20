import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Registro.css';
import API from "../config/api";

export default function Registro() {
  const [formData, setFormData] = useState({
    nombre: "",
    appaterno: "",
    apmaterno: "",
    correo: "",
    password: "",
    confirmPassword: "",
    tipo: 0
  });
  const [errors, setErrors] = useState({
    nombre: "",
    appaterno: "",
    apmaterno: "",
    correo: "",
    password: "",
    confirmPassword: ""
  });
  const [mensaje, setMensaje] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!formData.password) {
      setPasswordScore(0);
      return;
    }

    let score = 0;
    if (formData.password.length >= 8) score += 1;
    if (/\d/.test(formData.password)) score += 1;
    if (/[A-Z]/.test(formData.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) score += 1;

    setPasswordScore(score);
  }, [formData.password]);


  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "nombre":
      case "appaterno":
      case "apmaterno":
        if (!value.trim()) error = "Este campo es requerido";
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) error = "Solo se permiten letras";
        break;
      case "correo":
        if (!value) error = "Este campo es requerido";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Correo electrónico inválido";
        break;
      case "password":
        if (!value) error = "Este campo es requerido";
        else if (value.length < 8) error = "Mínimo 8 caracteres";
        break;
      case "confirmPassword":
        if (!value) error = "Este campo es requerido";
        else if (value !== formData.password) error = "Las contraseñas no coinciden";
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
 
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      if (key !== "tipo") {
        const error = validateField(key, formData[key]);
        newErrors[key] = error;
        if (error) isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensaje("");

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(API.auth.register, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          app: formData.appaterno,
          apm: formData.apmaterno,
          correo: formData.correo,
          password: formData.password,
          tipo: 0
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensaje({ type: "error", text: data.error || "Error al registrar usuario. Por favor intenta nuevamente." });
      } else {
        setMensaje({ type: "success", text: "¡Registro exitoso! Redirigiendo al login..." });
        setFormData({
          nombre: "",
          appaterno: "",
          apmaterno: "",
          correo: "",
          password: "",
          confirmPassword: "",
          tipo: 0
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setMensaje({ type: "error", text: "Error de conexión con el servidor. Por favor verifica tu conexión a internet." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = () => {
    const strengths = ["Muy débil", "Débil", "Moderada", "Fuerte", "Muy fuerte"];
    return strengths[passwordScore];
  };

  const getPasswordStrengthColor = () => {
    const colors = ["#ff4d4d", "#ffa64d", "#ffcc00", "#66cc66", "#339933"];
    return colors[passwordScore];
  };

  return (
    <div className="registro-page">
      <div className="registro-container">
        <div className="registro-card">
          <div className="registro-header">
            <h1>Crear Cuenta</h1>
            <p>Únete a nuestra comunidad</p>
          </div>

          <form className="registro-form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombre">Nombre(s)*</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Ej: Juan"
                  className={errors.nombre ? "error-input" : ""}
                />
                {errors.nombre && <span className="error-message">{errors.nombre}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="appaterno">Apellido Paterno*</label>
                <input
                  type="text"
                  id="appaterno"
                  name="appaterno"
                  value={formData.appaterno}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Ej: Pérez"
                  className={errors.appaterno ? "error-input" : ""}
                />
                {errors.appaterno && <span className="error-message">{errors.appaterno}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="apmaterno">Apellido Materno*</label>
                <input
                  type="text"
                  id="apmaterno"
                  name="apmaterno"
                  value={formData.apmaterno}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Ej: López"
                  className={errors.apmaterno ? "error-input" : ""}
                />
                {errors.apmaterno && <span className="error-message">{errors.apmaterno}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="correo">Correo electrónico*</label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="ejemplo@correo.com"
                  className={errors.correo ? "error-input" : ""}
                />
                {errors.correo && <span className="error-message">{errors.correo}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña*</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className={errors.password ? "error-input" : ""}
                />
                <div className="password-strength">
                  <div className="strength-bar-container">
                    <div 
                      className="strength-bar" 
                      style={{
                        width: `${(passwordScore / 4) * 100}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    ></div>
                  </div>
                  <span style={{ color: getPasswordStrengthColor() }}>
                    Seguridad: {getPasswordStrength()}
                  </span>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña*</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Repite tu contraseña"
                  className={errors.confirmPassword ? "error-input" : ""}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="tipo">Tipo de usuario</label>
                <input
                  type="text"
                  id="tipo"
                  value="Usuario estándar"
                  readOnly
                  className="read-only-input"
                />
              </div>
            </div>

            <div className="password-requirements">
              <h4>Requisitos de contraseña:</h4>
              <ul>
                <li className={formData.password.length >= 8 ? "valid" : ""}>
                  <i className={`fas ${formData.password.length >= 8 ? "fa-check-circle" : "fa-circle"}`}></i>
                  Mínimo 8 caracteres
                </li>
                <li className={/\d/.test(formData.password) ? "valid" : ""}>
                  <i className={`fas ${/\d/.test(formData.password) ? "fa-check-circle" : "fa-circle"}`}></i>
                  Al menos un número
                </li>
                <li className={/[A-Z]/.test(formData.password) ? "valid" : ""}>
                  <i className={`fas ${/[A-Z]/.test(formData.password) ? "fa-check-circle" : "fa-circle"}`}></i>
                  Al menos una mayúscula
                </li>
              </ul>
            </div>

            {mensaje && (
              <div className={`alert ${mensaje.type}`}>
                {mensaje.text}
              </div>
            )}

            <button
              type="submit"
              className="registro-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Registrando...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="registro-footer">
            <p>¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}