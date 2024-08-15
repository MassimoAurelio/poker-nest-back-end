import { IoAdapter } from '@nestjs/platform-socket.io';

export class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    options.cors = {
      origin: 'http://localhost:3000',
      methods: 'GET,POST,PUT,DELETE',
      allowedHeaders: 'Content-Type,Authorization',
      credentials: true,
    };
    return super.createIOServer(port, options);
  }
}
