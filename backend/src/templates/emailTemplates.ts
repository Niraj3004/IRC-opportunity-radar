export const emailTemplates = {
  verifyEmail: (token: string) => `
    <h1>Welcome to Opportunity Radar</h1>
    <p>Please verify your email address by using this token or clicking the link below:</p>
    <p><strong>${token}</strong></p>
  `,
  resetPassword: (token: string) => `
    <h1>Password Reset</h1>
    <p>Use this token to reset your password:</p>
    <p><strong>${token}</strong></p>
  `,
};
