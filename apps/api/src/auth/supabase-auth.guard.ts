import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

/**
 * Valida el token de acceso de Supabase preguntando a /auth/v1/user
 * (funciona con cualquier algoritmo de firma). Si es válido, asegura el
 * usuario en nuestra DB y lo adjunta a req.user.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers['authorization'];
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token de acceso.');
    }
    const token = header.slice('Bearer '.length);

    const url = this.config.get<string>('SUPABASE_URL');
    const apikey = this.config.get<string>('SUPABASE_ANON_KEY');
    if (!url || !apikey) {
      throw new InternalServerErrorException(
        'Supabase no configurado (SUPABASE_URL / SUPABASE_ANON_KEY).',
      );
    }

    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey },
    });
    if (!res.ok) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    const supaUser = (await res.json()) as { email?: string };
    if (!supaUser.email) {
      throw new UnauthorizedException('El token no contiene email.');
    }

    req.user = await this.users.findOrCreate(supaUser.email);
    return true;
  }
}
