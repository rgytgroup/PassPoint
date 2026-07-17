import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

/**
 * Como SupabaseAuthGuard pero NO bloquea: si hay un token válido, adjunta
 * req.user; si no, deja pasar con req.user = undefined. Útil para endpoints
 * públicos que aplican freemium según el usuario (SPEC §5).
 */
@Injectable()
export class OptionalSupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers['authorization'];
    if (!header?.startsWith('Bearer ')) return true;

    const url = this.config.get<string>('SUPABASE_URL');
    const apikey = this.config.get<string>('SUPABASE_ANON_KEY');
    if (!url || !apikey) return true;

    try {
      const res = await fetch(`${url}/auth/v1/user`, {
        headers: {
          Authorization: header,
          apikey,
        },
      });
      if (res.ok) {
        const supaUser = (await res.json()) as { email?: string };
        if (supaUser.email) {
          req.user = await this.users.findOrCreate(supaUser.email);
        }
      }
    } catch {
      // Silencioso: si falla la validación, sigue como anónimo.
    }
    return true;
  }
}
