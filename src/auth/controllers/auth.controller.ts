import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('register')
  async register(@Body() registerDto: AuthDto) {
    return this.authService.register(registerDto);
  }


  @Post('login')
  async login(@Body() loginDto: AuthDto) {
    return this.authService.login(loginDto);
  }

  
  @Get('info')
  async info() {
    return this.authService.tableInfo();
  }

  @Post('delete')
  async del() {
    return this.authService.deletePlayers();
  }
}
