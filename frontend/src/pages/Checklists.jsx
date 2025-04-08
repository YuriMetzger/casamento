import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaCheckSquare, FaRegCheckSquare, FaTrash } from 'react-icons/fa';
import { categoriasChecklistService, checklistsService, tarefasService, estatisticasChecklistService } from '../services/api';
import CategoriaChecklistForm from '../components/checklist/CategoriaChecklistForm';
// Removemos a importação do ChecklistForm, pois agora as tarefas são adicionadas diretamente às categorias
// Removemos a importação do ChecklistDetail, pois agora as tarefas são gerenciadas diretamente
import './Checklists.css';

const ChecklistsHome = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const [categoriasData, estatisticasData] = await Promise.all([
          categoriasChecklistService.listarTodas(),
          estatisticasChecklistService.obter()
        ]);
        setCategorias(categoriasData);
        setEstatisticas(estatisticasData);
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

  const handleAdicionarCategoria = () => {
    navigate('/checklists/categorias/nova');
  };

  const handleAdicionarTarefa = (categoriaId) => {
    // Redirecionar para a página de detalhes da categoria
    navigate(`/checklists/categorias/${categoriaId}`);
  };

  const handleVerCategoria = (categoriaId) => {
    navigate(`/checklists/categorias/${categoriaId}`);
  };

  if (loading) {
    return (
      <div className="container">
        <h1 className="page-title">Checklists</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando checklists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1 className="page-title">Checklists</h1>
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
        <h1 className="page-title">Checklists</h1>
        <button className="btn-add" onClick={handleAdicionarCategoria}>
          <FaPlus /> Nova Categoria
        </button>
      </div>

      {estatisticas && (
        <div className="checklist-progress">
          <div className="progress-header">
            <h2>Progresso Geral</h2>
            <span className="progress-percentage">
              {estatisticas.percentual_geral.toFixed(1)}%
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{
                width: `${estatisticas.percentual_geral}%`,
                backgroundColor: estatisticas.percentual_geral >= 100 ? 'var(--success-color)' : 'var(--primary-color)'
              }}
            ></div>
          </div>
          <div className="progress-stats">
            <span>{estatisticas.total_concluidas} de {estatisticas.total_tarefas} tarefas concluídas</span>
          </div>
        </div>
      )}

      <div className="checklist-categories">
        {categorias.length === 0 ? (
          <div className="empty-state">
            <FaCheckSquare className="empty-icon" />
            <h3>Nenhuma categoria de checklist encontrada</h3>
            <p>Clique no botão "Nova Categoria" para começar a organizar suas tarefas.</p>
          </div>
        ) : (
          categorias.map(categoria => {
            const categoriaEstatistica = estatisticas?.categorias.find(c => c.id === categoria.id);
            const totalTarefas = categoriaEstatistica?.total_tarefas || 0;
            const tarefasConcluidas = categoriaEstatistica?.tarefas_concluidas || 0;
            const percentual = categoriaEstatistica?.percentual || 0;

            return (
              <div key={categoria.id} className="category-card">
                <div className="category-header">
                  <h2 className="category-title">{categoria.nome}</h2>
                  <button
                    className="btn-add-small"
                    onClick={() => handleAdicionarTarefa(categoria.id)}
                    title="Adicionar/gerenciar tarefas"
                  >
                    <FaPlus />
                  </button>
                </div>

                {categoria.descricao && (
                  <p className="category-description">{categoria.descricao}</p>
                )}

                <div className="category-progress">
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${percentual}%`,
                        backgroundColor: percentual >= 100 ? 'var(--success-color)' : 'var(--primary-color)'
                      }}
                    ></div>
                  </div>
                  <div className="progress-stats">
                    <span>{tarefasConcluidas} de {totalTarefas} tarefas concluídas</span>
                    <span className="progress-percentage">{percentual.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="tarefas-preview">
                  <button
                    className="btn-ver-tarefas"
                    onClick={() => handleVerCategoria(categoria.id)}
                  >
                    Ver e gerenciar tarefas
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const NovaCategoriaChecklist = () => {
  const navigate = useNavigate();

  const handleVoltar = () => {
    navigate('/checklists');
  };

  const handleSalvar = async (categoriaData) => {
    try {
      // Primeiro, criar a categoria
      const categoria = await categoriasChecklistService.adicionar({
        nome: categoriaData.nome,
        descricao: categoriaData.descricao
      });

      // Depois, criar um checklist padrão para a categoria
      const checklist = await checklistsService.adicionar({
        titulo: 'Tarefas',
        descricao: 'Lista de tarefas',
        categoria_id: categoria.id
      });

      // Por fim, criar as tarefas associadas ao checklist
      if (categoriaData.tarefas && categoriaData.tarefas.length > 0) {
        const tarefasPromises = categoriaData.tarefas.map(tarefa =>
          tarefasService.adicionar({
            descricao: tarefa.descricao,
            concluida: tarefa.concluida || false,
            checklist_id: checklist.id
          })
        );

        await Promise.all(tarefasPromises);
      }

      navigate('/checklists');
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Ocorreu um erro ao salvar a categoria. Por favor, tente novamente.');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <button className="btn-back" onClick={handleVoltar}>
          <FaArrowLeft /> Voltar
        </button>
        <h1 className="page-title">Nova Categoria de Checklist</h1>
      </div>

      <CategoriaChecklistForm onSalvar={handleSalvar} />
    </div>
  );
};

// Removemos o componente NovoChecklist, pois agora os checklists são criados
// diretamente junto com a categoria

const CategoriaView = () => {
  const { categoriaId } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [novaTarefa, setNovaTarefa] = useState('');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);

        // Carregar categoria, checklists e tarefas
        const categorias = await categoriasChecklistService.listarTodas();
        const categoriaEncontrada = categorias.find(c => c.id === parseInt(categoriaId));

        if (categoriaEncontrada) {
          setCategoria(categoriaEncontrada);

          // Carregar checklists da categoria
          const checklistsData = await checklistsService.listarPorCategoria(categoriaId);
          setChecklists(checklistsData);

          // Carregar tarefas da categoria
          const tarefasData = await tarefasService.listarPorCategoria(categoriaId);
          setTarefas(tarefasData);
        } else {
          setError('Categoria não encontrada');
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [categoriaId]);

  const handleVoltar = () => {
    navigate('/checklists');
  };

  const handleAdicionarTarefa = async () => {
    if (!novaTarefa.trim()) return;

    try {
      // Verificar se já existe um checklist padrão para esta categoria
      let checklist = checklists.find(c => c.titulo === 'Tarefas');

      // Se não existir, criar um
      if (!checklist) {
        checklist = await checklistsService.adicionar({
          titulo: 'Tarefas',
          descricao: 'Lista de tarefas',
          categoria_id: parseInt(categoriaId)
        });
        setChecklists(prev => [...prev, checklist]);
      }

      const novaTarefaData = {
        descricao: novaTarefa.trim(),
        concluida: false,
        checklist_id: checklist.id
      };

      const tarefaSalva = await tarefasService.adicionar(novaTarefaData);
      setTarefas(prev => [...prev, tarefaSalva]);
      setNovaTarefa('');
    } catch (err) {
      console.error('Erro ao adicionar tarefa:', err);
      alert('Ocorreu um erro ao adicionar a tarefa. Por favor, tente novamente.');
    }
  };

  const handleToggleTarefa = async (id, concluida) => {
    try {
      const tarefaAtualizada = await tarefasService.marcarConcluida(id, !concluida);
      setTarefas(prev => prev.map(t => t.id === id ? tarefaAtualizada : t));
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      alert('Ocorreu um erro ao atualizar a tarefa. Por favor, tente novamente.');
    }
  };

  const handleRemoverTarefa = async (id) => {
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdicionarTarefa();
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/checklists')}>Voltar</button>
        </div>
      </div>
    );
  }

  if (!categoria) return null;

  const tarefasConcluidas = tarefas.filter(t => t.concluida).length;
  const percentualConcluido = tarefas.length > 0 ? (tarefasConcluidas / tarefas.length) * 100 : 0;

  return (
    <div className="container">
      <div className="page-header">
        <button className="btn-back" onClick={handleVoltar}>
          <FaArrowLeft /> Voltar
        </button>
        <h1 className="page-title">Tarefas: {categoria.nome}</h1>
      </div>

      <div className="categoria-detail">
        {categoria.descricao && (
          <p className="categoria-description">{categoria.descricao}</p>
        )}

        <div className="categoria-progress">
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
              onChange={(e) => setNovaTarefa(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Adicionar nova tarefa"
            />
            <button
              className="btn-add-tarefa"
              onClick={handleAdicionarTarefa}
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
                            onClick={() => handleToggleTarefa(tarefa.id, tarefa.concluida)}
                          >
                            <FaRegCheckSquare />
                          </div>
                          <span className="tarefa-descricao">{tarefa.descricao}</span>
                          <button
                            className="btn-remove-tarefa"
                            onClick={() => handleRemoverTarefa(tarefa.id)}
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
                            onClick={() => handleToggleTarefa(tarefa.id, tarefa.concluida)}
                          >
                            <FaCheckSquare />
                          </div>
                          <span className="tarefa-descricao">{tarefa.descricao}</span>
                          <button
                            className="btn-remove-tarefa"
                            onClick={() => handleRemoverTarefa(tarefa.id)}
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
    </div>
  );
};

const Checklists = () => {
  return (
    <Routes>
      <Route path="/" element={<ChecklistsHome />} />
      <Route path="/categorias/nova" element={<NovaCategoriaChecklist />} />
      <Route path="/categorias/:categoriaId" element={<CategoriaView />} />
    </Routes>
  );
};

export default Checklists;
