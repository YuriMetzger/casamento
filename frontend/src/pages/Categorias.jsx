import { useState, useEffect } from 'react';
import { categoriasService } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import './Categorias.css';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [categoriaAtual, setCategoriaAtual] = useState({
    id: null,
    nome: ''
  });

  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        setLoading(true);
        const data = await categoriasService.listarTodas();
        setCategorias(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError('Não foi possível carregar as categorias. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarCategorias();
  }, []);

  const abrirModal = (categoria = null) => {
    if (categoria) {
      setCategoriaAtual({
        id: categoria.id,
        nome: categoria.nome
      });
      setModoEdicao(true);
    } else {
      setCategoriaAtual({
        id: null,
        nome: ''
      });
      setModoEdicao(false);
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCategoriaAtual({
      id: null,
      nome: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoriaAtual(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modoEdicao) {
        await categoriasService.atualizar(categoriaAtual.id, categoriaAtual);
        setCategorias(prev => 
          prev.map(c => c.id === categoriaAtual.id ? { ...c, ...categoriaAtual } : c)
        );
      } else {
        const novaCategoria = await categoriasService.adicionar(categoriaAtual);
        setCategorias(prev => [...prev, novaCategoria]);
      }
      
      fecharModal();
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
      alert('Ocorreu um erro ao salvar a categoria. Por favor, tente novamente.');
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Isso pode afetar despesas associadas.')) {
      try {
        await categoriasService.excluir(id);
        setCategorias(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error('Erro ao excluir categoria:', err);
        alert('Ocorreu um erro ao excluir a categoria. Ela pode estar sendo usada por despesas.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h1 className="page-title">Categorias</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando categorias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1 className="page-title">Categorias</h1>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Categorias</h1>
        <button className="btn-add" onClick={() => abrirModal()}>
          <FaPlus /> Nova Categoria
        </button>
      </div>
      
      <div className="categorias-grid">
        {categorias.length === 0 ? (
          <div className="no-data">Nenhuma categoria cadastrada</div>
        ) : (
          categorias.map(categoria => (
            <div key={categoria.id} className="categoria-card">
              <h3 className="categoria-nome">{categoria.nome}</h3>
              <div className="categoria-actions">
                <button 
                  className="btn-edit" 
                  onClick={() => abrirModal(categoria)}
                  title="Editar"
                >
                  <FaEdit />
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => handleExcluir(categoria.id)}
                  title="Excluir"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {modalAberto && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{modoEdicao ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button className="modal-close" onClick={fecharModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nome">Nome da Categoria</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={categoriaAtual.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={fecharModal}>
                  <FaTimes /> Cancelar
                </button>
                <button type="submit" className="btn-save">
                  <FaCheck /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categorias;
