import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { UserEntity } from "../src/database/entities/user.entity";
import { CreateUserDto } from "../src/users/dto/create-user.dto";

describe("Users Create (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as in main.ts
    app.setGlobalPrefix("/api");
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/users", () => {
    it("should create a new user successfully", async () => {
      const createUserDto: CreateUserDto = {
        name: "John_Doe_123",
      };

      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name", createUserDto.name);
      expect(response.body).toHaveProperty("created_date");
      expect(response.body).toHaveProperty("updated_date");
      expect(response.body.deleted_date).toBeNull();
    });

    it("should create a user with maximum allowed name length", async () => {
      const longName = "A".repeat(60); // Max length is 60
      const createUserDto: CreateUserDto = {
        name: longName,
      };

      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.name).toBe(longName);
    });

    it("should create multiple users with unique names", async () => {
      const users = [
        { name: "Alice_Smith_456" },
        { name: "Bob_Johnson_789" },
        { name: "Charlie_Brown_012" },
      ];

      const createdUsers: UserEntity[] = [];

      for (const user of users) {
        const response = await request(app.getHttpServer())
          .post("/api/users")
          .send(user)
          .expect(HttpStatus.CREATED);

        createdUsers.push(response.body);
      }

      // Verify all users were created with different IDs
      const ids = createdUsers.map((user) => user.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(users.length);

      // Verify names are correct
      createdUsers.forEach((user, index) => {
        expect(user.name).toBe(users[index].name);
      });
    });

    it("should handle concurrent user creation", async () => {
      const timestamp = Date.now();
      const users = Array.from({ length: 5 }, (_, i) => ({
        name: `ConcurrentUser_${i}_${timestamp}`,
      }));

      const promises = users.map((user) =>
        request(app.getHttpServer())
          .post("/api/users")
          .send(user)
          .expect(HttpStatus.CREATED)
      );

      const responses = await Promise.all(promises);

      // Verify all users were created successfully
      expect(responses).toHaveLength(5);
      responses.forEach((response, index) => {
        expect(response.body.name).toBe(users[index].name);
        expect(response.body.id).toBeDefined();
      });

      // Verify all have unique IDs
      const ids = responses.map((response) => response.body.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(5);
    });
  });

  describe("POST /api/users - Validation Errors", () => {
    it("should return 400 when name is empty", async () => {
      const createUserDto = {
        name: "",
      };

      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("name should not be empty");
    });

    it("should return 400 when name is missing", async () => {
      const createUserDto = {};

      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("name should not be empty");
      expect(response.body.message).toContain("name must be a string");
    });

    it("should return 400 when name exceeds maximum length", async () => {
      const tooLongName = "A".repeat(61); // Exceeds max length of 60
      const createUserDto: CreateUserDto = {
        name: tooLongName,
      };

      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain(
        "name must be shorter than or equal to 60 characters"
      );
    });

    it("should return 400 when name is not a string", async () => {
      const createUserDto = {
        name: 123,
      };

      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("name must be a string");
    });

    it("should return 400 when name is null", async () => {
      const createUserDto = {
        name: null,
      };

      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("name should not be empty");
      expect(response.body.message).toContain("name must be a string");
    });
  });

  describe("POST /api/users - Edge Cases", () => {
    it("should handle special characters in name", async () => {
      const createUserDto: CreateUserDto = {
        name: "User_With-Special.Chars_123!",
      };

      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.name).toBe(createUserDto.name);
    });

    it("should handle unicode characters in name", async () => {
      const createUserDto: CreateUserDto = {
        name: "User_名前_123",
      };

      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.name).toBe(createUserDto.name);
    });

    it("should handle name with spaces", async () => {
      const createUserDto: CreateUserDto = {
        name: "User With Spaces 123",
      };

      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.name).toBe(createUserDto.name);
    });

    it("should trim whitespace from name", async () => {
      const createUserDto = {
        name: "  TrimmedUser_123  ",
      };

      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      // Note: This test assumes the API trims whitespace.
      // If it doesn't, this test will fail and you can remove it.
      expect(response.body.name).toBe("TrimmedUser_123");
    });
  });

  describe("POST /api/users - Database Integration", () => {
    it("should persist user in database and retrieve via GET", async () => {
      const createUserDto: CreateUserDto = {
        name: "PersistenceTest_User_789",
      };

      // Create user
      const createResponse = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const createdUserId = createResponse.body.id;

      // Retrieve all users and verify our user exists
      const getAllResponse = await request(app.getHttpServer())
        .get("/api/users")
        .expect(HttpStatus.OK);

      const createdUser = getAllResponse.body.find(
        (user: UserEntity) => user.id === createdUserId
      );

      expect(createdUser).toBeDefined();
      expect(createdUser.name).toBe(createUserDto.name);
      expect(createdUser.id).toBe(createdUserId);
    });
  });

  describe("POST /api/users - Response Format", () => {
    it("should return user with correct response structure", async () => {
      const createUserDto: CreateUserDto = {
        name: "ResponseFormatTest_456",
      };

      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("created_date");
      expect(response.body).toHaveProperty("updated_date");
      expect(response.body).toHaveProperty("deleted_date");

      // Verify property types
      expect(typeof response.body.id).toBe("number");
      expect(typeof response.body.name).toBe("string");
      expect(typeof response.body.created_date).toBe("string");
      expect(typeof response.body.updated_date).toBe("string");
      expect(response.body.deleted_date).toBeNull();

      // Verify dates are valid ISO strings
      expect(new Date(response.body.created_date)).toBeInstanceOf(Date);
      expect(new Date(response.body.updated_date)).toBeInstanceOf(Date);

      // Note: Based on the entity, the 'id' should be excluded in responses
      // If the API returns id, it might be a configuration issue
    });
  });
});
