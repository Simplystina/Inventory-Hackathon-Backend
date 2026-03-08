import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { AuthPayload, TokenPair, RegisterInput, LoginInput, AuthResult } from '../types';
import AppError from '../utils/AppError';


export const generateTokens = (payload: AuthPayload): TokenPair => {
    const accessOptions: SignOptions = {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn']) ?? '15m',
    };
    const refreshOptions: SignOptions = {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']) ?? '7d',
    };

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, accessOptions);
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, refreshOptions);

    return { accessToken, refreshToken };
};


export const registerUser = async (input: RegisterInput): Promise<AuthResult> => {
    const { name, email, password, role, phoneNumber, businessAddress } = input;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError('An account with this email already exists.', 409);

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ fullName: name, email, password: hashedPassword, role, phoneNumber, businessAddress });

    const payload: AuthPayload = {
        userId: (user._id as string).toString(),
        email: user.email,
        role: user.role,
    };

    const { accessToken, refreshToken } = generateTokens(payload);
    await User.findByIdAndUpdate(user._id, { refreshToken });

    return {
        user: { id: user._id, name: user.fullName, email: user.email, role: user.role },
        accessToken,
        refreshToken,
    };
};


export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
    const { email, password } = input;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) throw new AppError('Invalid email or password.', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Invalid email or password.', 401);

    const payload: AuthPayload = {
        userId: (user._id as string).toString(),
        email: user.email,
        role: user.role,
    };

    const { accessToken, refreshToken } = generateTokens(payload);
    await User.findByIdAndUpdate(user._id, { refreshToken });

    return {
        user: { id: user._id, name: user.fullName, email: user.email, role: user.role },
        accessToken,
        refreshToken
    };
};


export const refreshUserTokens = async (token: string): Promise<TokenPair> => {
    let decoded: AuthPayload;

    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as AuthPayload;
    } catch {
        throw new AppError('Invalid or expired refresh token.', 401);
    }

    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
        throw new AppError('Refresh token has been revoked.', 401);
    }

    const payload: AuthPayload = {
        userId: (user._id as string).toString(),
        email: user.email,
        role: user.role,
    };

    const tokens = generateTokens(payload);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return tokens;
};


export const getUserProfile = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    return {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        businessAddress: user.businessAddress,
        createdAt: user.createdAt,
    };
};


export const updateUserProfile = async (
    userId: string,
    input: { fullName?: string; phoneNumber?: string; businessAddress?: string }
) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: input },
        { new: true, runValidators: true }
    );
    if (!user) throw new AppError('User not found.', 404);

    return {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        businessAddress: user.businessAddress,
        createdAt: user.createdAt,
    };
};


export const logoutUser = async (userId: string): Promise<void> => {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
};