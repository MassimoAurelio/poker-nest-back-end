import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RoomDto } from '../dto/room.dto';
import { RoomRepository } from '../repositories/room.repository';
@Injectable()
export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  async roomInfo(roomId: string) {
    const allUsers = await this.roomRepository.findUsersInRoom(roomId);
    return allUsers;
  }

  async createRoom(roomDto: RoomDto) {
    const { name, password } = roomDto;
    const existingRoom =
      await this.roomRepository.findRoomByNameFromDatabase(name);

    if (existingRoom) {
      throw new Error('A room with that name already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newRoom = await this.roomRepository.createRoomInDatabase(
      name,
      hashedPassword,
    );
    return newRoom;
  }

  async enterRoom(roomDto: RoomDto) {
    const { name, password } = roomDto;
    const room = await this.roomRepository.findRoomByNameFromDatabase(name);
    if (!room) {
      throw new Error('A room with that name not found');
    }

    const isPasswordValid = await bcrypt.compare(password, room.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password for the room');
    }
    return room;
  }
}
