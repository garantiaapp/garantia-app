import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WarrantiesPage.css';

const WarrantiesPage = () => {
  const [warranties, setWarranties] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    productId: '',
    saleDate: new Date().toISOString().split('T')[0],
    price: '',
    invoiceNumber: '',
    notes: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentWarrantyId, setCurrentWarrantyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailStatus, setEmailStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      const [warrantiesRes, clientsRes, productsRes] = await Promise.all([
        axios.get('/api/warranties', config),
        axios.get('/api/clients', config),
        axios.get('/api/products', config)
      ]);
      
      if (warrantiesRes.data.success && clientsRes.data.success && productsRes.data.success) {
        setWarranties(warrantiesRes.data.data);
        setClients(clientsRes.data.data);
        setProducts(productsRes.data.data);
      } else {
        setError('Erro ao carregar dados');
      }
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.error
          ? error.response.data.error
          : 'Erro ao carregar dados'
      );
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Se o produto for alterado, atualizar o preço automaticamente
    if (name === 'productId') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        setFormData({
          ...formData,
          productId: value,
          price: selectedProduct.price
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      if (editMode) {
        await axios.put(`/api/warranties/${currentWarrantyId}`, formData, config);
      } else {
        await axios.post('/api/warranties', formData, config);
      }

      resetForm();
      fetchData();
    } catch (error) {
      setError(
        error.response && error.response.data.error
          ? error.response.data.error
          : 'Erro ao salvar garantia'
      );
    }
  };

  const handleEdit = (warranty) => {
    setFormData({
      clientId: warranty.client._id,
      productId: warranty.product._id,
      saleDate: new Date(warranty.saleDate).toISOString().split('T')[0],
      price: warranty.price,
      invoiceNumber: warranty.invoiceNumber || '',
      notes: warranty.notes || ''
    });
    setCurrentWarrantyId(warranty._id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta garantia?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        };

        await axios.delete(`/api/warranties/${id}`, config);
        fetchData();
      } catch (error) {
        setError(
          error.response && error.response.data.error
            ? error.response.data.error
            : 'Erro ao excluir garantia'
        );
      }
    }
  };

  const handleResendEmail = async (id) => {
    try {
      setEmailStatus('sending');
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      const { data } = await axios.post(`/api/warranties/${id}/resend-email`, {}, config);
      
      if (data.success) {
        setEmailStatus('success');
        setTimeout(() => setEmailStatus(''), 3000);
        fetchData();
      } else {
        setEmailStatus('error');
        setTimeout(() => setEmailStatus(''), 3000);
      }
    } catch (error) {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus(''), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      productId: '',
      saleDate: new Date().toISOString().split('T')[0],
      price: '',
      invoiceNumber: '',
      notes: ''
    });
    setEditMode(false);
    setCurrentWarrantyId(null);
    setShowForm(false);
  };

  const filteredWarranties = warranties.filter(warranty => {
    const clientName = warranty.client?.name?.toLowerCase() || '';
    const productName = warranty.product?.name?.toLowerCase() || '';
    const productCode = warranty.product?.code?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return clientName.includes(searchLower) || 
           productName.includes(searchLower) || 
           productCode.includes(searchLower);
  });

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const formatPrice = (price) => {
    return `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
  };

  const isWarrantyActive = (endDate) => {
    return new Date(endDate) > new Date();
  };

  if (loading) return <div className="loading">Carregando garantias...</div>;

  return (
    <div className="warranties-container">
      <h1 className="page-title">Gerenciamento de Garantias</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {emailStatus === 'success' && <div className="alert alert-success">E-mail de garantia reenviado com sucesso!</div>}
      {emailStatus === 'error' && <div className="alert alert-danger">Erro ao reenviar e-mail de garantia.</div>}
      
      <div className="warranties-actions">
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Adicionar Garantia'}
        </button>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar garantias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {showForm && (
        <div className="warranty-form-container card">
          <h2>{editMode ? 'Editar Garantia' : 'Nova Garantia'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clientId">Cliente</label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="productId">Produto</label>
                <select
                  id="productId"
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} - {product.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="saleDate">Data da Venda</label>
                <input
                  type="date"
                  id="saleDate"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="price">Preço (R$)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="form-control"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="invoiceNumber">Número da Nota Fiscal</label>
                <input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Observações</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editMode ? 'Atualizar' : 'Salvar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="warranties-list">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Data da Venda</th>
                <th>Validade</th>
                <th>Valor</th>
                <th>Status</th>
                <th>E-mail</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarranties.length > 0 ? (
                filteredWarranties.map((warranty) => (
                  <tr key={warranty._id}>
                    <td>{warranty.client?.name}</td>
                    <td>{warranty.product?.name} - {warranty.product?.code}</td>
                    <td>{formatDate(warranty.saleDate)}</td>
                    <td>{formatDate(warranty.warrantyEndDate)}</td>
                    <td>{formatPrice(warranty.price)}</td>
                    <td>
                      <span className={`warranty-status ${isWarrantyActive(warranty.warrantyEndDate) ? 'active' : 'expired'}`}>
                        {isWarrantyActive(warranty.warrantyEndDate) ? 'Ativa' : 'Expirada'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-action btn-email"
                        onClick={() => handleResendEmail(warranty._id)}
                        title="Reenviar e-mail"
                        disabled={emailStatus === 'sending'}
                      >
                        {emailStatus === 'sending' ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-envelope"></i>
                        )}
                      </button>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => handleEdit(warranty)}
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => handleDelete(warranty._id)}
                        title="Excluir"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    {searchTerm ? 'Nenhuma garantia encontrada para esta busca' : 'Nenhuma garantia cadastrada'}
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

export default WarrantiesPage;
