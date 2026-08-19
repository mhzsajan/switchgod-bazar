import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const currentUser = request?.user
      ? this.authService.findById(request.user.id)
      : null;
    const isSuperAdmin = (currentUser?.permissions || []).some(
      (permission: any) => permission?.name === 'super_admin',
    );
    if (!isSuperAdmin) {
      throw new ForbiddenException('Not enough permission');
    }
    return true;
  }
}