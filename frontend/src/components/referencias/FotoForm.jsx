import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaImage } from 'react-icons/fa';
import { categoriasFotoService } from '../../services/api';
import './FotoForm.css';

const FotoForm = ({ foto = null, referenciaId, onSalvar, onCancelar }) => {
  const [formData, setFormData] = useState({
    url: foto?.url || '',
    descricao: foto?.descricao || '',
    categoria_id: foto?.categoria_id || '',
    referencia_id: referenciaId
  });
  
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const data = await categoriasFotoService.listarTodas();
        setCategorias(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarCategorias();
  }, []);
  
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
    
    if (!formData.url.trim()) {
      novosErros.url = 'A URL da imagem é obrigatória';
    }
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validarForm()) {
      // Converter categoria_id para número se não for vazio
      const dadosParaSalvar = {
        ...formData,
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null
      };
      
      onSalvar(dadosParaSalvar);
    }
  };
  
  if (loading) {
    return <div className="loading">Carregando...</div>;
  }
  
  return (
    <div className="foto-form-container">
      <form onSubmit={handleSubmit} className="foto-form">
        <div className="form-group">
          <label htmlFor="url">
            <FaImage /> URL da Imagem *
          </label>
          <input
            type="text"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://exemplo.com/imagem.jpg"
            className={errors.url ? 'error' : ''}
          />
          {errors.url && <div className="error-message">{errors.url}</div>}
          
          {formData.url && (
            <div className="image-preview">
              <img src={formData.url} alt="Prévia da imagem" />
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descrição opcional para esta imagem"
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="categoria_id">Categoria</label>
          <select
            id="categoria_id"
            name="categoria_id"
            value={formData.categoria_id}
            onChange={handleChange}
          >
            <option value="">Selecione uma categoria (opcional)</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
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

export default FotoForm;
