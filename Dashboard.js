import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    clients: 0,
    products: 0,
    warranties: 0,
    activeWarranties: 0
  });
  const [recentWarranties, setRecentWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        };

        // Obter estatísticas
        const clientsRes = await axios.get('/api/clients', config);
        const productsRes = await axios.get('/api/products', config);
        const warrantiesRes = await axios.get('/api/warranties', config);

        // Calcular garantias ativas (não expiradas)
        const today = new Date();
        const activeWarranties = warrantiesRes.data.data.filter(
          warranty => new Date(warranty.warrantyEndDate) > today
        );

        setStats({
          clients: clientsRes.data.count,
          products: productsRes.data.count,
          warranties: warrantiesRes.data.count,
          activeWarranties: activeWarranties.length
        });

        // Obter garantias recentes (últimas 5)
        const sortedWarranties = warrantiesRes.data.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        
        setRecentWarranties(sortedWarranties);
        setLoading(false);
      } catch (error) {
        setError('Erro ao carregar dados do dashboard');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  if (loading) return <div className="loading">Carregando dados...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Clientes</h3>
          <div className="number">{stats.clients}</div>
        </div>
        <div className="stat-card">
          <h3>Produtos</h3>
          <div className="number">{stats.products}</div>
        </div>
        <div className="stat-card">
          <h3>Garantias</h3>
          <div className="number">{stats.warranties}</div>
        </div>
        <div className="stat-card">
          <h3>Garantias Ativas</h3>
          <div className="number">{stats.activeWarranties}</div>
        </div>
      </div>

      <div className="recent-warranties">
        <h2>Garantias Recentes</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Data da Venda</th>
                <th>Validade da Garantia</th>
              </tr>
            </thead>
            <tbody>
              {recentWarranties.length > 0 ? (
                recentWarranties.map((warranty) => (
                  <tr key={warranty._id}>
                    <td>{warranty.client.name}</td>
                    <td>{warranty.product.name}</td>
                    <td>{formatDate(warranty.saleDate)}</td>
                    <td>{formatDate(warranty.warrantyEndDate)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    Nenhuma garantia registrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
