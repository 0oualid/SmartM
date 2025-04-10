
// Service d'email simulé pour environnement navigateur
// Dans une application réelle, vous utiliseriez une API ou un service externe

// Fonction pour simuler l'envoi d'un email
export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    console.log('====== EMAIL SIMULÉ ======');
    console.log(`À: ${to}`);
    console.log(`Sujet: ${subject}`);
    console.log('Contenu HTML:', html);
    console.log('========================');
    
    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la simulation d\'envoi d\'email:', error);
    return false;
  }
};

// Fonction pour envoyer un email de réinitialisation de mot de passe
export const sendPasswordResetEmail = async (to: string, resetToken: string): Promise<boolean> => {
  const baseUrl = window.location.origin;
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
      <p>
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Réinitialiser mon mot de passe
        </a>
      </p>
      <p>Ce lien est valable pendant 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
      <p>Merci,<br>L'équipe SmartM</p>
    </div>
  `;
  
  return await sendEmail(to, 'Réinitialisation de votre mot de passe', htmlContent);
};
