import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaRegCheckSquare, FaCheckSquare } from 'react-icons/fa';
import { checklistsService, tarefasService } from '../../services/api';
import './ChecklistDetail.css';

const ChecklistDetail = ({ categoriaId, checklistId }) => {
  const [checklist, setChecklist] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: ''
  });
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        // Carregar checklists da categoria
        const checklists = await checklistsService.listarPorCategoria(categoriaId);
        const checklistEncontrado = checklists.find(c => c.id === checklistId);
        
        if (checklistEncontrado) {
          setChecklist(checklistEncontrado);
          setFormData({
            titulo: checklistEncontrado.titulo,
            descricao: checklistEncontrado.descricao || ''
          });
          
          // Carregar tarefas do checklist
          const tarefasData = await tarefasService.listarPorChecklist(checklistId);
          setTarefas(tarefasData);
        } else {
          setError('Checklist não encontrado');
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, [categoriaId, checklistId]);
  
  const handleTarefaChange = (e) => {
    setNovaTarefa(e.target.value);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const adicionarTarefa = async () => {
    if (novaTarefa.trim()) {
      try {
        const novaTarefaData = {
          descricao: novaTarefa.trim(),
          concluida: false,
          checklist_id: checklistId
        };
        
        const tarefaSalva = await tarefasService.adicionar(novaTarefaData);
        setTarefas(prev => [...prev, tarefaSalva]);
        setNovaTarefa('');
      } catch (err) {
        console.error('Erro ao adicionar tarefa:', err);
        alert('Ocorreu um erro ao adicionar a tarefa. Por favor, tente novamente.');
      }
    }
  };
  
  const removerTarefa = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await tarefasService.excluir(id);
        setTarefas(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        console.error('Erro ao excluir tarefa:', err);
        alert('Ocorreu um erro ao excluir a tarefa. Por favor, tente novamente.');
      }
    }
  };
  
  const toggleTarefa = async (id, concluida) => {
    try {
      const tarefaAtualizada = await tarefasService.marcarConcluida(id, !concluida);
      setTarefas(prev => prev.map(t => t.id === id ? tarefaAtualizada : t));
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      alert('Ocorreu um erro ao atualizar a tarefa. Por favor, tente novamente.');
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarTarefa();
    }
  };
  
  const toggleEditando = () => {
    setEditando(!editando);
    
    if (!editando) {
      setFormData({
        titulo: checklist.titulo,
        descricao: checklist.descricao || ''
      });
    }
  };
  
  const salvarChecklist = async () => {
    if (!formData.titulo.trim()) {
      alert('O título do checklist é obrigatório');
      return;
    }
    
    try {
      const checklistAtualizado = await checklistsService.atualizar(checklistId, {
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria_id: categoriaId
      });
      
      setChecklist(checklistAtualizado);
      setEditando(false);
    } catch (err) {
      console.error('Erro ao atualizar checklist:', err);
      alert('Ocorreu um erro ao atualizar o checklist. Por favor, tente novamente.');
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando checklist...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    );
  }
  
  if (!checklist) {
    return null;
  }
  
  const tarefasConcluidas = tarefas.filter(t => t.concluida).length;
  const percentualConcluido = tarefas.length > 0 ? (tarefasConcluidas / tarefas.length) * 100 : 0;
  
  return (
    <div className="checklist-detail">
      {editando ? (
        <div className="checklist-edit-form">
          <div className="form-group">
            <label htmlFor="titulo">Título do Checklist *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleFormChange}
              placeholder="Título do checklist"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleFormChange}
              placeholder="Descrição opcional"
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={toggleEditando}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="btn-save" 
              onClick={salvarChecklist}
            >
              <FaCheck /> Salvar
            </button>
          </div>
        </div>
      ) : (
        <div className="checklist-header">
          <div className="checklist-info">
            <h2 className="checklist-title">{checklist.titulo}</h2>
            {checklist.descricao && (
              <p className="checklist-description">{checklist.descricao}</p>
            )}
            <div className="checklist-category">
              Categoria: <span>{checklist.categoria_nome}</span>
            </div>
          </div>
          
          <button 
            className="btn-edit" 
            onClick={toggleEditando}
            title="Editar checklist"
          >
            <FaEdit />
          </button>
        </div>
      )}
      
      <div className="checklist-progress">
        <div className="progress-header">
          <h3>Progresso</h3>
          <span className="progress-percentage">
            {percentualConcluido.toFixed(1)}%
          </span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${percentualConcluido}%`,
              backgroundColor: percentualConcluido >= 100 ? 'var(--success-color)' : 'var(--primary-color)'
            }}
          ></div>
        </div>
        <div className="progress-stats">
          <span>{tarefasConcluidas} de {tarefas.length} tarefas concluídas</span>
        </div>
      </div>
      
      <div className="tarefas-section">
        <h3>Tarefas</h3>
        
        <div className="tarefa-input-container">
          <input
            type="text"
            value={novaTarefa}
            onChange={handleTarefaChange}
            onKeyDown={handleKeyDown}
            placeholder="Adicionar nova tarefa"
          />
          <button 
            className="btn-add-tarefa"
            onClick={adicionarTarefa}
          >
            <FaPlus /> Adicionar
          </button>
        </div>
        
        <div className="tarefas-list">
          {tarefas.length === 0 ? (
            <div className="no-tarefas">Nenhuma tarefa adicionada</div>
          ) : (
            <>
              <div className="tarefas-pendentes">
                <h4>Pendentes</h4>
                {tarefas.filter(t => !t.concluida).length === 0 ? (
                  <div className="no-tarefas">Nenhuma tarefa pendente</div>
                ) : (
                  tarefas
                    .filter(t => !t.concluida)
                    .map(tarefa => (
                      <div key={tarefa.id} className="tarefa-item">
                        <div 
                          className="tarefa-checkbox"
                          onClick={() => toggleTarefa(tarefa.id, tarefa.concluida)}
                        >
                          <FaRegCheckSquare />
                        </div>
                        <span className="tarefa-descricao">{tarefa.descricao}</span>
                        <button 
                          className="btn-remove-tarefa"
                          onClick={() => removerTarefa(tarefa.id)}
                          title="Remover tarefa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))
                )}
              </div>
              
              {tarefas.filter(t => t.concluida).length > 0 && (
                <div className="tarefas-concluidas">
                  <h4>Concluídas</h4>
                  {tarefas
                    .filter(t => t.concluida)
                    .map(tarefa => (
                      <div key={tarefa.id} className="tarefa-item concluida">
                        <div 
                          className="tarefa-checkbox checked"
                          onClick={() => toggleTarefa(tarefa.id, tarefa.concluida)}
                        >
                          <FaCheckSquare />
                        </div>
                        <span className="tarefa-descricao">{tarefa.descricao}</span>
                        <button 
                          className="btn-remove-tarefa"
                          onClick={() => removerTarefa(tarefa.id)}
                          title="Remover tarefa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))
                  }
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistDetail;
