import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash, FaImage, FaCalendarAlt } from 'react-icons/fa';
import './ReferenciaForm.css';

const ReferenciaForm = ({ referencia = null, onSalvar, onCancelar }) => {
  const [formData, setFormData] = useState({
    data_casamento: referencia?.data_casamento || '',
    foto_noivos: referencia?.foto_noivos || '',
    logo_casamento: referencia?.logo_casamento || '',
    cores: referencia?.cores || []
  });
  
  const [novaCor, setNovaCor] = useState({
    codigo_hex: '#FFFFFF',
    nome: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const handleCorChange = (e) => {
    const { name, value } = e.target;
    setNovaCor(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const adicionarCor = () => {
    if (!novaCor.codigo_hex) {
      setErrors(prev => ({
        ...prev,
        novaCor: 'Selecione uma cor'
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      cores: [...prev.cores, { ...novaCor }]
    }));
    
    setNovaCor({
      codigo_hex: '#FFFFFF',
      nome: ''
    });
    
    setErrors(prev => ({
      ...prev,
      novaCor: null
    }));
  };
  
  const removerCor = (index) => {
    setFormData(prev => ({
      ...prev,
      cores: prev.cores.filter((_, i) => i !== index)
    }));
  };
  
  const validarForm = () => {
    const novosErros = {};
    
    // Data de casamento é opcional
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validarForm()) {
      onSalvar(formData);
    }
  };
  
  return (
    <div className="referencia-form-container">
      <form onSubmit={handleSubmit} className="referencia-form">
        <div className="form-group">
          <label htmlFor="data_casamento">
            <FaCalendarAlt /> Data do Casamento
          </label>
          <input
            type="date"
            id="data_casamento"
            name="data_casamento"
            value={formData.data_casamento}
            onChange={handleChange}
            className={errors.data_casamento ? 'error' : ''}
          />
          {errors.data_casamento && <div className="error-message">{errors.data_casamento}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="foto_noivos">
            <FaImage /> URL da Foto dos Noivos
          </label>
          <input
            type="text"
            id="foto_noivos"
            name="foto_noivos"
            value={formData.foto_noivos}
            onChange={handleChange}
            placeholder="https://exemplo.com/foto-noivos.jpg"
            className={errors.foto_noivos ? 'error' : ''}
          />
          {errors.foto_noivos && <div className="error-message">{errors.foto_noivos}</div>}
          
          {formData.foto_noivos && (
            <div className="image-preview">
              <img src={formData.foto_noivos} alt="Prévia da foto dos noivos" />
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="logo_casamento">
            <FaImage /> URL do Logo do Casamento
          </label>
          <input
            type="text"
            id="logo_casamento"
            name="logo_casamento"
            value={formData.logo_casamento}
            onChange={handleChange}
            placeholder="https://exemplo.com/logo-casamento.jpg"
            className={errors.logo_casamento ? 'error' : ''}
          />
          {errors.logo_casamento && <div className="error-message">{errors.logo_casamento}</div>}
          
          {formData.logo_casamento && (
            <div className="image-preview">
              <img src={formData.logo_casamento} alt="Prévia do logo do casamento" />
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label>Paleta de Cores</label>
          <div className="cor-input-container">
            <div className="cor-input-row">
              <div className="cor-input-field">
                <input
                  type="color"
                  name="codigo_hex"
                  value={novaCor.codigo_hex}
                  onChange={handleCorChange}
                  className={errors.novaCor ? 'error' : ''}
                />
              </div>
              <div className="cor-input-field">
                <input
                  type="text"
                  name="nome"
                  value={novaCor.nome}
                  onChange={handleCorChange}
                  placeholder="Nome da cor (opcional)"
                />
              </div>
              <button 
                type="button" 
                className="btn-add-cor"
                onClick={adicionarCor}
              >
                <FaPlus /> Adicionar
              </button>
            </div>
            {errors.novaCor && <div className="error-message">{errors.novaCor}</div>}
          </div>
          
          <div className="cores-list">
            {formData.cores.length === 0 ? (
              <div className="no-cores">Nenhuma cor adicionada</div>
            ) : (
              <div className="cores-grid">
                {formData.cores.map((cor, index) => (
                  <div key={index} className="cor-item">
                    <div 
                      className="cor-preview" 
                      style={{ backgroundColor: cor.codigo_hex }}
                    ></div>
                    <div className="cor-info">
                      <span className="cor-codigo">{cor.codigo_hex}</span>
                      {cor.nome && <span className="cor-nome">{cor.nome}</span>}
                    </div>
                    <button 
                      type="button" 
                      className="btn-remove-cor"
                      onClick={() => removerCor(index)}
                      title="Remover cor"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-actions">
          {onCancelar && (
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onCancelar}
            >
              <FaTimes /> Cancelar
            </button>
          )}
          <button type="submit" className="btn-save">
            <FaSave /> Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReferenciaForm;
