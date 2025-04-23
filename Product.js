const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, informe o nome do produto']
  },
  code: {
    type: String,
    required: [true, 'Por favor, informe o código do produto'],
    unique: true
  },
  type: {
    type: String,
    enum: ['semi-joia', 'prata'],
    required: [true, 'Por favor, informe o tipo do produto']
  },
  description: {
    type: String,
    required: [true, 'Por favor, informe a descrição do produto']
  },
  price: {
    type: Number,
    required: [true, 'Por favor, informe o preço do produto']
  },
  image: {
    type: String,
    required: [true, 'Por favor, adicione uma imagem do produto']
  },
  stock: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Atualizar a data de modificação antes de salvar
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
