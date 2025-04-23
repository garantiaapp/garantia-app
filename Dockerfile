FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código-fonte
COPY . .

# Expor porta
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
