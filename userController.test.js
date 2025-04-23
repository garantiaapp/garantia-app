const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

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
  await mongoose.connection.close();
});

// Limpar a coleção de usuários antes de cada teste
beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Controller', () => {
  // Teste de registro de usuário
  describe('POST /api/users/register', () => {
    it('deve registrar um novo usuário', async () => {
      const userData = {
        name: 'Usuário Teste',
        email: 'teste@exemplo.com',
        password: 'senha123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.email).toBe(userData.email);
    });

    it('deve retornar erro ao tentar registrar um usuário com email já existente', async () => {
      // Criar um usuário primeiro
      await User.create({
        name: 'Usuário Existente',
        email: 'existente@exemplo.com',
        password: 'senha123'
      });

      // Tentar criar outro usuário com o mesmo email
      const userData = {
        name: 'Outro Usuário',
        email: 'existente@exemplo.com',
        password: 'outrasenha'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  // Teste de login de usuário
  describe('POST /api/users/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Criar um usuário para testar o login
      const userData = {
        name: 'Usuário Login',
        email: 'login@exemplo.com',
        password: 'senha123'
      };

      await User.create(userData);

      const loginData = {
        email: userData.email,
        password: userData.password
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.email).toBe(userData.email);
    });

    it('deve retornar erro ao tentar fazer login com credenciais inválidas', async () => {
      const loginData = {
        email: 'naoexiste@exemplo.com',
        password: 'senhaerrada'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  // Teste de obtenção do perfil do usuário
  describe('GET /api/users/profile', () => {
    it('deve obter o perfil do usuário autenticado', async () => {
      // Criar um usuário e obter token
      const user = await User.create({
        name: 'Usuário Perfil',
        email: 'perfil@exemplo.com',
        password: 'senha123'
      });

      const token = generateToken(user._id);

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(user.name);
      expect(response.body.data.email).toBe(user.email);
    });

    it('deve retornar erro ao tentar acessar perfil sem autenticação', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});

// Função auxiliar para gerar token JWT (copiar do userController.js)
const jwt = require('jsonwebtoken');
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'etherna_secret_key', {
    expiresIn: '30d'
  });
};
