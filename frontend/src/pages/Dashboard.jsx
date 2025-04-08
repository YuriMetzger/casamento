import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaWallet, FaChartPie, FaCalendarAlt } from 'react-icons/fa';
import { estatisticasService } from '../services/api';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import DoughnutChart from '../components/DoughnutChart';
import BarChart from '../components/BarChart';
import './Dashboard.css';

const Dashboard = () => {
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        setLoading(true);
        const data = await estatisticasService.obter();
        setEstatisticas(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        setError('Não foi possível carregar as estatísticas. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarEstatisticas();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h1 className="page-title">Dashboard</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1 className="page-title">Dashboard</h1>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  if (!estatisticas) {
    return null;
  }

  // Preparar dados para os gráficos
  const despesasPorCategoria = {
    labels: estatisticas.categorias.map(cat => cat.nome),
    values: estatisticas.categorias.map(cat => cat.total)
  };

  const pagamentosPorCategoria = {
    labels: estatisticas.categorias.map(cat => cat.nome),
    totalValues: estatisticas.categorias.map(cat => cat.total),
    paidValues: estatisticas.categorias.map(cat => cat.pago)
  };

  // Formatar valores para exibição
  const formatarValor = (valor) => `R$ ${valor.toLocaleString('pt-BR')}`;
  const formatarPercentual = (valor) => `${valor.toFixed(1)}%`;

  return (
    <div className="container">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="dashboard-stats">
        <StatCard 
          title="Orçamento Total" 
          value={formatarValor(estatisticas.orcamento_total)} 
          icon={<FaMoneyBillWave />} 
          colorClass="primary"
        />
        <StatCard 
          title="Total de Despesas" 
          value={formatarValor(estatisticas.total_despesas)} 
          icon={<FaWallet />} 
          colorClass="secondary"
        />
        <StatCard 
          title="Total Pago" 
          value={formatarValor(estatisticas.total_pago)} 
          icon={<FaChartPie />} 
          colorClass="success"
        />
        <StatCard 
          title="Saldo Restante" 
          value={formatarValor(estatisticas.saldo_restante)} 
          icon={<FaCalendarAlt />} 
          colorClass={estatisticas.saldo_restante >= 0 ? "success" : "danger"}
        />
      </div>
      
      <div className="dashboard-progress">
        <h2 className="section-title">Progresso do Orçamento</h2>
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
      
      <div className="dashboard-charts">
        <div className="chart-container">
          <h2 className="section-title">Despesas por Categoria</h2>
          <DoughnutChart data={despesasPorCategoria} />
        </div>
        
        <div className="chart-container">
          <h2 className="section-title">Pagamentos por Categoria</h2>
          <BarChart data={pagamentosPorCategoria} />
        </div>
      </div>
      
      <div className="dashboard-categories">
        <h2 className="section-title">Detalhes por Categoria</h2>
        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Pendente</th>
                <th>Progresso</th>
              </tr>
            </thead>
            <tbody>
              {estatisticas.categorias.map(categoria => (
                <tr key={categoria.id}>
                  <td>{categoria.nome}</td>
                  <td>{formatarValor(categoria.total)}</td>
                  <td>{formatarValor(categoria.pago)}</td>
                  <td>{formatarValor(categoria.pendente)}</td>
                  <td>
                    <div className="table-progress">
                      <div 
                        className="table-progress-bar" 
                        style={{ 
                          width: `${categoria.total > 0 ? (categoria.pago / categoria.total) * 100 : 0}%`,
                          backgroundColor: categoria.pago === categoria.total ? 'var(--success-color)' : 'var(--primary-color)'
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
