const Warranty = require('../models/Warranty');
const Client = require('../models/Client');
const Product = require('../models/Product');

// @desc    Obter dados para relatórios e análises
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { timeframe } = req.query;
    
    // Obter todas as garantias
    const warranties = await Warranty.find({})
      .populate('client', 'name email whatsapp')
      .populate('product', 'name code type price image')
      .populate('createdBy', 'name');
    
    // Filtrar por período selecionado
    const filteredWarranties = filterByTimeframe(warranties, timeframe);
    
    // Processar dados para relatórios
    const analyticsData = processAnalyticsData(filteredWarranties);
    
    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Gerar insights com IA
// @route   POST /api/analytics/insights
// @access  Private/Admin
exports.generateInsights = async (req, res) => {
  try {
    const { timeframe } = req.body;
    
    // Obter todas as garantias
    const warranties = await Warranty.find({})
      .populate('client', 'name email whatsapp')
      .populate('product', 'name code type price image')
      .populate('createdBy', 'name');
    
    // Filtrar por período selecionado
    const filteredWarranties = filterByTimeframe(warranties, timeframe);
    
    // Processar dados para relatórios
    const analyticsData = processAnalyticsData(filteredWarranties);
    
    // Gerar insights baseados nos dados
    const insights = generateAiInsights(analyticsData);
    
    res.status(200).json({
      success: true,
      data: {
        insights,
        analyticsData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Função para filtrar garantias por período
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

// Função para processar dados para análises
const processAnalyticsData = (warranties) => {
  // Dados de vendas por período
  const salesByDate = {};
  warranties.forEach(warranty => {
    const date = new Date(warranty.saleDate);
    let key = date.toISOString().split('T')[0];
    
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
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Dados de produtos mais vendidos
  const productSales = {};
  warranties.forEach(warranty => {
    const productId = warranty.product._id.toString();
    const productName = warranty.product.name;
    const productType = warranty.product.type;
    
    if (!productSales[productId]) {
      productSales[productId] = {
        id: productId,
        name: productName,
        type: productType,
        count: 0,
        total: 0
      };
    }
    
    productSales[productId].count += 1;
    productSales[productId].total += Number(warranty.price);
  });
  
  // Converter para array e ordenar por quantidade
  const productData = Object.values(productSales)
    .sort((a, b) => b.count - a.count);
  
  // Dados de clientes mais frequentes
  const clientPurchases = {};
  warranties.forEach(warranty => {
    const clientId = warranty.client._id.toString();
    const clientName = warranty.client.name;
    const clientEmail = warranty.client.email;
    
    if (!clientPurchases[clientId]) {
      clientPurchases[clientId] = {
        id: clientId,
        name: clientName,
        email: clientEmail,
        count: 0,
        total: 0,
        products: []
      };
    }
    
    clientPurchases[clientId].count += 1;
    clientPurchases[clientId].total += Number(warranty.price);
    
    // Adicionar produto à lista de produtos do cliente se ainda não estiver
    const productId = warranty.product._id.toString();
    if (!clientPurchases[clientId].products.includes(productId)) {
      clientPurchases[clientId].products.push(productId);
    }
  });
  
  // Converter para array e ordenar por valor total
  const clientData = Object.values(clientPurchases)
    .sort((a, b) => b.total - a.total);
  
  // Dados de garantias ativas vs expiradas
  const today = new Date();
  const active = warranties.filter(warranty => new Date(warranty.warrantyEndDate) > today).length;
  const expired = warranties.filter(warranty => new Date(warranty.warrantyEndDate) <= today).length;
  const warrantyData = [
    { status: 'Ativas', count: active },
    { status: 'Expiradas', count: expired }
  ];
  
  // Dados de vendas por tipo de produto
  const salesByType = {};
  warranties.forEach(warranty => {
    const type = warranty.product.type;
    
    if (!salesByType[type]) {
      salesByType[type] = {
        count: 0,
        total: 0
      };
    }
    
    salesByType[type].count += 1;
    salesByType[type].total += Number(warranty.price);
  });
  
  // Converter para array
  const typeData = Object.keys(salesByType).map(type => ({
    type: type === 'semi-joia' ? 'Semi Joias' : 'Prata',
    count: salesByType[type].count,
    total: salesByType[type].total
  }));
  
  return {
    salesData,
    productData,
    clientData,
    warrantyData,
    typeData,
    totalSales: warranties.reduce((sum, item) => sum + Number(item.price), 0),
    totalCount: warranties.length
  };
};

// Função para gerar insights com IA
const generateAiInsights = (analyticsData) => {
  const { salesData, productData, clientData, warrantyData, typeData, totalSales, totalCount } = analyticsData;
  
  // Calcular métricas importantes
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
  
  // Preferência por tipo de produto
  const preferredType = typeData.sort((a, b) => b.count - a.count)[0];
  
  // Gerar insights baseados nos dados
  return `
    ## Análise de Desempenho da Etherna Joias

    ### Resumo de Vendas
    No período analisado, a Etherna Joias registrou um total de R$ ${totalSales.toFixed(2)} em vendas, com ${totalCount} produtos vendidos. O ticket médio foi de R$ ${avgTicket.toFixed(2)}.

    ### Tendências Identificadas
    A análise dos dados mostra uma tendência ${trend} nas vendas durante o período selecionado.
    
    ${bestProduct ? `O produto "${bestProduct.name}" foi o mais vendido, com ${bestProduct.count} unidades, gerando uma receita de R$ ${bestProduct.total.toFixed(2)}.` : ''}
    
    ${bestClient ? `O cliente "${bestClient.name}" foi o mais valioso, com um total de R$ ${bestClient.total.toFixed(2)} em compras.` : ''}
    
    ${preferredType ? `Os clientes demonstram preferência por produtos do tipo "${preferredType.type}", representando ${preferredType.count} das ${totalCount} vendas (${((preferredType.count / totalCount) * 100).toFixed(1)}%).` : ''}

    ### Status das Garantias
    Atualmente, ${activeRatio.toFixed(1)}% das garantias estão ativas (${activeWarranties} de um total de ${totalWarranties}).

    ### Recomendações
    1. ${trend === 'crescente' ? 'Manter a estratégia atual de vendas que está gerando bons resultados.' : trend === 'decrescente' ? 'Revisar a estratégia de vendas e considerar promoções para aumentar o volume.' : 'Continuar monitorando as vendas e ajustar estratégias conforme necessário.'}
    2. ${bestProduct ? `Considerar aumentar o estoque do produto "${bestProduct.name}" que tem alta demanda.` : ''}
    3. ${bestClient ? `Desenvolver um programa de fidelidade para clientes frequentes como "${bestClient.name}".` : ''}
    4. ${preferredType ? `Focar no desenvolvimento de novos produtos do tipo "${preferredType.type}" que tem maior aceitação.` : ''}
    5. Implementar lembretes para clientes com garantias próximas do vencimento para estimular novas compras.
  `;
};
