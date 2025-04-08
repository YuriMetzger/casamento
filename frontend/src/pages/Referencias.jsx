import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaEdit, FaTrash, FaImage, FaCalendarAlt, FaPalette, FaFolder } from 'react-icons/fa';
import { referenciasService, coresService, categoriasFotoService, fotosService } from '../services/api';
import ReferenciaForm from '../components/referencias/ReferenciaForm';
import FotoForm from '../components/referencias/FotoForm';
import CategoriaFotoForm from '../components/referencias/CategoriaFotoForm';
import Modal from '../components/common/Modal';
import './Referencias.css';

const ReferenciasHome = () => {
  const navigate = useNavigate();
  const [referencias, setReferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  
  useEffect(() => {
    carregarReferencias();
  }, []);
  
  const carregarReferencias = async () => {
    try {
      setLoading(true);
      const data = await referenciasService.listarTodas();
      setReferencias(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar referências:', err);
      setError('Não foi possível carregar as referências. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNovaReferencia = () => {
    navigate('/referencias/nova');
  };
  
  const handleVerReferencia = (id) => {
    navigate(`/referencias/${id}`);
  };
  
  const handleNovaCategoriaFoto = () => {
    setModalTitle('Nova Categoria de Fotos');
    setModalContent(
      <CategoriaFotoForm 
        onSalvar={handleSalvarCategoriaFoto} 
        onCancelar={() => setShowModal(false)} 
      />
    );
    setShowModal(true);
  };
  
  const handleSalvarCategoriaFoto = async (categoriaData) => {
    try {
      await categoriasFotoService.adicionar(categoriaData);
      setShowModal(false);
      // Não precisamos recarregar as referências aqui, pois as categorias são carregadas separadamente
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
      alert('Ocorreu um erro ao salvar a categoria. Por favor, tente novamente.');
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
          <button onClick={carregarReferencias}>Tentar novamente</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Referências</h1>
        <div className="page-actions">
          <button 
            className="btn-add"
            onClick={handleNovaCategoriaFoto}
            title="Adicionar nova categoria de fotos"
          >
            <FaFolder /> Nova Categoria
          </button>
          <button 
            className="btn-add"
            onClick={handleNovaReferencia}
            title="Adicionar nova referência"
          >
            <FaPlus /> Nova Referência
          </button>
        </div>
      </div>
      
      {referencias.length === 0 ? (
        <div className="empty-state">
          <h2>Nenhuma referência encontrada</h2>
          <p>Clique no botão "Nova Referência" para adicionar informações sobre o seu casamento.</p>
          <button className="btn-add" onClick={handleNovaReferencia}>
            <FaPlus /> Nova Referência
          </button>
        </div>
      ) : (
        <div className="referencias-grid">
          {referencias.map(referencia => (
            <div 
              key={referencia.id} 
              className="referencia-card"
              onClick={() => handleVerReferencia(referencia.id)}
            >
              <div className="referencia-header">
                {referencia.data_casamento && (
                  <div className="referencia-data">
                    <FaCalendarAlt /> {new Date(referencia.data_casamento).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="referencia-content">
                {referencia.foto_noivos ? (
                  <div className="referencia-foto">
                    <img src={referencia.foto_noivos} alt="Foto dos noivos" />
                  </div>
                ) : (
                  <div className="referencia-foto placeholder">
                    <FaImage />
                  </div>
                )}
                
                {referencia.cores && referencia.cores.length > 0 && (
                  <div className="referencia-cores">
                    <h3><FaPalette /> Paleta de Cores</h3>
                    <div className="cores-preview">
                      {referencia.cores.map((cor, index) => (
                        <div 
                          key={index} 
                          className="cor-dot"
                          style={{ backgroundColor: cor.codigo_hex }}
                          title={cor.nome || cor.codigo_hex}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="referencia-fotos-count">
                  <FaImage /> {referencia.fotos?.length || 0} fotos
                </div>
              </div>
              
              <div className="referencia-footer">
                <button className="btn-view">Ver Detalhes</button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={modalTitle}
      >
        {modalContent}
      </Modal>
    </div>
  );
};

const NovaReferencia = () => {
  const navigate = useNavigate();
  
  const handleVoltar = () => {
    navigate('/referencias');
  };
  
  const handleSalvar = async (referenciaData) => {
    try {
      await referenciasService.adicionar(referenciaData);
      navigate('/referencias');
    } catch (error) {
      console.error('Erro ao salvar referência:', error);
      alert('Ocorreu um erro ao salvar a referência. Por favor, tente novamente.');
    }
  };
  
  return (
    <div className="container">
      <div className="page-header">
        <button className="btn-back" onClick={handleVoltar}>
          <FaArrowLeft /> Voltar
        </button>
        <h1 className="page-title">Nova Referência</h1>
      </div>
      
      <ReferenciaForm onSalvar={handleSalvar} />
    </div>
  );
};

const ReferenciaDetail = () => {
  const { referenciaId } = useParams();
  const navigate = useNavigate();
  const [referencia, setReferencia] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        // Carregar referência
        const referenciaData = await referenciasService.obterPorId(referenciaId);
        setReferencia(referenciaData);
        
        // Carregar fotos
        const fotosData = await fotosService.listarPorReferencia(referenciaId);
        setFotos(fotosData);
        
        // Carregar categorias
        const categoriasData = await categoriasFotoService.listarTodas();
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
  }, [referenciaId]);
  
  const handleVoltar = () => {
    navigate('/referencias');
  };
  
  const handleEditarReferencia = () => {
    setModalTitle('Editar Referência');
    setModalContent(
      <ReferenciaForm 
        referencia={referencia} 
        onSalvar={handleSalvarReferencia} 
        onCancelar={() => setShowModal(false)} 
      />
    );
    setShowModal(true);
  };
  
  const handleSalvarReferencia = async (referenciaData) => {
    try {
      const referenciaAtualizada = await referenciasService.atualizar(referenciaId, referenciaData);
      setReferencia(referenciaAtualizada);
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao atualizar referência:', err);
      alert('Ocorreu um erro ao atualizar a referência. Por favor, tente novamente.');
    }
  };
  
  const handleExcluirReferencia = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta referência? Esta ação não pode ser desfeita.')) {
      try {
        await referenciasService.excluir(referenciaId);
        navigate('/referencias');
      } catch (err) {
        console.error('Erro ao excluir referência:', err);
        alert('Ocorreu um erro ao excluir a referência. Por favor, tente novamente.');
      }
    }
  };
  
  const handleAdicionarFoto = () => {
    setModalTitle('Adicionar Foto');
    setModalContent(
      <FotoForm 
        referenciaId={parseInt(referenciaId)} 
        onSalvar={handleSalvarFoto} 
        onCancelar={() => setShowModal(false)} 
      />
    );
    setShowModal(true);
  };
  
  const handleSalvarFoto = async (fotoData) => {
    try {
      const novaFoto = await fotosService.adicionar(fotoData);
      setFotos(prev => [...prev, novaFoto]);
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao salvar foto:', err);
      alert('Ocorreu um erro ao salvar a foto. Por favor, tente novamente.');
    }
  };
  
  const handleEditarFoto = (foto) => {
    setModalTitle('Editar Foto');
    setModalContent(
      <FotoForm 
        foto={foto} 
        referenciaId={parseInt(referenciaId)} 
        onSalvar={(fotoData) => handleAtualizarFoto(foto.id, fotoData)} 
        onCancelar={() => setShowModal(false)} 
      />
    );
    setShowModal(true);
  };
  
  const handleAtualizarFoto = async (fotoId, fotoData) => {
    try {
      const fotoAtualizada = await fotosService.atualizar(fotoId, fotoData);
      setFotos(prev => prev.map(f => f.id === fotoId ? fotoAtualizada : f));
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao atualizar foto:', err);
      alert('Ocorreu um erro ao atualizar a foto. Por favor, tente novamente.');
    }
  };
  
  const handleExcluirFoto = async (fotoId) => {
    if (window.confirm('Tem certeza que deseja excluir esta foto?')) {
      try {
        await fotosService.excluir(fotoId);
        setFotos(prev => prev.filter(f => f.id !== fotoId));
      } catch (err) {
        console.error('Erro ao excluir foto:', err);
        alert('Ocorreu um erro ao excluir a foto. Por favor, tente novamente.');
      }
    }
  };
  
  const handleFiltrarPorCategoria = (categoriaId) => {
    setFiltroCategoria(categoriaId);
  };
  
  const fotosFiltradas = filtroCategoria 
    ? fotos.filter(foto => foto.categoria_id === parseInt(filtroCategoria))
    : fotos;
  
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
          <button onClick={() => navigate('/referencias')}>Voltar</button>
        </div>
      </div>
    );
  }
  
  if (!referencia) return null;
  
  return (
    <div className="container">
      <div className="page-header">
        <button className="btn-back" onClick={handleVoltar}>
          <FaArrowLeft /> Voltar
        </button>
        <h1 className="page-title">Detalhes da Referência</h1>
        <div className="page-actions">
          <button 
            className="btn-edit"
            onClick={handleEditarReferencia}
            title="Editar referência"
          >
            <FaEdit />
          </button>
          <button 
            className="btn-delete"
            onClick={handleExcluirReferencia}
            title="Excluir referência"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      
      <div className="referencia-detail">
        <div className="referencia-info">
          {referencia.data_casamento && (
            <div className="referencia-data-casamento">
              <h3><FaCalendarAlt /> Data do Casamento</h3>
              <p>{new Date(referencia.data_casamento).toLocaleDateString()}</p>
            </div>
          )}
          
          <div className="referencia-imagens">
            <div className="referencia-imagem-container">
              <h3>Foto dos Noivos</h3>
              {referencia.foto_noivos ? (
                <div className="referencia-imagem">
                  <img src={referencia.foto_noivos} alt="Foto dos noivos" />
                </div>
              ) : (
                <div className="referencia-imagem-placeholder">
                  <FaImage />
                  <p>Nenhuma foto adicionada</p>
                </div>
              )}
            </div>
            
            <div className="referencia-imagem-container">
              <h3>Logo do Casamento</h3>
              {referencia.logo_casamento ? (
                <div className="referencia-imagem">
                  <img src={referencia.logo_casamento} alt="Logo do casamento" />
                </div>
              ) : (
                <div className="referencia-imagem-placeholder">
                  <FaImage />
                  <p>Nenhum logo adicionado</p>
                </div>
              )}
            </div>
          </div>
          
          {referencia.cores && referencia.cores.length > 0 && (
            <div className="referencia-paleta">
              <h3><FaPalette /> Paleta de Cores</h3>
              <div className="cores-grid">
                {referencia.cores.map((cor, index) => (
                  <div key={index} className="cor-item">
                    <div 
                      className="cor-preview" 
                      style={{ backgroundColor: cor.codigo_hex }}
                    ></div>
                    <div className="cor-info">
                      <span className="cor-codigo">{cor.codigo_hex}</span>
                      {cor.nome && <span className="cor-nome">{cor.nome}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="referencia-fotos-section">
          <div className="fotos-header">
            <h2>Fotos de Referência</h2>
            <button 
              className="btn-add"
              onClick={handleAdicionarFoto}
              title="Adicionar nova foto"
            >
              <FaPlus /> Adicionar Foto
            </button>
          </div>
          
          <div className="fotos-filtro">
            <label htmlFor="filtro-categoria">Filtrar por categoria:</label>
            <select
              id="filtro-categoria"
              value={filtroCategoria}
              onChange={(e) => handleFiltrarPorCategoria(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>
          
          {fotosFiltradas.length === 0 ? (
            <div className="no-fotos">
              <FaImage />
              <p>Nenhuma foto encontrada</p>
              <button 
                className="btn-add"
                onClick={handleAdicionarFoto}
              >
                <FaPlus /> Adicionar Foto
              </button>
            </div>
          ) : (
            <div className="fotos-grid">
              {fotosFiltradas.map(foto => (
                <div key={foto.id} className="foto-card">
                  <div className="foto-image">
                    <img src={foto.url} alt={foto.descricao || 'Foto de referência'} />
                    <div className="foto-overlay">
                      <button 
                        className="btn-edit-foto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditarFoto(foto);
                        }}
                        title="Editar foto"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-delete-foto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExcluirFoto(foto.id);
                        }}
                        title="Excluir foto"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="foto-info">
                    {foto.descricao && (
                      <p className="foto-descricao">{foto.descricao}</p>
                    )}
                    {foto.categoria_nome && (
                      <span className="foto-categoria">{foto.categoria_nome}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={modalTitle}
      >
        {modalContent}
      </Modal>
    </div>
  );
};

const Referencias = () => {
  return (
    <Routes>
      <Route path="/" element={<ReferenciasHome />} />
      <Route path="/nova" element={<NovaReferencia />} />
      <Route path="/:referenciaId" element={<ReferenciaDetail />} />
    </Routes>
  );
};

export default Referencias;
