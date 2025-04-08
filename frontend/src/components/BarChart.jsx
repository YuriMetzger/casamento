import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data, title }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Valor Total',
        data: data.totalValues,
        backgroundColor: 'rgba(106, 90, 205, 0.7)',
        borderColor: 'rgba(106, 90, 205, 1)',
        borderWidth: 1,
      },
      {
        label: 'Valor Pago',
        data: data.paidValues,
        backgroundColor: 'rgba(147, 112, 219, 0.7)',
        borderColor: 'rgba(147, 112, 219, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: R$ ${value.toLocaleString('pt-BR')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R$ ' + value.toLocaleString('pt-BR');
          }
        }
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChart;
