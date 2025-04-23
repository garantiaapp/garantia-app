const emailService = require('../email_system/emailService');
const nodemailer = require('nodemailer');

// Mock do nodemailer
jest.mock('nodemailer');

describe('Email Service', () => {
  let mockSendMail;
  let mockVerify;

  beforeEach(() => {
    // Configurar mocks
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
    mockVerify = jest.fn().mockResolvedValue(true);
    
    // Mock do transporter
    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail,
      verify: mockVerify
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyConnection', () => {
    it('deve retornar sucesso quando a conexão for verificada', async () => {
      const result = await emailService.verifyConnection();
      
      expect(mockVerify).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('deve retornar erro quando a verificação falhar', async () => {
      const errorMessage = 'Erro de conexão';
      mockVerify.mockRejectedValue(new Error(errorMessage));
      
      const result = await emailService.verifyConnection();
      
      expect(mockVerify).toHaveBeenCalled();
      expect(result).toEqual({ success: false, error: errorMessage });
    });
  });

  describe('sendWarrantyConfirmation', () => {
    it('deve enviar email de confirmação de garantia com sucesso', async () => {
      const clientEmail = 'cliente@exemplo.com';
      const clientName = 'Cliente Teste';
      const product = {
        name: 'Produto Teste',
        code: 'TEST001',
        price: 199.99
      };
      const saleDate = new Date();
      const warrantyEndDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
      const productImage = '/path/to/image.jpg';
      
      const result = await emailService.sendWarrantyConfirmation(
        clientEmail,
        clientName,
        product,
        saleDate,
        warrantyEndDate,
        productImage
      );
      
      expect(mockSendMail).toHaveBeenCalled();
      expect(mockSendMail.mock.calls[0][0]).toHaveProperty('to', clientEmail);
      expect(mockSendMail.mock.calls[0][0]).toHaveProperty('subject', 'Confirmação de Garantia - Etherna Joias');
      expect(mockSendMail.mock.calls[0][0]).toHaveProperty('html');
      expect(mockSendMail.mock.calls[0][0]).toHaveProperty('attachments');
      expect(result).toEqual({ success: true, messageId: 'test-message-id' });
    });

    it('deve retornar erro quando o envio falhar', async () => {
      const errorMessage = 'Erro ao enviar email';
      mockSendMail.mockRejectedValue(new Error(errorMessage));
      
      const clientEmail = 'cliente@exemplo.com';
      const clientName = 'Cliente Teste';
      const product = {
        name: 'Produto Teste',
        code: 'TEST001',
        price: 199.99
      };
      const saleDate = new Date();
      const warrantyEndDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
      const productImage = '/path/to/image.jpg';
      
      const result = await emailService.sendWarrantyConfirmation(
        clientEmail,
        clientName,
        product,
        saleDate,
        warrantyEndDate,
        productImage
      );
      
      expect(mockSendMail).toHaveBeenCalled();
      expect(result).toEqual({ success: false, error: errorMessage });
    });
  });
});
