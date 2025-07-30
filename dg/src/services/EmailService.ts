/**
 * Serviço para envio de emails usando o Brevo (Sendinblue)
 */
class EmailService {
  private apiKey = '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';
  private apiUrl = 'https://api.brevo.com/v3/smtp/email';

  /**
   * Envia um email para o endereço especificado
   * @param to Email destinatário
   * @param subject Assunto do email
   * @param htmlContent Conteúdo HTML do email
   * @param recipientName Nome do destinatário (opcional)
   * @returns Promise com o resultado do envio
   */
  async sendEmail(to: string, subject: string, htmlContent: string, recipientName?: string) {
    try {
      console.log(`Enviando email para ${to}: ${subject}`);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: "Atendimento",
            email: "ivansantos.ivn@gmail.com"
          },
          to: [
            {
              email: 'ivansantos.ivn@gmail.com',
              name: recipientName || "Usuário"
            }
          ],
          subject: subject,
          htmlContent: htmlContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na resposta da API Brevo:', errorData);
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Email enviado com sucesso: ${result.messageId || 'ID não disponível'}`);
      
      return {
        success: true,
        messageId: result.messageId || 'ID não disponível'
      };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return {
        success: false,
        error: error
      };
    }
  }

  /**
   * Envia um código de verificação por email
   * @param to Email destinatário
   * @param code Código de verificação
   * @param recipientName Nome do destinatário (opcional)
   * @returns Promise com o resultado do envio
   */
  async sendVerificationCode(to: string, code: string, recipientName?: string) {
    const subject = "Código de Confirmação - Doce Gestão";
    const htmlContent = `
      ${code}
    `;
    
    return this.sendEmail(to, subject, htmlContent, recipientName);
  }
}

export const emailService = new EmailService(); 