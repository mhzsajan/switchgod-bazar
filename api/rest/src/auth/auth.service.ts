import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
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

const RESET_TTL_MS = 30 * 60 * 1000;

function resetsFile(): string {
  return path.join(process.cwd(), 'src', 'db', 'pickbazar', 'password-resets.json');
}

function loadResets(): PasswordReset[] {
  try {
    if (!fs.existsSync(resetsFile())) return [];
    return JSON.parse(fs.readFileSync(resetsFile(), 'utf8'));
  } catch {
    return [];
  }
}

@Injectable()
export class AuthService {
  private users: User[] = users;
  private resets: PasswordReset[] = loadResets();

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
    fs.writeFileSync(distFile, data);
  }

  private saveUsers() {
    const data = JSON.stringify(this.users, null, 2);
    fs.writeFileSync(path.join(process.cwd(), 'src', 'db', 'pickbazar', 'users.json'), data);
    fs.writeFileSync(path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'users.json'), data);
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

    const user: any = {
      id: maxId + 1,
      name: createUserInput.name,
      email: createUserInput.email,
      password: hashedPassword,
      is_active: 1,
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
      permissions: [
        { id: 1, name: 'super_admin', guard_name: 'api' },
        { id: 2, name: 'customer', guard_name: 'api' },
      ],
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

    const token = this.generateToken(user);
    this.mailService.sendWelcomeEmail(user.email, user.name);
    return {
      token,
      permissions: ['super_admin', 'customer'],
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
    console.log(socialLoginDto);
    return {
      token: 'jwt token',
      permissions: ['super_admin', 'customer'],
      role: 'customer',
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
      if (user) return user;
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
