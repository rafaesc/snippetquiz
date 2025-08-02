export interface EmailTemplateData {
  name: string;
  verificationUrl: string;
  expiresIn: string;
}

export const getVerificationEmailTemplate = (data: EmailTemplateData): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to QuizMaster!</h2>
      <p>Hi ${data.name},</p>
      <p>Thank you for registering with QuizMaster. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.verificationUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #007bff;">${data.verificationUrl}</p>
      <p>This verification link will expire in ${data.expiresIn}.</p>
      <p>If you didn't create an account with QuizMaster, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">QuizMaster Team</p>
    </div>
  `;
};

export const getResendVerificationEmailTemplate = (data: EmailTemplateData): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Hi ${data.name},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.verificationUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #007bff;">${data.verificationUrl}</p>
      <p>This verification link will expire in ${data.expiresIn}.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">QuizMaster Team</p>
    </div>
  `;
};