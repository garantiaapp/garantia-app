import React, { useState, useEffect } from 'react';
import { getDashboardAnalytics, generateAiInsights } from '../services/analyticsService';
import './ReportsPage.css';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [warrantyData, setWarrantyData] = useState([]);
  const [timeframe, setTimeframe] = useState('month');
  const [aiInsights, setAiInsights] = useState('');
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [timeframe]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      // Obter dados de garantias
      const { data: warrantiesData } = await axios.get('/api/warranties', config);
      
      if (warrantiesData.success) {
        const warranties = warrantiesData.data;
        
        // Filtrar por período selecionado
        const filteredWarranties = filterByTimeframe(warranties, timeframe);
        
        // Processar dados para relatórios
        processReportData(filteredWarranties);
      } else {
        setError('Erro ao carregar dados para relatórios');
      }
      
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.error
          ? error.response.data.error
          : 'Erro ao carregar dados para relatórios'
      );
      setLoading(false);
    }
  };

  const filterByTimeframe = (warranties, timeframe) => {
    const today = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // Todos os dados
    }
    
    return warranties.filter(warranty => new Date(warranty.saleDate) >= startDate);
  };

  const processReportData = (warranties) => {
    // Dados de vendas por período
    const salesByDate = {};
    warranties.forEach(warranty => {
      const date = new Date(warranty.saleDate);
      let key;
      
      if (timeframe === 'week' || timeframe === 'month') {
        key = date.toLocaleDateString('pt-BR');
      } else if (timeframe === 'quarter') {
        key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      } else {
        key = `${date.getFullYear()}`;
      }
      
      if (!salesByDate[key]) {
        salesByDate[key] = {
          count: 0,
          total: 0
        };
      }
      
      salesByDate[key].count += 1;
      salesByDate[key].total += Number(warranty.price);
    });
    
    // Converter para array para exibição
    const salesData = Object.keys(salesByDate).map(date => ({
      date,
      count: salesByDate[date].count,
      total: salesByDate[date].total
    })).sort((a, b) => {
      // Ordenar por data
      const dateA = a.date.split('/').reverse().join('-');
      const dateB = b.date.split('/').reverse().join('-');
      return dateA.localeCompare(dateB);
    });
    
    // Dados de produtos mais vendidos
    const productSales = {};
    warranties.forEach(warranty => {
      const productId = warranty.product._id;
      const productName = warranty.product.name;
      
      if (!productSales[productId]) {
        productSales[productId] = {
          name: productName,
          count: 0,
          total: 0
        };
      }
      
      productSales[productId].count += 1;
      productSales[productId].total += Number(warranty.price);
    });
    
    // Converter para array e ordenar por quantidade
    const productData = Object.values(productSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 produtos
    
    // Dados de clientes mais frequentes
    const clientPurchases = {};
    warranties.forEach(warranty => {
      const clientId = warranty.client._id;
      const clientName = warranty.client.name;
      
      if (!clientPurchases[clientId]) {
        clientPurchases[clientId] = {
          name: clientName,
          count: 0,
          total: 0
        };
      }
      
      clientPurchases[clientId].count += 1;
      clientPurchases[clientId].total += Number(warranty.price);
    });
    
    // Converter para array e ordenar por valor total
    const clientData = Object.values(clientPurchases)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Top 5 clientes
    
    // Dados de garantias ativas vs expiradas
    const today = new Date();
    const active = warranties.filter(warranty => new Date(warranty.warrantyEndDate) > today).length;
    const expired = warranties.filter(warranty => new Date(warranty.warrantyEndDate) <= today).length;
    const warrantyData = [
      { status: 'Ativas', count: active },
      { status: 'Expiradas', count: expired }
    ];
    
    setSalesData(salesData);
    setProductData(productData);
    setClientData(clientData);
    setWarrantyData(warrantyData);
  };

  const handleGenerateAiInsights = async () => {
    try {
      setGeneratingInsights(true);
      
      // Chamar o serviço de IA real
      const result = await generateAiInsights(timeframe);
      
      if (result.success) {
        setAiInsights(result.data.insights);
      } else {
        setError(result.error || 'Erro ao gerar insights com IA');
      }
      setGeneratingInsights(false);
    } catch (error) {
      setError('Erro ao gerar insights com IA');
      setGeneratingInsights(false);
    }
  };

  const generateMockAiInsights = () => {
    // Análise simulada baseada nos dados processados
    const totalSales = salesData.reduce((sum, item) => sum + item.total, 0);
    const totalCount = salesData.reduce((sum, item) => sum + item.count, 0);
    const avgTicket = totalCount > 0 ? totalSales / totalCount : 0;
    
    const bestProduct = productData.length > 0 ? productData[0] : null;
    const bestClient = clientData.length > 0 ? clientData[0] : null;
    
    const activeWarranties = warrantyData.find(w => w.status === 'Ativas')?.count || 0;
    const expiredWarranties = warrantyData.find(w => w.status === 'Expiradas')?.count || 0;
    const totalWarranties = activeWarranties + expiredWarranties;
    const activeRatio = totalWarranties > 0 ? (activeWarranties / totalWarranties) * 100 : 0;
    
    // Tendências de vendas
    let trend = 'estável';
    if (salesData.length >= 2) {
      const firstHalf = salesData.slice(0, Math.floor(salesData.length / 2));
      const secondHalf = salesData.slice(Math.floor(salesData.length / 2));
      
      const firstHalfTotal = firstHalf.reduce((sum, item) => sum + item.total, 0);
      const secondHalfTotal = secondHalf.reduce((sum, item) => sum + item.total, 0);
      
      if (secondHalfTotal > firstHalfTotal * 1.1) {
        trend = 'crescente';
      } else if (secondHalfTotal < firstHalfTotal * 0.9) {
        trend = 'decrescente';
      }
    }
    
    return `
      ## Análise de Desempenho da Etherna Joias

      ### Resumo de Vendas
      No período analisado, a Etherna Joias registrou um total de R$ ${totalSales.toFixed(2)} em vendas, com ${totalCount} produtos vendidos. O ticket médio foi de R$ ${avgTicket.toFixed(2)}.

      ### Tendências Identificadas
      A análise dos dados mostra uma tendência ${trend} nas vendas durante o período selecionado.
      
      ${bestProduct ? `O produto "${bestProduct.name}" foi o mais vendido, com ${bestProduct.count} unidades, gerando uma receita de R$ ${bestProduct.total.toFixed(2)}.` : ''}
      
      ${bestClient ? `O cliente "${bestClient.name}" foi o mais valioso, com um total de R$ ${bestClient.total.toFixed(2)} em compras.` : ''}

      ### Status das Garantias
      Atualmente, ${activeRatio.toFixed(1)}% das garantias estão ativas (${activeWarranties} de um total de ${totalWarranties}).

      ### Recomendações
      1. ${trend === 'crescente' ? 'Manter a estratégia atual de vendas que está gerando bons resultados.' : trend === 'decrescente' ? 'Revisar a estratégia de vendas e considerar promoções para aumentar o volume.' : 'Continuar monitorando as vendas e ajustar estratégias conforme necessário.'}
      2. ${bestProduct ? `Considerar aumentar o estoque do produto "${bestProduct.name}" que tem alta demanda.` : ''}
      3. ${bestClient ? `Desenvolver um programa de fidelidade para clientes frequentes como "${bestClient.name}".` : ''}
      4. Implementar lembretes para clientes com garantias próximas do vencimento para estimular novas compras.
    `;
  };

  const formatCurrency = (value) => {
    return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
  };

  if (loading && !salesData.length) return <div className="loading">Carregando dados dos relatórios...</div>;

  return (
    <div className="reports-container">
      <h1 className="page-title">Relatórios e Análises</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="reports-controls">
        <div className="timeframe-selector">
          <label htmlFor="timeframe">Período:</label>
          <select 
            id="timeframe" 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="form-control"
          >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
            <option value="all">Todo o Período</option>
          </select>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={handleGenerateAiInsights}
          disabled={generatingInsights}
        >
          {generatingInsights ? 'Gerando Insights...' : 'Gerar Análise com IA'}
        </button>
      </div>
      
      <div className="reports-grid">
        <div className="report-card">
          <h2>Vendas por Período</h2>
          {salesData.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Quantidade</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.date}</td>
                      <td>{item.count}</td>
                      <td>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td><strong>Total</strong></td>
                    <td><strong>{salesData.reduce((sum, item) => sum + item.count, 0)}</strong></td>
                    <td><strong>{formatCurrency(salesData.reduce((sum, item) => sum + item.total, 0))}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">Nenhum dado disponível para o período selecionado</p>
          )}
        </div>
        
        <div className="report-card">
          <h2>Produtos Mais Vendidos</h2>
          {productData.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.count}</td>
                      <td>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">Nenhum dado disponível para o período selecionado</p>
          )}
        </div>
        
        <div className="report-card">
          <h2>Clientes com Maior Valor</h2>
          {clientData.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Compras</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.count}</td>
                      <td>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">Nenhum dado disponível para o período selecionado</p>
          )}
        </div>
        
        <div className="report-card">
          <h2>Status das Garantias</h2>
          {warrantyData.length > 0 ? (
            <div className="warranty-status-chart">
              <div className="chart-bars">
                {warrantyData.map((item, index) => (
                  <div key={index} className="chart-item">
                    <div 
                      className={`chart-bar ${item.status.toLowerCase()}`}
                      style={{ 
                        height: `${(item.count / Math.max(...warrantyData.map(w => w.count))) * 100}%` 
                      }}
                    >
                      <span className="chart-value">{item.count}</span>
                    </div>
                    <div className="chart-label">{item.status}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="no-data">Nenhum dado disponível para o período selecionado</p>
          )}
        </div>
      </div>
      
      {aiInsights && (
        <div className="ai-insights-container">
          <h2>Análise Inteligente</h2>
          <div className="ai-insights-content">
            <div dangerouslySetInnerHTML={{ __html: aiInsights.replace(/\n/g, '<br>').replace(/###\s(.*)/g, '<h3>$1</h3>').replace(/##\s(.*)/g, '<h2>$1</h2>') }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
