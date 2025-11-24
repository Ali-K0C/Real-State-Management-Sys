import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LandlordGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = request.session?.userId;

    if (!userId) {
      throw new ForbiddenException('Not authenticated');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || (user.role !== 'LANDLORD' && user.role !== 'ADMIN')) {
      throw new ForbiddenException(
        'Access denied: Landlord privileges required',
      );
    }

    return true;
  }
}
