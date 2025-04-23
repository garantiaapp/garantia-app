# Etherna Joias - Sistema de Gestão de Garantia

Sistema completo para gestão de garantias de semi joias e produtos de prata da Etherna Joias, com período de garantia de 2 anos.

## Funcionalidades

- **Cadastro de Usuários**: Administradores e usuários comuns com diferentes níveis de acesso
- **Cadastro de Clientes**: Gerenciamento completo de clientes com nome, e-mail, WhatsApp e endereço
- **Cadastro de Produtos**: Gerenciamento de semi joias e prata com imagens, descrições e preços
- **Gestão de Garantias**: Registro de vendas com cálculo automático do período de garantia de 2 anos
- **Notificações por E-mail**: Envio automático de confirmações de garantia com imagens dos produtos
- **Relatórios com IA**: Análises avançadas e insights para tomada de decisões estratégicas
- **Interface Responsiva**: Funciona tanto em dispositivos desktop quanto mobile
- **Busca Avançada**: Localização rápida de clientes, produtos e garantias

## Tecnologias Utilizadas

### Backend
- Node.js / Express
- MongoDB
- JWT para autenticação
- Multer para upload de arquivos
- Nodemailer para envio de e-mails

### Frontend
- React
- React Bootstrap
- Axios
- React Router
- FontAwesome

### DevOps
- Docker / Docker Compose
- Jest para testes automatizados
- Supertest para testes de API

## Requisitos de Sistema

- Node.js 20 ou superior
- MongoDB 4.4 ou superior
- Servidor SMTP para envio de e-mails
- Docker e Docker Compose (para implantação)

## Instalação e Execução

### Usando Docker (Recomendado)

1. Clone o repositório:
   ```
   git clone https://github.com/etherna-joias/garantia-app.git
   cd garantia-app
   ```

2. Crie um arquivo `.env` baseado no `.env.example`:
   ```
   cp .env.example .env
   ```

3. Edite o arquivo `.env` com suas configurações

4. Execute com Docker Compose:
   ```
   docker-compose up -d
   ```

5. Acesse a aplicação em: http://localhost:5000

### Instalação Manual

1. Clone o repositório:
   ```
   git clone https://github.com/etherna-joias/garantia-app.git
   cd garantia-app
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Crie um arquivo `.env` baseado no `.env.example`

4. Inicie o servidor:
   ```
   npm start
   ```

5. Acesse a aplicação em: http://localhost:5000

## Estrutura do Projeto

```
etherna_joias_app/
├── backend/             # API e lógica de negócios
│   ├── config/          # Configurações
│   ├── controllers/     # Controladores da API
│   ├── middleware/      # Middlewares (auth, upload)
│   ├── models/          # Modelos de dados
│   ├── routes/          # Rotas da API
│   ├── tests/           # Testes automatizados
│   └── uploads/         # Arquivos enviados
├── email_system/        # Sistema de notificação por e-mail
│   └── templates/       # Templates HTML de e-mail
├── frontend/            # Interface de usuário
│   ├── public/          # Arquivos estáticos
│   └── src/             # Código-fonte React
│       ├── components/  # Componentes reutilizáveis
│       ├── pages/       # Páginas da aplicação
│       └── services/    # Serviços e API clients
├── docker-compose.yml   # Configuração Docker Compose
└── Dockerfile           # Configuração Docker
```

## Testes

Para executar os testes automatizados:

```
npm test
```

## Manutenção

- **Backup do Banco de Dados**: Configure backups automáticos do volume `mongo-data`
- **Logs**: Os logs da aplicação estão disponíveis via `docker-compose logs`
- **Atualizações**: Para atualizar, faça pull das alterações e reconstrua os containers

## Segurança

- Todas as senhas são armazenadas com hash bcrypt
- Autenticação via JWT com expiração configurável
- Rotas protegidas por middleware de autenticação
- Validação de entrada em todas as requisições

## Suporte

Para suporte técnico, entre em contato com:
- Email: suporte@ethernajoias.com
- WhatsApp: (XX) XXXXX-XXXX
