import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MailService } from 'src/mail/mail.service';
import {
  AuthResponse,
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  CoreResponse,
  RegisterDto,
  ResetPasswordDto,
  VerifyForgetPasswordDto,
  SocialLoginDto,
  OtpLoginDto,
  OtpResponse,
  VerifyOtpDto,
  OtpDto,
} from './dto/create-auth.dto';
import { plainToClass } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import usersJson from '@db/users.json';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const users = plainToClass(User, usersJson);

interface PasswordReset {
  email: string;
  token: string;
  expiresAt: number;
}

interface EmailVerification {
  email: string;
  token: string;
  expiresAt: number;
}

const RESET_TTL_MS = 30 * 60 * 1000;
const VERIFY_TTL_MS = 30 * 60 * 1000;

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function resetsFile(): string {
  return path.join(process.cwd(), 'src', 'db', 'pickbazar', 'password-resets.json');
}

function verificationsFile(): string {
  return path.join(
    process.cwd(),
    'src',
    'db',
    'pickbazar',
    'email-verifications.json',
  );
}

function loadResets(): PasswordReset[] {
  try {
    if (!fs.existsSync(resetsFile())) return [];
    return JSON.parse(fs.readFileSync(resetsFile(), 'utf8'));
  } catch {
    return [];
  }
}

function loadVerifications(): EmailVerification[] {
  try {
    if (!fs.existsSync(verificationsFile())) return [];
    return JSON.parse(fs.readFileSync(verificationsFile(), 'utf8'));
  } catch {
    return [];
  }
}

@Injectable()
export class AuthService {
  private users: User[] = users;
  private resets: PasswordReset[] = loadResets();
  private verifications: EmailVerification[] = loadVerifications();

  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }

  private saveResets() {
    const data = JSON.stringify(this.resets, null, 2);
    fs.writeFileSync(resetsFile(), data);
    const distFile = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'password-resets.json');
    fs.mkdirSync(path.dirname(distFile), { recursive: true });
    fs.mkdirSync(path.dirname(distFile), { recursive: true });

    fs.writeFileSync(distFile, data);
  }

  private saveVerifications() {
    const data = JSON.stringify(this.verifications, null, 2);
    fs.writeFileSync(verificationsFile(), data);
    const distFile = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'email-verifications.json',
    );
    fs.mkdirSync(path.dirname(distFile), { recursive: true });
    fs.mkdirSync(path.dirname(distFile), { recursive: true });

    fs.writeFileSync(distFile, data);
  }

  private saveUsers() {
    const data = JSON.stringify(this.users, null, 2);
    fs.writeFileSync(path.join(process.cwd(), 'src', 'db', 'pickbazar', 'users.json'), data);
    const distFile = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'users.json');
    fs.mkdirSync(path.dirname(distFile), { recursive: true });
    fs.mkdirSync(path.dirname(distFile), { recursive: true });

    fs.writeFileSync(distFile, data);
  }

  findById(id: number): User | undefined {
    return this.users.find((u) => u.id === Number(id));
  }

  async register(createUserInput: RegisterDto): Promise<AuthResponse> {
    const existing = this.users.find(
      (u) => u.email === createUserInput.email,
    );
    if (existing) {
      throw new BadRequestException('Account with this email already exists');
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(createUserInput.password, salt);

    const maxId =
      this.users.length > 0
        ? Math.max(...this.users.map((u) => u.id))
        : 0;

    const isAdmin = adminEmails().includes(createUserInput.email.toLowerCase());
    const permissionNames = isAdmin
      ? ['super_admin', 'customer']
      : ['customer'];

    const user: any = {
      id: maxId + 1,
      name: createUserInput.name,
      email: createUserInput.email,
      password: hashedPassword,
      is_active: 1,
      email_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
      permissions: permissionNames.map((name) => ({
        id: name === 'super_admin' ? 1 : 2,
        name,
        guard_name: 'api',
      })),
      profile: {
        id: maxId + 1,
        avatar: null,
        bio: null,
        socials: null,
        contact: null,
        notifications: null,
        customer_id: maxId + 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      wallet: null,
      address: [],
    };

    this.users.push(user);
    this.saveUsers();

    const verificationCode = this.issueVerificationCode(user.email);

    const sent = await this.mailService.sendEmailVerificationEmail(
      user.email,
      verificationCode,
    );

    const token = this.generateToken(user);
    return {
      token,
      permissions: permissionNames,
      verificationMessage: sent
        ? 'Verification code sent to your email'
        : 'Verification code generated (email not configured)',
    };
  }

  private issueVerificationCode(email: string): string {
    const token = crypto.randomInt(100000, 999999).toString();
    this.verifications = this.verifications.filter((v) => v.email !== email);
    this.verifications.push({
      email,
      token,
      expiresAt: Date.now() + VERIFY_TTL_MS,
    });
    this.saveVerifications();
    return token;
  }

  async resendVerificationEmail(email: string): Promise<CoreResponse> {
    const user = this.users.find((u) => u.email === email);
    if (!user) {
      throw new BadRequestException('No account found with this email');
    }
    const userAny = user as any;
    if (userAny.email_verified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationCode = this.issueVerificationCode(email);
    const sent = await this.mailService.sendEmailVerificationEmail(
      email,
      verificationCode,
    );

    return {
      success: true,
      message: sent
        ? 'Verification code sent to your email'
        : 'Verification code generated (email not configured)',
    };
  }

  async verifyEmail(email: string, code: string): Promise<CoreResponse> {
    const verification = this.verifications.find(
      (v) => v.email === email && v.token === code,
    );
    if (!verification) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    if (Date.now() > verification.expiresAt) {
      this.verifications = this.verifications.filter(
        (v) => v.token !== verification.token,
      );
      this.saveVerifications();
      throw new BadRequestException(
        'Code has expired. Please request a new one',
      );
    }

    const user: any = this.users.find((u: any) => u.email === email);
    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    user.email_verified = true;
    user.updated_at = new Date();
    this.saveUsers();

    this.verifications = this.verifications.filter(
      (v) => v.token !== verification.token,
    );
    this.saveVerifications();

    await this.mailService.sendWelcomeEmail(user.email, user.name);

    return {
      success: true,
      message: 'Email verified successfully. You can now use your account.',
    };
  }

  async login(loginInput: LoginDto): Promise<AuthResponse> {
    const user = this.users.find((u) => u.email === loginInput.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userAny = user as any;
    if (!userAny.password) {
      throw new UnauthorizedException(
        'Account has no password set. Please use forgot password.',
      );
    }

    const isPasswordValid = bcrypt.compareSync(
      loginInput.password,
      userAny.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const permissionNames = (userAny.permissions || []).map((p: any) =>
      typeof p === 'string' ? p : p.name,
    );

    const token = this.generateToken(user);
    return {
      token,
      permissions: permissionNames,
      role: permissionNames.includes('super_admin')
        ? 'super_admin'
        : permissionNames.includes('store_owner')
          ? 'store_owner'
          : 'customer',
    };
  }

  async changePassword(
    changePasswordInput: ChangePasswordDto,
  ): Promise<CoreResponse> {
    const { oldPassword, newPassword, email } = changePasswordInput as any;
    const user: any = this.users.find((u: any) => u.email === email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.password || !bcrypt.compareSync(oldPassword, user.password)) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    user.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
    user.updated_at = new Date();
    this.saveUsers();
    return {
      success: true,
      message: 'Password change successful',
    };
  }

  async forgetPassword(
    forgetPasswordInput: ForgetPasswordDto,
  ): Promise<CoreResponse> {
    const user = this.users.find((u) => u.email === forgetPasswordInput.email);
    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    const token = crypto.randomInt(100000, 999999).toString();
    this.resets = this.resets.filter((r) => r.email !== user.email);
    this.resets.push({
      email: user.email,
      token,
      expiresAt: Date.now() + RESET_TTL_MS,
    });
    this.saveResets();

    const sent = await this.mailService.sendPasswordResetEmail(
      user.email,
      token,
    );

    return {
      success: true,
      message: sent
        ? 'Password reset code sent to your email'
        : 'Password reset code generated (email not configured)',
    };
  }

  async verifyForgetPasswordToken(
    verifyForgetPasswordTokenInput: VerifyForgetPasswordDto,
  ): Promise<CoreResponse> {
    const reset = this.resets.find(
      (r) =>
        r.email === verifyForgetPasswordTokenInput.email &&
        r.token === verifyForgetPasswordTokenInput.token,
    );
    if (!reset) {
      throw new BadRequestException('Invalid or expired code');
    }
    if (Date.now() > reset.expiresAt) {
      this.resets = this.resets.filter((r) => r.token !== reset.token);
      this.saveResets();
      throw new BadRequestException('Code has expired. Please request a new one');
    }
    return {
      success: true,
      message: 'Code verified',
    };
  }

  async resetPassword(
    resetPasswordInput: ResetPasswordDto,
  ): Promise<CoreResponse> {
    const reset = this.resets.find(
      (r) =>
        r.email === resetPasswordInput.email &&
        r.token === resetPasswordInput.token,
    );
    if (!reset) {
      throw new BadRequestException('Invalid or expired code');
    }
    if (Date.now() > reset.expiresAt) {
      this.resets = this.resets.filter((r) => r.token !== reset.token);
      this.saveResets();
      throw new BadRequestException('Code has expired. Please request a new one');
    }

    const user: any = this.users.find((u: any) => u.email === reset.email);
    if (!user) {
      throw new BadRequestException('No account found with this email');
    }
    user.password = bcrypt.hashSync(
      resetPasswordInput.password,
      bcrypt.genSaltSync(10),
    );
    user.updated_at = new Date();
    this.saveUsers();

    this.resets = this.resets.filter((r) => r.token !== reset.token);
    this.saveResets();

    return {
      success: true,
      message: 'Password reset successful. You can now log in',
    };
  }

  async socialLogin(socialLoginDto: SocialLoginDto): Promise<AuthResponse> {
    const { provider, access_token } = socialLoginDto;
    if (provider === 'google') {
      return this.googleLogin(access_token);
    }
    throw new BadRequestException(`Unsupported provider: ${provider}`);
  }

  private async googleLogin(accessToken: string): Promise<AuthResponse> {
    if (!accessToken) {
      throw new UnauthorizedException('Missing Google access token');
    }

    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(accessToken)}`,
    );
    if (!res.ok) {
      throw new UnauthorizedException('Invalid Google access token');
    }
    const info: any = await res.json();
    if (!info?.email) {
      throw new UnauthorizedException('Could not retrieve Google profile');
    }

    const expectedAud = process.env.GOOGLE_CLIENT_ID;
    if (expectedAud && info.aud && info.aud !== expectedAud) {
      throw new UnauthorizedException(
        'Token was not issued for this application',
      );
    }

    const email = info.email.toLowerCase();
    const isAdmin = adminEmails().includes(email);
    const permissionNames = isAdmin
      ? ['super_admin', 'customer']
      : ['customer'];

    let user: any = this.users.find(
      (u: any) => u.email.toLowerCase() === email,
    );
    let justVerified = false;

    if (!user) {
      const maxId =
        this.users.length > 0
          ? Math.max(...this.users.map((u) => u.id))
          : 0;
      user = {
        id: maxId + 1,
        name: info.name || email.split('@')[0],
        email,
        password: null,
        is_active: 1,
        email_verified: !!info.email_verified,
        created_at: new Date(),
        updated_at: new Date(),
        permissions: permissionNames.map((name) => ({
          id: name === 'super_admin' ? 1 : 2,
          name,
          guard_name: 'api',
        })),
        profile: {
          id: maxId + 1,
          avatar: null,
          bio: null,
          socials: null,
          contact: null,
          notifications: null,
          customer_id: maxId + 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        wallet: null,
        address: [],
      };
      this.users.push(user);
      this.saveUsers();
      if (user.email_verified) {
        await this.mailService.sendWelcomeEmail(user.email, user.name);
      }
    } else {
      const existingNames = (user.permissions || []).map((p: any) =>
        typeof p === 'string' ? p : p.name,
      );
      const names =
        isAdmin && !existingNames.includes('super_admin')
          ? ['super_admin', ...existingNames]
          : existingNames;
      user.permissions = names.map((name: string) => ({
        id: name === 'super_admin' ? 1 : 2,
        name,
        guard_name: 'api',
      }));
      if (info.email_verified && user.email_verified === false) {
        user.email_verified = true;
        justVerified = true;
      }
      user.updated_at = new Date();
      this.saveUsers();
    }

    if (justVerified) {
      await this.mailService.sendWelcomeEmail(user.email, user.name);
    }

    const permissionNamesFinal = (user.permissions || []).map((p: any) =>
      typeof p === 'string' ? p : p.name,
    );

    if (user.email_verified === false) {
      throw new HttpException(
        'Email not verified. Please check your inbox for the verification code.',
        HttpStatus.CONFLICT,
      );
    }

    const token = this.generateToken(user);
    return {
      token,
      permissions: permissionNamesFinal,
      role: permissionNamesFinal.includes('super_admin')
        ? 'super_admin'
        : permissionNamesFinal.includes('store_owner')
          ? 'store_owner'
          : 'customer',
    };
  }

  async otpLogin(otpLoginDto: OtpLoginDto): Promise<AuthResponse> {
    console.log(otpLoginDto);
    return {
      token: 'jwt token',
      permissions: ['super_admin', 'customer'],
      role: 'customer',
    };
  }

  async verifyOtpCode(verifyOtpInput: VerifyOtpDto): Promise<CoreResponse> {
    console.log(verifyOtpInput);
    return { message: 'success', success: true };
  }

  async sendOtpCode(otpInput: OtpDto): Promise<OtpResponse> {
    console.log(otpInput);
    return {
      message: 'success',
      success: true,
      id: '1',
      provider: 'google',
      phone_number: '+919494949494',
      is_contact_exist: true,
    };
  }

  me(email?: string): User {
    if (email) {
      const user = this.users.find((u: any) => u.email === email);
      if (user) {
        if ((user as any).email_verified === false) {
          throw new HttpException(
            'Email not verified. Please check your inbox for the verification code.',
            HttpStatus.CONFLICT,
          );
        }
        return user;
      }
    }
    const admin = this.users.find((u: any) =>
      (u.permissions || []).some(
        (p: any) => (typeof p === 'string' ? p : p.name) === 'super_admin',
      ),
    );
    return admin || this.users[this.users.length - 1] || this.users[0];
  }

  private saveToFile() {
    this.saveUsers();
  }
}
