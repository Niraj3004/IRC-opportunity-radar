import User from '../models/User';
import { hashString, compareHash } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateRandomToken } from '../utils/tokens';
import { getVerifyEmail, getResetPasswordEmail, getWelcomeEmail } from '../templates/emailTemplates';
import { sendEmail } from './email.service';
export const register = async (data: any) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashString(data.password);
  const verifyToken = generateRandomToken();

  const user = new User({
    name: data.name,
    email: data.email,
    passwordHash,
    verifyToken,
    status: 'pending', // Per requirements, they stay pending until admin approval
  });

  await user.save();

  // Send verify email
  await sendEmail(data.email, 'Verify Your Email', getVerifyEmail(verifyToken));

  return { message: 'Registration successful. Please check your email to verify your account.' };
};

export const login = async (data: any) => {
  const user = await User.findOne({ email: data.email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await compareHash(data.password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  if (!user.emailVerified) {
    throw new Error('Please verify your email before logging in');
  }

  const payload = { id: user._id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    accessToken,
    refreshToken,
  };
};

export const verifyEmail = async (token: string) => {
  const user = await User.findOne({ verifyToken: token });
  if (!user) {
    throw new Error('Invalid or expired token');
  }

  user.emailVerified = true;
  user.verifyToken = undefined;
  await user.save();

  // Send welcome email upon successful verification
  await sendEmail(user.email, 'Welcome to Opportunity Radar!', getWelcomeEmail(user.name));

  return { message: 'Email verified successfully. You may now login.' };
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) return { message: 'If the email exists, a reset link has been sent.' };

  const resetToken = generateRandomToken();
  user.resetToken = resetToken;
  await user.save();

  // Send reset email
  await sendEmail(email, 'Password Reset', getResetPasswordEmail(resetToken));

  return { message: 'If the email exists, a reset link has been sent.' };
};

export const resetPassword = async (data: any) => {
  const user = await User.findOne({ resetToken: data.token });
  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  user.passwordHash = await hashString(data.newPassword);
  user.resetToken = undefined;
  await user.save();

  return { message: 'Password reset successfully' };
};

export const refresh = async (refreshToken: string) => {
  const decoded: any = verifyRefreshToken(refreshToken);
  
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new Error('Invalid refresh token');
  }

  const payload = { id: user._id, role: user.role };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const getMe = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash -refreshToken -resetToken -verifyToken');
  if (!user) throw new Error('User not found');
  return user;
};

export const logout = async (userId: string) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }
  return { message: 'Logged out successfully' };
};
