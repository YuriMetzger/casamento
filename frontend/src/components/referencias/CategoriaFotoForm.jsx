import { useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import './CategoriaFotoForm.css';

const CategoriaFotoForm = ({ categoria = null, onSalvar, onCancelar }) => {
  const [formData, setFormData] = useState({
    nome: categoria?.nome || '',
    descricao: categoria?.descricao || ''
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
  
  const validarForm = () => {
    const novosErros = {};
    
    if (!formData.nome.trim()) {
      novosErros.nome = 'O nome da categoria é obrigatório';
    }
    
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
    <div className="categoria-foto-form-container">
      <form onSubmit={handleSubmit} className="categoria-foto-form">
        <div className="form-group">
          <label htmlFor="nome">Nome da Categoria *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Ex: Cerimônia, Festa, Vestimentas"
            className={errors.nome ? 'error' : ''}
          />
          {errors.nome && <div className="error-message">{errors.nome}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descrição opcional para esta categoria"
            rows={3}
          />
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

export default CategoriaFotoForm;
