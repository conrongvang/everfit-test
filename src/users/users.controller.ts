import { Body, Controller, Get, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserEntity } from "../database/entities/user.entity";
import { UsersDbService } from "../database/providers/user-db.service";
import { CreateUserDto } from "./dto/create-user.dto";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersDbService: UsersDbService) {}

  @Post()
  @ApiOperation({
    summary: "Create new user",
    description: "Create a new user with name",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "User created successfully",
    type: UserEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data",
  })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return await this.usersDbService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get all users",
    description: "Retrieve all users from the database",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Users retrieved successfully",
    type: [UserEntity],
  })
  async getAllUsers(): Promise<UserEntity[]> {
    return await this.usersDbService.findAll();
  }
}
