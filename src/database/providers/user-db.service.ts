import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { UserEntity } from "../entities/user.entity";

export interface IUsersRepository {
  create(createUserDto: any): Promise<any>;
  findAll(): Promise<UserEntity[]>;
  findOne(id: string): Promise<UserEntity | null>;
  remove(id: string): Promise<DeleteResult>;
}

@Injectable()
export class UsersDbService implements IUsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  async create(createUserDto: Partial<UserEntity>): Promise<UserEntity> {
    const ent = this.userRepository.create(createUserDto);
    return this.userRepository.save(ent);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.findBy({});
  }

  async findOne(name: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ name });
  }

  async remove(name: string): Promise<DeleteResult> {
    return this.userRepository.softDelete({ name });
  }
}
