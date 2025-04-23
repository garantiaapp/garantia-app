import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'semi-joia',
    description: '',
    price: '',
    stock: '0'
  });
  const [productImage, setProductImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      const { data } = await axios.get('/api/products', config);
      
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.error || 'Erro ao carregar produtos');
      }
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.error
          ? error.response.data.error
          : 'Erro ao carregar produtos'
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
  };

  const handleImageChange = (e) => {
    setProductImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('code', formData.code);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      
      if (productImage) {
        formDataToSend.append('image', productImage);
      }

      if (editMode) {
        await axios.put(`/api/products/${currentProductId}`, formDataToSend, config);
      } else {
        await axios.post('/api/products', formDataToSend, config);
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      setError(
        error.response && error.response.data.error
          ? error.response.data.error
          : 'Erro ao salvar produto'
      );
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      code: product.code,
      type: product.type,
      description: product.description,
      price: product.price,
      stock: product.stock || '0'
    });
    setCurrentProductId(product._id);
    setEditMode(true);
    setShowForm(true);
    setProductImage(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        };

        await axios.delete(`/api/products/${id}`, config);
        fetchProducts();
      } catch (error) {
        setError(
          error.response && error.response.data.error
            ? error.response.data.error
            : 'Erro ao excluir produto'
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'semi-joia',
      description: '',
      price: '',
      stock: '0'
    });
    setProductImage(null);
    setEditMode(false);
    setCurrentProductId(null);
    setShowForm(false);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
  };

  if (loading) return <div className="loading">Carregando produtos...</div>;

  return (
    <div className="products-container">
      <h1 className="page-title">Gerenciamento de Produtos</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="products-actions">
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Adicionar Produto'}
        </button>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {showForm && (
        <div className="product-form-container card">
          <h2>{editMode ? 'Editar Produto' : 'Novo Produto'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
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
                <label htmlFor="code">Código</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Tipo</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="semi-joia">Semi Joia</option>
                  <option value="prata">Prata</option>
                </select>
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
                <label htmlFor="stock">Estoque</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="form-control"
                  min="0"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="image">Imagem do Produto</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                className="form-control"
                accept="image/*"
                required={!editMode}
              />
              {editMode && <small className="form-text">Deixe em branco para manter a imagem atual</small>}
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
      
      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img src={`/uploads/${product.image.split('/').pop()}`} alt={product.name} />
              </div>
              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="product-code">Código: {product.code}</p>
                <p className="product-type">Tipo: {product.type === 'semi-joia' ? 'Semi Joia' : 'Prata'}</p>
                <p className="product-price">{formatPrice(product.price)}</p>
                <p className="product-stock">Estoque: {product.stock || 0}</p>
              </div>
              <div className="product-actions">
                <button 
                  className="btn-action btn-edit" 
                  onClick={() => handleEdit(product)}
                  title="Editar"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="btn-action btn-delete" 
                  onClick={() => handleDelete(product._id)}
                  title="Excluir"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            {searchTerm ? 'Nenhum produto encontrado para esta busca' : 'Nenhum produto cadastrado'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
