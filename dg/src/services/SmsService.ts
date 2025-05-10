import twilio from 'twilio';

// Cliente Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Serviço para envio de SMS usando o Twilio
 */
class SmsService {
  /**
   * Envia um SMS para o número especificado
   * @param to Número de telefone destinatário (com código do país)
   * @param message Mensagem a ser enviada
   * @returns Promise com o resultado do envio
   */
  async sendSms(to: string, message: string) {
    try {
      // Garante que o número está formatado com código do país
      let formattedNumber = to;
      
      // Se não começa com +, adiciona +55 (Brasil)
      if (!formattedNumber.startsWith('+')) {
        // Remove todos os caracteres não numéricos
        formattedNumber = formattedNumber.replace(/\D/g, '');
        
        // Se já começa com 55, adiciona apenas o +
        if (formattedNumber.startsWith('55')) {
          formattedNumber = '+' + formattedNumber;
        } else {
          // Adiciona o código do Brasil +55
          formattedNumber = '+55' + formattedNumber;
        }
      }

      console.log(`Enviando SMS para ${formattedNumber}: ${message}`);

      // Envio do SMS
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: formattedNumber
      });

      console.log(`SMS enviado com sucesso: ${result.sid}`);
      return {
        success: true,
        messageId: result.sid
      };
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      return {
        success: false,
        error: error
      };
    }
  }

  /**
   * Envia um código de verificação por SMS
   * @param to Número de telefone destinatário
   * @param code Código de verificação
   * @returns Promise com o resultado do envio
   */
  async sendVerificationCode(to: string, code: string) {
    const message = `[Doce Gestão] Seu código pra validar é: ${code}. Válido por 5 minutos.`;
    return this.sendSms(to, message);
  }
}

export const smsService = new SmsService(); 