import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async signToken(payload: any) {
    return this.jwtService.sign(payload);
  }
}
