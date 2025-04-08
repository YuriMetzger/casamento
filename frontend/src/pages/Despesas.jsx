import { useState, useEffect } from 'react';
import { despesasService, categoriasService } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import './Despesas.css';

const Despesas = () => {
  const [despesas, setDespesas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [despesaAtual, setDespesaAtual] = useState({
    id: null,
    descricao: '',
    valor_total: '',
    valor_pago: '',
    categoria_id: ''
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const [despesasData, categoriasData] = await Promise.all([
          despesasService.listarTodas(),
          categoriasService.listarTodas()
        ]);
        
        setDespesas(despesasData);
        setCategorias(categoriasData);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const abrirModal = (despesa = null) => {
    if (despesa) {
      setDespesaAtual({
        id: despesa.id,
        descricao: despesa.descricao,
        valor_total: despesa.valor_total,
        valor_pago: despesa.valor_pago,
        categoria_id: despesa.categoria_id
      });
      setModoEdicao(true);
    } else {
      setDespesaAtual({
        id: null,
        descricao: '',
        valor_total: '',
        valor_pago: '',
        categoria_id: categorias.length > 0 ? categorias[0].id : ''
      });
      setModoEdicao(false);
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setDespesaAtual({
      id: null,
      descricao: '',
      valor_total: '',
      valor_pago: '',
      categoria_id: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDespesaAtual(prev => ({
      ...prev,
      [name]: name === 'valor_total' || name === 'valor_pago' ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modoEdicao) {
        await despesasService.atualizar(despesaAtual.id, despesaAtual);
        setDespesas(prev => 
          prev.map(d => d.id === despesaAtual.id ? { ...d, ...despesaAtual } : d)
        );
      } else {
        const novaDespesa = await despesasService.adicionar(despesaAtual);
        // Adicionar a categoria_nome para exibição
        const categoria = categorias.find(c => c.id === novaDespesa.categoria_id);
        novaDespesa.categoria_nome = categoria ? categoria.nome : '';
        
        setDespesas(prev => [...prev, novaDespesa]);
      }
      
      fecharModal();
    } catch (err) {
      console.error('Erro ao salvar despesa:', err);
      alert('Ocorreu um erro ao salvar a despesa. Por favor, tente novamente.');
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await despesasService.excluir(id);
        setDespesas(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        console.error('Erro ao excluir despesa:', err);
        alert('Ocorreu um erro ao excluir a despesa. Por favor, tente novamente.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h1 className="page-title">Despesas</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando despesas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1 className="page-title">Despesas</h1>
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
        <h1 className="page-title">Despesas</h1>
        <button className="btn-add" onClick={() => abrirModal()}>
          <FaPlus /> Nova Despesa
        </button>
      </div>
      
      <div className="table-container">
        <table className="despesas-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor Total</th>
              <th>Valor Pago</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {despesas.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">Nenhuma despesa cadastrada</td>
              </tr>
            ) : (
              despesas.map(despesa => (
                <tr key={despesa.id}>
                  <td>{despesa.descricao}</td>
                  <td>{despesa.categoria_nome}</td>
                  <td>R$ {despesa.valor_total.toLocaleString('pt-BR')}</td>
                  <td>R$ {despesa.valor_pago.toLocaleString('pt-BR')}</td>
                  <td>
                    <span className={`status-badge ${despesa.valor_pago >= despesa.valor_total ? 'status-pago' : 'status-pendente'}`}>
                      {despesa.valor_pago >= despesa.valor_total ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit" 
                        onClick={() => abrirModal(despesa)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleExcluir(despesa.id)}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {modalAberto && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{modoEdicao ? 'Editar Despesa' : 'Nova Despesa'}</h2>
              <button className="modal-close" onClick={fecharModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                <input
                  type="text"
                  id="descricao"
                  name="descricao"
                  value={despesaAtual.descricao}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="categoria_id">Categoria</label>
                <select
                  id="categoria_id"
                  name="categoria_id"
                  value={despesaAtual.categoria_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="valor_total">Valor Total (R$)</label>
                  <input
                    type="number"
                    id="valor_total"
                    name="valor_total"
                    value={despesaAtual.valor_total}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="valor_pago">Valor Pago (R$)</label>
                  <input
                    type="number"
                    id="valor_pago"
                    name="valor_pago"
                    value={despesaAtual.valor_pago}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
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

export default Despesas;
