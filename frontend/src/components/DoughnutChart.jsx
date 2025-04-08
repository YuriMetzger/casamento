import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ data, title }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: [
          '#6a5acd',
          '#9370db',
          '#ba55d3',
          '#da70d6',
          '#ee82ee',
          '#dda0dd',
          '#d8bfd8',
          '#e6e6fa',
          '#483d8b',
          '#7b68ee',
          '#4b0082',
          '#8a2be2',
          '#9400d3',
          '#9932cc'
        ],
        borderColor: [
          '#fff',
          '#fff',
          '#fff',
          '#fff',
          '#fff',
          '#fff',
          '#fff',
          '#fff',
          '#fff',
          '#fff',
          '#fff',
          '#fff',
          '#fff',
          '#fff'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12
          }
        }
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
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: R$ ${value.toLocaleString('pt-BR')} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  return <Doughnut data={chartData} options={options} />;
};

export default DoughnutChart;
