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
});

describe('Warranty Controller', () => {
  // Teste de criação de garantia
  describe('POST /api/warranties', () => {
    it('deve criar uma nova garantia', async () => {
      const warrantyData = {
        clientId: testClient._id,
        productId: testProduct._id,
        saleDate: new Date().toISOString(),
        price: 199.99,
        invoiceNumber: 'INV001',
        notes: 'Observações de teste'
      };

      const response = await request(app)
        .post('/api/warranties')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(warrantyData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.client).toBe(testClient._id.toString());
      expect(response.body.data.product).toBe(testProduct._id.toString());
      
      // Verificar se a data de fim da garantia é calculada corretamente (2 anos)
      const saleDate = new Date(warrantyData.saleDate);
      const expectedEndDate = new Date(saleDate);
      expectedEndDate.setFullYear(expectedEndDate.getFullYear() + 2);
      
      const warrantyEndDate = new Date(response.body.data.warrantyEndDate);
      expect(warrantyEndDate.getFullYear()).toBe(expectedEndDate.getFullYear());
      expect(warrantyEndDate.getMonth()).toBe(expectedEndDate.getMonth());
      expect(warrantyEndDate.getDate()).toBe(expectedEndDate.getDate());
    });

    it('deve retornar erro ao tentar criar garantia sem autenticação', async () => {
      const warrantyData = {
        clientId: testClient._id,
        productId: testProduct._id,
        saleDate: new Date().toISOString(),
        price: 199.99
      };

      const response = await request(app)
        .post('/api/warranties')
        .send(warrantyData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  // Teste de obtenção de garantias
  describe('GET /api/warranties', () => {
    it('deve obter todas as garantias', async () => {
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

      const response = await request(app)
        .get('/api/warranties')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('deve retornar erro ao tentar obter garantias sem autenticação', async () => {
      const response = await request(app)
        .get('/api/warranties');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  // Teste de atualização de garantia
  describe('PUT /api/warranties/:id', () => {
    it('deve atualizar uma garantia existente', async () => {
      // Criar uma garantia para atualizar
      const warranty = await Warranty.create({
        client: testClient._id,
        product: testProduct._id,
        saleDate: new Date(),
        warrantyEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
        price: 199.99,
        createdBy: adminUser._id
      });

      const updateData = {
        price: 249.99,
        invoiceNumber: 'INV002',
        notes: 'Observações atualizadas'
      };

      const response = await request(app)
        .put(`/api/warranties/${warranty._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(updateData.price);
      expect(response.body.data.invoiceNumber).toBe(updateData.invoiceNumber);
      expect(response.body.data.notes).toBe(updateData.notes);
    });

    it('deve retornar erro ao tentar atualizar garantia inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        price: 249.99
      };

      const response = await request(app)
        .put(`/api/warranties/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  // Teste de exclusão de garantia
  describe('DELETE /api/warranties/:id', () => {
    it('deve excluir uma garantia existente', async () => {
      // Criar uma garantia para excluir
      const warranty = await Warranty.create({
        client: testClient._id,
        product: testProduct._id,
        saleDate: new Date(),
        warrantyEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
        price: 199.99,
        createdBy: adminUser._id
      });

      const response = await request(app)
        .delete(`/api/warranties/${warranty._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verificar se foi realmente excluída
      const deletedWarranty = await Warranty.findById(warranty._id);
      expect(deletedWarranty).toBeNull();
    });

    it('deve retornar erro ao tentar excluir garantia inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/warranties/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
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
