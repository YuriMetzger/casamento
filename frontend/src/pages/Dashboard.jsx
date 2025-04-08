import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaWallet, FaChartPie, FaCalendarAlt, FaChartBar, FaExchangeAlt, FaListAlt } from 'react-icons/fa';
import { estatisticasService, despesasService } from '../services/api';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import DoughnutChart from '../components/DoughnutChart';
import BarChart from '../components/BarChart';
import './Dashboard.css';

const Dashboard = () => {
  const [estatisticas, setEstatisticas] = useState(null);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState('categorias'); // 'categorias', 'despesas' ou 'comparativo'

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        // Carregar estatísticas e despesas em paralelo
        const [estatisticasData, despesasData] = await Promise.all([
          estatisticasService.obter(),
          despesasService.listarTodas()
        ]);

        setEstatisticas(estatisticasData);
        setDespesas(despesasData);
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
  // Dados para visualização por categorias
  const despesasPorCategoria = {
    labels: estatisticas.categorias.map(cat => cat.nome),
    values: estatisticas.categorias.map(cat => cat.total)
  };

  const pagamentosPorCategoria = {
    labels: estatisticas.categorias.map(cat => cat.nome),
    totalValues: estatisticas.categorias.map(cat => cat.total),
    paidValues: estatisticas.categorias.map(cat => cat.pago)
  };

  // Dados para visualização por despesas (apenas categorias com despesas)
  // Filtra categorias que têm despesas (valor total maior que zero)
  const categoriasFiltradas = estatisticas.categorias.filter(cat => cat.total > 0);

  const despesasFiltradas = {
    labels: categoriasFiltradas.map(cat => cat.nome),
    values: categoriasFiltradas.map(cat => cat.total)
  };

  const pagamentosFiltrados = {
    labels: categoriasFiltradas.map(cat => cat.nome),
    totalValues: categoriasFiltradas.map(cat => cat.total),
    paidValues: categoriasFiltradas.map(cat => cat.pago)
  };

  // Dados para visualização comparativa de despesas individuais
  // Ordenar despesas por valor total (do maior para o menor)
  const despesasOrdenadas = [...despesas].sort((a, b) => b.valor_total - a.valor_total);

  // Limitar a 15 despesas para melhor visualização
  const despesasTop = despesasOrdenadas.slice(0, 15);

  const comparativoDespesas = {
    labels: despesasTop.map(d => d.descricao),
    values: despesasTop.map(d => d.valor_total)
  };

  const comparativoPagamentos = {
    labels: despesasTop.map(d => d.descricao),
    totalValues: despesasTop.map(d => d.valor_total),
    paidValues: despesasTop.map(d => d.valor_pago)
  };

  // Verificar se há categorias com despesas e se há despesas
  const temCategoriaComDespesas = categoriasFiltradas.length > 0;
  const temDespesas = despesas.length > 0;

  // Selecionar dados com base no modo de visualização
  let dadosDoughnut, dadosBar;

  if (modoVisualizacao === 'categorias') {
    dadosDoughnut = despesasPorCategoria;
    dadosBar = pagamentosPorCategoria;
  } else if (modoVisualizacao === 'despesas') {
    dadosDoughnut = despesasFiltradas;
    dadosBar = pagamentosFiltrados;
  } else { // comparativo
    dadosDoughnut = comparativoDespesas;
    dadosBar = comparativoPagamentos;
  }

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

      <div className="dashboard-charts-header">
        <h2 className="section-title">Visualização de Gráficos</h2>
        <div className="toggle-container">
          <button
            className={`toggle-button ${modoVisualizacao === 'categorias' ? 'active' : ''}`}
            onClick={() => setModoVisualizacao('categorias')}
            title="Mostrar todas as categorias, mesmo as sem despesas"
          >
            <FaChartPie /> Todas Categorias
          </button>
          <button
            className={`toggle-button ${modoVisualizacao === 'despesas' ? 'active' : ''}`}
            onClick={() => setModoVisualizacao('despesas')}
            title="Mostrar apenas categorias que possuem despesas registradas"
          >
            <FaChartBar /> Categorias com Despesas
          </button>
          <button
            className={`toggle-button ${modoVisualizacao === 'comparativo' ? 'active' : ''}`}
            onClick={() => setModoVisualizacao('comparativo')}
            title="Comparar todas as despesas individuais"
          >
            <FaListAlt /> Comparativo de Despesas
          </button>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <div className="chart-header">
            <h2 className="section-title">
              {modoVisualizacao === 'comparativo' ? 'Comparativo de Despesas' : 'Despesas por Categoria'}
            </h2>
            <span className="chart-subtitle">
              {modoVisualizacao === 'categorias'
                ? 'Todas as categorias'
                : modoVisualizacao === 'despesas'
                  ? 'Apenas categorias com despesas'
                  : 'Top 15 despesas por valor total'}
            </span>
          </div>
          {(modoVisualizacao === 'despesas' && !temCategoriaComDespesas) || (modoVisualizacao === 'comparativo' && !temDespesas) ? (
            <div className="no-data chart-no-data">
              {modoVisualizacao === 'despesas'
                ? 'Nenhuma categoria com despesas encontrada'
                : 'Nenhuma despesa cadastrada'}
            </div>
          ) : (
            <DoughnutChart
              data={dadosDoughnut}
              key={`doughnut-${modoVisualizacao}`}
              title={modoVisualizacao === 'comparativo' ? 'Valor total por despesa' : undefined}
            />
          )}
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h2 className="section-title">
              {modoVisualizacao === 'comparativo' ? 'Pagamentos por Despesa' : 'Pagamentos por Categoria'}
            </h2>
            <span className="chart-subtitle">
              {modoVisualizacao === 'categorias'
                ? 'Todas as categorias'
                : modoVisualizacao === 'despesas'
                  ? 'Apenas categorias com despesas'
                  : 'Top 15 despesas por valor total'}
            </span>
          </div>
          {(modoVisualizacao === 'despesas' && !temCategoriaComDespesas) || (modoVisualizacao === 'comparativo' && !temDespesas) ? (
            <div className="no-data chart-no-data">
              {modoVisualizacao === 'despesas'
                ? 'Nenhuma categoria com despesas encontrada'
                : 'Nenhuma despesa cadastrada'}
            </div>
          ) : (
            <BarChart
              data={dadosBar}
              key={`bar-${modoVisualizacao}`}
              title={modoVisualizacao === 'comparativo' ? 'Comparativo entre valor total e valor pago' : undefined}
            />
          )}
        </div>
      </div>

      <div className="dashboard-categories">
        <div className="chart-header">
          <h2 className="section-title">
            {modoVisualizacao === 'comparativo' ? 'Detalhes das Despesas' : 'Detalhes por Categoria'}
          </h2>
          <span className="chart-subtitle">
            {modoVisualizacao === 'categorias'
              ? 'Todas as categorias'
              : modoVisualizacao === 'despesas'
                ? 'Apenas categorias com despesas'
                : 'Todas as despesas ordenadas por valor'}
          </span>
        </div>
        <div className="categories-table-container">
          {modoVisualizacao !== 'comparativo' ? (
            // Tabela de categorias
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
                {(modoVisualizacao === 'categorias' ? estatisticas.categorias : categoriasFiltradas).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">Nenhuma categoria com despesas encontrada</td>
                  </tr>
                ) : (
                  (modoVisualizacao === 'categorias' ? estatisticas.categorias : categoriasFiltradas).map(categoria => (
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
                ))
                )}
              </tbody>
            </table>
          ) : (
            // Tabela de despesas individuais
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Despesa</th>
                  <th>Categoria</th>
                  <th>Valor Total</th>
                  <th>Valor Pago</th>
                  <th>Progresso</th>
                </tr>
              </thead>
              <tbody>
                {despesas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">Nenhuma despesa cadastrada</td>
                  </tr>
                ) : (
                  despesasOrdenadas.map(despesa => (
                  <tr key={despesa.id}>
                    <td>{despesa.descricao}</td>
                    <td>{despesa.categoria_nome}</td>
                    <td>{formatarValor(despesa.valor_total)}</td>
                    <td>{formatarValor(despesa.valor_pago)}</td>
                    <td>
                      <div className="table-progress">
                        <div
                          className="table-progress-bar"
                          style={{
                            width: `${despesa.valor_total > 0 ? (despesa.valor_pago / despesa.valor_total) * 100 : 0}%`,
                            backgroundColor: despesa.valor_pago >= despesa.valor_total ? 'var(--success-color)' : 'var(--primary-color)'
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
