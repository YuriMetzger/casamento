import { useState, useEffect } from 'react';
import { orcamentoService, estatisticasService } from '../services/api';
import { FaSave, FaMoneyBillWave } from 'react-icons/fa';
import ProgressBar from '../components/ProgressBar';
import './Orcamento.css';

const Orcamento = () => {
  const [orcamento, setOrcamento] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [valorOrcamento, setValorOrcamento] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const [orcamentoData, estatisticasData] = await Promise.all([
          orcamentoService.obter(),
          estatisticasService.obter()
        ]);
        
        setOrcamento(orcamentoData);
        setValorOrcamento(orcamentoData.valor_total);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSalvando(true);
      await orcamentoService.atualizar({ valor_total: parseFloat(valorOrcamento) });
      
      // Atualizar estatísticas após alterar o orçamento
      const estatisticasData = await estatisticasService.obter();
      setEstatisticas(estatisticasData);
      
      setMensagem({ texto: 'Orçamento atualizado com sucesso!', tipo: 'sucesso' });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setMensagem({ texto: '', tipo: '' });
      }, 3000);
    } catch (err) {
      console.error('Erro ao atualizar orçamento:', err);
      setMensagem({ texto: 'Ocorreu um erro ao atualizar o orçamento.', tipo: 'erro' });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h1 className="page-title">Orçamento</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1 className="page-title">Orçamento</h1>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Orçamento</h1>
      
      <div className="orcamento-container">
        <div className="orcamento-form-container">
          <h2 className="section-title">Definir Orçamento Total</h2>
          
          <form onSubmit={handleSubmit} className="orcamento-form">
            <div className="form-group">
              <label htmlFor="valor_orcamento">Valor do Orçamento (R$)</label>
              <div className="input-with-icon">
                <FaMoneyBillWave className="input-icon" />
                <input
                  type="number"
                  id="valor_orcamento"
                  value={valorOrcamento}
                  onChange={(e) => setValorOrcamento(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn-save-orcamento"
              disabled={salvando}
            >
              <FaSave /> {salvando ? 'Salvando...' : 'Salvar Orçamento'}
            </button>
            
            {mensagem.texto && (
              <div className={`mensagem mensagem-${mensagem.tipo}`}>
                {mensagem.texto}
              </div>
            )}
          </form>
        </div>
        
        {estatisticas && (
          <div className="orcamento-stats">
            <h2 className="section-title">Resumo do Orçamento</h2>
            
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Orçamento Total:</span>
                <span className="stat-value">R$ {estatisticas.orcamento_total.toLocaleString('pt-BR')}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Total de Despesas:</span>
                <span className="stat-value">R$ {estatisticas.total_despesas.toLocaleString('pt-BR')}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Total Pago:</span>
                <span className="stat-value">R$ {estatisticas.total_pago.toLocaleString('pt-BR')}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Total Pendente:</span>
                <span className="stat-value">R$ {estatisticas.total_pendente.toLocaleString('pt-BR')}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Saldo Restante:</span>
                <span className={`stat-value ${estatisticas.saldo_restante < 0 ? 'valor-negativo' : ''}`}>
                  R$ {estatisticas.saldo_restante.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
            
            <div className="orcamento-progress">
              <ProgressBar 
                value={estatisticas.total_despesas} 
                max={estatisticas.orcamento_total} 
                label="Orçamento Utilizado" 
              />
              
              <ProgressBar 
                value={estatisticas.total_pago} 
                max={estatisticas.total_despesas} 
                label="Pagamentos Realizados" 
                colorClass="progress-success"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orcamento;
