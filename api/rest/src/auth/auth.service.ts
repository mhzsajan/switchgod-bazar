import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
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

const users = plainToClass(User, usersJson);

@Injectable()
export class AuthService {
  private users: User[] = users;

  constructor(private jwtService: JwtService) {}

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }

  findById(id: number): User | undefined {
    return this.users.find((u) => u.id === Number(id));
  }

  async register(createUserInput: RegisterDto): Promise<AuthResponse> {
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
    this.saveToFile();

    const token = this.generateToken(user);
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
    this.saveToFile();
    return {
      success: true,
      message: 'Password change successful',
    };
  }

  async forgetPassword(
    forgetPasswordInput: ForgetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(forgetPasswordInput);
    return {
      success: true,
      message: 'Password reset email sent',
    };
  }

  async verifyForgetPasswordToken(
    verifyForgetPasswordTokenInput: VerifyForgetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(verifyForgetPasswordTokenInput);
    return {
      success: true,
      message: 'Token verified',
    };
  }

  async resetPassword(
    resetPasswordInput: ResetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(resetPasswordInput);
    return {
      success: true,
      message: 'Password reset successful',
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
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'users.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'users.json');
    const data = JSON.stringify(this.users, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.writeFileSync(distPath, data);
  }
}
