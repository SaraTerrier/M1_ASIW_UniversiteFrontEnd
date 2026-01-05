import type { ChartOptions } from 'chart.js';

/**
 * Options par défaut pour les graphiques en barres
 */
export const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14
      },
      bodyFont: {
        size: 13
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
};

/**
 * Options par défaut pour les graphiques en camembert/doughnut
 */
export const doughnutChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: {
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14
      },
      bodyFont: {
        size: 13
      },
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} étudiants (${percentage}%)`;
        }
      }
    }
  }
};

/**
 * Options par défaut pour les graphiques en ligne
 */
export const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14
      },
      bodyFont: {
        size: 13
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 20,
      ticks: {
        stepSize: 2
      }
    }
  }
};
