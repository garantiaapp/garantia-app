const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Client = require('../models/Client');
const Product = require('../models/Product');
const Warranty = require('../models/Warranty');

// Configurar banco de dados de teste
beforeAll(async () => {
  // Usar uma conexão de banco de dados separada para testes
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/etherna_joias_test';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Limpar o banco de dados após os testes
afterAll(async () => {
  await User.deleteMany({});
  await Client.deleteMany({});
  await Product.deleteMany({});
  await Warranty.deleteMany({});
  await mongoose.connection.close();
});

// Dados para testes
let adminUser;
let adminToken;
let regularUser;
let regularToken;
let testClient;
let testProduct;

// Configurar dados de teste antes de cada teste
beforeEach(async () => {
  // Limpar coleções
  await User.deleteMany({});
  await Client.deleteMany({});
  await Product.deleteMany({});
  await Warranty.deleteMany({});

  // Criar usuário administrador
  adminUser = await User.create({
    name: 'Admin Teste',
    email: 'admin@exemplo.com',
    password: 'senha123',
    role: 'admin'
  });

  adminToken = generateToken(adminUser._id);

  // Criar usuário regular
  regularUser = await User.create({
    name: 'Usuário Regular',
    email: 'usuario@exemplo.com',
    password: 'senha123',
    role: 'user'
  });

  regularToken = generateToken(regularUser._id);

  // Criar cliente de teste
  testClient = await Client.create({
    name: 'Cliente Teste',
    email: 'cliente@exemplo.com',
    whatsapp: '11999999999',
    address: 'Rua Teste, 123'
  });

  // Criar produto de teste
  testProduct = await Product.create({
    name: 'Produto Teste',
    code: 'TEST001',
    type: 'semi-joia',
    description: 'Produto para testes',
    price: 199.99,
    image: 'test-image.jpg'
  });

  // Criar algumas garantias para teste
  await Warranty.create({
    client: testClient._id,
    product: testProduct._id,
    saleDate: new Date(),
    warrantyEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
    price: 199.99,
    createdBy: adminUser._id
  });

  await Warranty.create({
    client: testClient._id,
    product: testProduct._id,
    saleDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    warrantyEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
    price: 299.99,
    createdBy: adminUser._id
  });
});

describe('Analytics Controller', () => {
  // Teste de obtenção de dados para dashboard
  describe('GET /api/analytics/dashboard', () => {
    it('deve obter dados de análise para o dashboard (admin)', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveProperty('salesData');
      expect(response.body.data).toHaveProperty('productData');
      expect(response.body.data).toHaveProperty('clientData');
      expect(response.body.data).toHaveProperty('warrantyData');
      expect(response.body.data).toHaveProperty('typeData');
      expect(response.body.data).toHaveProperty('totalSales');
      expect(response.body.data).toHaveProperty('totalCount');
      
      // Verificar dados específicos
      expect(response.body.data.totalCount).toBe(2);
      expect(response.body.data.totalSales).toBe(499.98); // 199.99 + 299.99
    });

    it('deve retornar erro para usuário não administrador', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('deve retornar erro sem autenticação', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  // Teste de geração de insights com IA
  describe('POST /api/analytics/insights', () => {
    it('deve gerar insights com IA (admin)', async () => {
      const response = await request(app)
        .post('/api/analytics/insights')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ timeframe: 'all' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveProperty('insights');
      expect(response.body.data).toHaveProperty('analyticsData');
      
      // Verificar que os insights contêm informações relevantes
      expect(response.body.data.insights).toContain('Análise de Desempenho');
      expect(response.body.data.insights).toContain('Resumo de Vendas');
      expect(response.body.data.insights).toContain('Recomendações');
    });

    it('deve retornar erro para usuário não administrador', async () => {
      const response = await request(app)
        .post('/api/analytics/insights')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ timeframe: 'all' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('deve retornar erro sem autenticação', async () => {
      const response = await request(app)
        .post('/api/analytics/insights')
        .send({ timeframe: 'all' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});

// Função auxiliar para gerar token JWT
const jwt = require('jsonwebtoken');
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'etherna_secret_key', {
    expiresIn: '30d'
  });
};
