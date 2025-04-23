const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const fs = require('fs');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

// Inicializar o app Express
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Habilitar CORS
app.use(cors());

// Criar diretórios de upload se não existirem
const uploadsDir = path.join(__dirname, 'uploads');
const productsDir = path.join(uploadsDir, 'products');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Definir rotas
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/warranties', require('./routes/warrantyRoutes'));
app.use('/api/email', require('./routes/emailRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Rota para verificar se a API está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API Etherna Joias está funcionando!' });
});

// Manipulador de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Erro no servidor'
  });
});

// Definir porta
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
