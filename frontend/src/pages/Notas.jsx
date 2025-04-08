import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaEdit, FaTrash, FaSave, FaImage, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaAlignLeft, FaAlignCenter, FaAlignRight, FaListUl, FaListOl, FaPalette, FaHeading, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { notasService } from '../services/api';
import Modal from '../components/common/Modal';
import './Notas.css';

// Editor de texto rico personalizado usando contenteditable
const EditorRico = ({ value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const formatarTexto = (comando, valor = null) => {
    document.execCommand(comando, false, valor);
    editorRef.current.focus();
    handleInput();
  };

  const inserirImagem = () => {
    const url = prompt('Digite a URL da imagem:');
    if (url) {
      document.execCommand('insertImage', false, url);
      handleInput();
    }
  };

  return (
    <div className="editor-rico">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button type="button" onClick={() => formatarTexto('bold')} title="Negrito" className="toolbar-button">
            <FaBold size={18} />
          </button>
          <button type="button" onClick={() => formatarTexto('italic')} title="Itálico" className="toolbar-button">
            <FaItalic size={18} />
          </button>
          <button type="button" onClick={() => formatarTexto('underline')} title="Sublinhado" className="toolbar-button">
            <FaUnderline size={18} />
          </button>
          <button type="button" onClick={() => formatarTexto('strikeThrough')} title="Tachado" className="toolbar-button">
            <FaStrikethrough size={18} />
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button type="button" onClick={() => formatarTexto('justifyLeft')} title="Alinhar à esquerda" className="toolbar-button">
            <FaAlignLeft size={18} />
          </button>
          <button type="button" onClick={() => formatarTexto('justifyCenter')} title="Centralizar" className="toolbar-button">
            <FaAlignCenter size={18} />
          </button>
          <button type="button" onClick={() => formatarTexto('justifyRight')} title="Alinhar à direita" className="toolbar-button">
            <FaAlignRight size={18} />
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button type="button" onClick={() => formatarTexto('insertUnorderedList')} title="Lista com marcadores" className="toolbar-button">
            <FaListUl size={18} />
          </button>
          <button type="button" onClick={() => formatarTexto('insertOrderedList')} title="Lista numerada" className="toolbar-button">
            <FaListOl size={18} />
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button type="button" onClick={inserirImagem} title="Inserir imagem" className="toolbar-button">
            <FaImage size={18} />
          </button>

          <div className="toolbar-dropdown">
            <button type="button" className="toolbar-button dropdown-toggle" title="Estilo de texto">
              <FaHeading size={18} />
            </button>
            <div className="dropdown-menu">
              <button onClick={() => formatarTexto('formatBlock', 'h1')} className="dropdown-item">Título 1</button>
              <button onClick={() => formatarTexto('formatBlock', 'h2')} className="dropdown-item">Título 2</button>
              <button onClick={() => formatarTexto('formatBlock', 'h3')} className="dropdown-item">Título 3</button>
              <button onClick={() => formatarTexto('formatBlock', 'p')} className="dropdown-item">Parágrafo</button>
              <button onClick={() => formatarTexto('formatBlock', 'blockquote')} className="dropdown-item">Citação</button>
            </div>
          </div>

          <div className="toolbar-dropdown">
            <button type="button" className="toolbar-button dropdown-toggle" title="Cor do texto">
              <FaPalette size={18} />
            </button>
            <div className="dropdown-menu color-menu">
              <button onClick={() => formatarTexto('foreColor', '#000000')} className="color-item" style={{ backgroundColor: '#000000' }}></button>
              <button onClick={() => formatarTexto('foreColor', '#FF0000')} className="color-item" style={{ backgroundColor: '#FF0000' }}></button>
              <button onClick={() => formatarTexto('foreColor', '#0000FF')} className="color-item" style={{ backgroundColor: '#0000FF' }}></button>
              <button onClick={() => formatarTexto('foreColor', '#008000')} className="color-item" style={{ backgroundColor: '#008000' }}></button>
              <button onClick={() => formatarTexto('foreColor', '#FFA500')} className="color-item" style={{ backgroundColor: '#FFA500' }}></button>
              <button onClick={() => formatarTexto('foreColor', '#800080')} className="color-item" style={{ backgroundColor: '#800080' }}></button>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        placeholder="Digite seu conteúdo aqui..."
      />
    </div>
  );
};

const NotasHome = () => {
  const navigate = useNavigate();
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarNotas();
  }, []);

  const carregarNotas = async () => {
    try {
      setLoading(true);
      const data = await notasService.listarTodas();
      setNotas(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar notas:', err);
      setError('Não foi possível carregar as notas. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleNovaNota = () => {
    navigate('/notas/nova');
  };

  const handleVerNota = (id) => {
    navigate(`/notas/${id}`);
  };

  const handleExcluirNota = async (id, e) => {
    e.stopPropagation();

    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
      try {
        await notasService.excluir(id);
        setNotas(prev => prev.filter(nota => nota.id !== id));
      } catch (err) {
        console.error('Erro ao excluir nota:', err);
        alert('Ocorreu um erro ao excluir a nota. Por favor, tente novamente.');
      }
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString() + ' ' + data.toLocaleTimeString().substring(0, 5);
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
          <button onClick={carregarNotas}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Minhas Notas</h1>
        <div className="page-actions">
          <button
            className="btn-add"
            onClick={handleNovaNota}
            title="Adicionar nova nota"
          >
            <FaPlus /> Nova Nota
          </button>
        </div>
      </div>

      {notas.length === 0 ? (
        <div className="empty-state">
          <h2>Nenhuma nota encontrada</h2>
          <p>Clique no botão "Nova Nota" para adicionar uma nota.</p>
          <button className="btn-add" onClick={handleNovaNota}>
            <FaPlus /> Nova Nota
          </button>
        </div>
      ) : (
        <div className="notas-grid">
          {notas.map(nota => (
            <div
              key={nota.id}
              className="nota-card"
              onClick={() => handleVerNota(nota.id)}
            >
              <div className="nota-header">
                <h3 className="nota-titulo">{nota.titulo}</h3>
                <button
                  className="btn-delete-nota"
                  onClick={(e) => handleExcluirNota(nota.id, e)}
                  title="Excluir nota"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="nota-preview">
                <div
                  className="nota-conteudo-preview"
                  dangerouslySetInnerHTML={{ __html: nota.conteudo?.substring(0, 150) + '...' }}
                />
              </div>

              <div className="nota-footer">
                <span className="nota-data">
                  <FaClock size={16} /> Atualizado em {formatarData(nota.data_atualizacao)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NovaNota = () => {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleVoltar = () => {
    if (titulo || conteudo) {
      if (window.confirm('Deseja sair sem salvar as alterações?')) {
        navigate('/notas');
      }
    } else {
      navigate('/notas');
    }
  };

  const handleSalvar = async () => {
    if (!titulo.trim()) {
      alert('Por favor, informe um título para a nota.');
      return;
    }

    try {
      setSalvando(true);
      const novaNota = await notasService.adicionar({
        titulo,
        conteudo
      });
      navigate(`/notas/${novaNota.id}`);
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      alert('Ocorreu um erro ao salvar a nota. Por favor, tente novamente.');
      setSalvando(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <button className="btn-back" onClick={handleVoltar}>
          <FaArrowLeft /> Voltar
        </button>
        <h1 className="page-title">Nova Nota</h1>
        <div className="page-actions">
          <button
            className="btn-save"
            onClick={handleSalvar}
            disabled={salvando}
          >
            <FaSave size={18} /> {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="nota-editor">
        <div className="nota-titulo-input">
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título da nota"
            className="titulo-input"
          />
        </div>

        <div className="nota-conteudo-editor">
          <EditorRico
            value={conteudo}
            onChange={setConteudo}
          />
        </div>
      </div>
    </div>
  );
};

const NotaDetail = () => {
  const { notaId } = useParams();
  const navigate = useNavigate();
  const [nota, setNota] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const carregarNota = async () => {
      try {
        setLoading(true);
        const data = await notasService.obterPorId(notaId);
        setNota(data);
        setTitulo(data.titulo);
        setConteudo(data.conteudo || '');
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar nota:', err);
        setError('Não foi possível carregar a nota. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarNota();
  }, [notaId]);

  const handleVoltar = () => {
    if (editando && (titulo !== nota.titulo || conteudo !== nota.conteudo)) {
      if (window.confirm('Deseja sair sem salvar as alterações?')) {
        navigate('/notas');
      }
    } else {
      navigate('/notas');
    }
  };

  const handleEditar = () => {
    setEditando(true);
  };

  const handleCancelarEdicao = () => {
    setTitulo(nota.titulo);
    setConteudo(nota.conteudo || '');
    setEditando(false);
  };

  const handleSalvar = async () => {
    if (!titulo.trim()) {
      alert('Por favor, informe um título para a nota.');
      return;
    }

    try {
      setSalvando(true);
      const notaAtualizada = await notasService.atualizar(notaId, {
        titulo,
        conteudo
      });
      setNota(notaAtualizada);
      setEditando(false);
      setSalvando(false);
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      alert('Ocorreu um erro ao salvar a nota. Por favor, tente novamente.');
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
      try {
        await notasService.excluir(notaId);
        navigate('/notas');
      } catch (error) {
        console.error('Erro ao excluir nota:', error);
        alert('Ocorreu um erro ao excluir a nota. Por favor, tente novamente.');
      }
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString() + ' ' + data.toLocaleTimeString().substring(0, 5);
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
          <button onClick={() => navigate('/notas')}>Voltar</button>
        </div>
      </div>
    );
  }

  if (!nota) return null;

  return (
    <div className="container">
      <div className="page-header">
        <button className="btn-back" onClick={handleVoltar}>
          <FaArrowLeft /> Voltar
        </button>
        <h1 className="page-title">
          {editando ? 'Editar Nota' : 'Detalhes da Nota'}
        </h1>
        <div className="page-actions">
          {editando ? (
            <>
              <button
                className="btn-cancel"
                onClick={handleCancelarEdicao}
              >
                Cancelar
              </button>
              <button
                className="btn-save"
                onClick={handleSalvar}
                disabled={salvando}
              >
                <FaSave size={18} /> {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-edit"
                onClick={handleEditar}
                title="Editar nota"
              >
                <FaEdit size={18} /> Editar
              </button>
              <button
                className="btn-delete"
                onClick={handleExcluir}
                title="Excluir nota"
              >
                <FaTrash size={18} /> Excluir
              </button>
            </>
          )}
        </div>
      </div>

      <div className="nota-detail">
        {editando ? (
          <div className="nota-editor">
            <div className="nota-titulo-input">
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título da nota"
                className="titulo-input"
              />
            </div>

            <div className="nota-conteudo-editor">
              <EditorRico
                value={conteudo}
                onChange={setConteudo}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="nota-header-detail">
              <h2 className="nota-titulo-detail">{nota.titulo}</h2>
              <div className="nota-metadata">
                <span className="nota-data">
                  <FaCalendarAlt size={16} /> Criado em {formatarData(nota.data_criacao)}
                </span>
                <span className="nota-data">
                  <FaClock size={16} /> Atualizado em {formatarData(nota.data_atualizacao)}
                </span>
              </div>
            </div>

            <div className="nota-conteudo-detail">
              {nota.conteudo ? (
                <div dangerouslySetInnerHTML={{ __html: nota.conteudo }} />
              ) : (
                <p className="nota-sem-conteudo">Esta nota não possui conteúdo.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Notas = () => {
  return (
    <Routes>
      <Route path="/" element={<NotasHome />} />
      <Route path="/nova" element={<NovaNota />} />
      <Route path="/:notaId" element={<NotaDetail />} />
    </Routes>
  );
};

export default Notas;
