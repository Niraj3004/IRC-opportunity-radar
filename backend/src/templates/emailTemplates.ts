export const getVerifyEmail = (token: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: auto;">
  <h2>Verify Your Email</h2>
  <p>Please use this token to verify your email:</p>
  <h3>${token}</h3>
</div>
`;

export const getResetPasswordEmail = (token: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: auto;">
  <h2>Reset Password</h2>
  <p>Please use this token to reset your password:</p>
  <h3>${token}</h3>
</div>
`;

export const getWelcomeEmail = (name: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: auto;">
  <h2>Welcome to Opportunity Radar, ${name}! 🚀</h2>
  <p>We are thrilled to have you on board.</p>
  <p>Our AI will now monitor thousands of sources to find Grants, Fellowships, and Jobs that perfectly match your interests.</p>
  <p>Make sure to update your profile with your specific interests so we can send you the best matches.</p>
  <p>Cheers,<br/>The Opportunity Radar Team</p>
</div>
`;

export const getMatchNotificationEmail = (name: string, opportunityTitle: string, url: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: auto;">
  <h2>Perfect Match Found! 🎉</h2>
  <p>Hi ${name},</p>
  <p>Our AI just found a new opportunity that highly matches your profile:</p>
  <h3>${opportunityTitle}</h3>
  <a href="${url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Opportunity</a>
  <p>Don't miss out on this one!</p>
</div>
`;

export const getDeadlineReminderEmail = (name: string, opportunityTitle: string, daysLeft: number, url: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: auto;">
  <h2>Deadline Approaching! ⏰</h2>
  <p>Hi ${name},</p>
  <p>This is a quick reminder that an opportunity you bookmarked is expiring in <strong>${daysLeft} days</strong>:</p>
  <h3>${opportunityTitle}</h3>
  <a href="${url}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Apply Now</a>
</div>
`;

export const getDailyDigestEmail = (name: string, count: number, opportunitiesHtml: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: auto;">
  <h2>Your Daily Digest 📬</h2>
  <p>Hi ${name},</p>
  <p>We found <strong>${count}</strong> new opportunities matching your interests today:</p>
  <ul style="list-style-type: none; padding: 0;">
    ${opportunitiesHtml}
  </ul>
  <p>Log in to your dashboard to see them all.</p>
</div>
`;
