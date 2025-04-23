import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClientsPage.css';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [editMode, setEditMode] = useState(false);
  const [currentClientId, setCurrentClientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      const { data } = await axios.get('/api/clients', config);
      
      if (data.success) {
        setClients(data.data);
      } else {
        setError(data.error || 'Erro ao carregar clientes');
      }
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.error
          ? error.response.data.error
          : 'Erro ao carregar clientes'
      );
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
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
        await axios.put(`/api/clients/${currentClientId}`, formData, config);
      } else {
        await axios.post('/api/clients', formData, config);
      }

      resetForm();
      fetchClients();
    } catch (error) {
      setError(
        error.response && error.response.data.error
          ? error.response.data.error
          : 'Erro ao salvar cliente'
      );
    }
  };

  const handleEdit = (client) => {
    setFormData({
      name: client.name,
      email: client.email,
      whatsapp: client.whatsapp,
      address: {
        street: client.address?.street || '',
        city: client.address?.city || '',
        state: client.address?.state || '',
        zipCode: client.address?.zipCode || ''
      }
    });
    setCurrentClientId(client._id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        };

        await axios.delete(`/api/clients/${id}`, config);
        fetchClients();
      } catch (error) {
        setError(
          error.response && error.response.data.error
            ? error.response.data.error
            : 'Erro ao excluir cliente'
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      whatsapp: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    });
    setEditMode(false);
    setCurrentClientId(null);
    setShowForm(false);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.whatsapp.includes(searchTerm)
  );

  if (loading) return <div className="loading">Carregando clientes...</div>;

  return (
    <div className="clients-container">
      <h1 className="page-title">Gerenciamento de Clientes</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="clients-actions">
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Adicionar Cliente'}
        </button>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {showForm && (
        <div className="client-form-container card">
          <h2>{editMode ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nome</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                type="text"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address.street">Endereço</label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Rua, número"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.city">Cidade</label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address.state">Estado</label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address.zipCode">CEP</label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
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
      
      <div className="clients-list">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>WhatsApp</th>
                <th>Cidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client._id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.whatsapp}</td>
                    <td>{client.address?.city || '-'}</td>
                    <td className="action-buttons">
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => handleEdit(client)}
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => handleDelete(client._id)}
                        title="Excluir"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    {searchTerm ? 'Nenhum cliente encontrado para esta busca' : 'Nenhum cliente cadastrado'}
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

export default ClientsPage;
