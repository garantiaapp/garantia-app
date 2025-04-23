import axios from 'axios';

// Configurar o token de autenticação
const getConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return {
    headers: {
      Authorization: `Bearer ${userInfo.token}`
    }
  };
};

// Obter dados para o dashboard
export const getDashboardAnalytics = async (timeframe = 'month') => {
  try {
    const config = getConfig();
    const { data } = await axios.get(`/api/analytics/dashboard?timeframe=${timeframe}`, config);
    return data;
  } catch (error) {
    throw new Error(
      error.response && error.response.data.error
        ? error.response.data.error
        : 'Erro ao carregar dados de análise'
    );
  }
};

// Gerar insights com IA
export const generateAiInsights = async (timeframe = 'month') => {
  try {
    const config = getConfig();
    config.headers['Content-Type'] = 'application/json';
    
    const { data } = await axios.post('/api/analytics/insights', { timeframe }, config);
    return data;
  } catch (error) {
    throw new Error(
      error.response && error.response.data.error
        ? error.response.data.error
        : 'Erro ao gerar insights com IA'
    );
  }
};
