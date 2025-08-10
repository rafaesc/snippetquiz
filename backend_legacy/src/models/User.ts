import { Model, ModelOptions, QueryContext } from 'objection';
import knex from '../db';
import bcrypt from 'bcryptjs';

Model.knex(knex);

export interface UserData {
  id?: string;
  name: string;
  email: string;
  password?: string;
  password_updated_at?: Date;
  created_date?: Date;
  verified?: boolean;
}

export interface CreateUser {
  name: string;
  email: string;
  password: string;
}

export class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'id';
  }

  id!: string;
  name!: string;
  email!: string;
  password?: string;
  password_updated_at?: Date;
  created_date!: Date;
  verified!: boolean;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: 'string', format: 'email', maxLength: 255 },
        password: { type: 'string', minLength: 6, maxLength: 255 },
        password_updated_at: { type: 'string', format: 'date-time' },
        created_date: { type: 'string', format: 'date-time' },
        verified: { type: 'boolean' }
      }
    };
  }

  // Hide password from JSON serialization
  $formatJson(json: any) {
    json = super.$formatJson(json);
    delete json.password;
    return json;
  }

  // Hash password before insert/update
  async $beforeInsert(queryContext: QueryContext) {
    await super.$beforeInsert(queryContext);
    if (this.password) {
      this.password = await this.hashPassword(this.password);
      this.password_updated_at = new Date();
    }
  }

  async $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
    await super.$beforeUpdate(opt, queryContext);
    if (this.password) {
      this.password = await this.hashPassword(this.password);
      this.password_updated_at = new Date();
    }
  }

  // Password hashing method
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Password verification method
  async verifyPassword(password: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }
    return bcrypt.compare(password, this.password);
  }

  // Static methods for common operations
  static async findByEmail(email: string): Promise<User | undefined> {
    return this.query().findOne({ email });
  }

  static async createUser(userData: Omit<UserData, 'id' | 'created_date'>): Promise<User> {
    return this.query().insert(userData);
  }

  static async updateUser(id: string, userData: Partial<UserData>): Promise<User> {
    return this.query().patchAndFetchById(id, userData);
  }

  static async deleteUser(id: string): Promise<number> {
    return this.query().deleteById(id);
  }

  static async verifyUser(id: string): Promise<User> {
    return this.query().patchAndFetchById(id, { 
      verified: true
    });
  }

  // Update password specifically
  static async updatePassword(id: string, newPassword: string): Promise<User> {
    return this.query().patchAndFetchById(id, { 
      password: newPassword // Will be hashed by $beforeUpdate
    });
  }

  static async findUserByEmail(email: string): Promise<User | undefined> {
    return this.query()
      .findOne({ email })
      .whereNotNull('password');
  }

  // Instance methods
  async updateProfile(data: Partial<Pick<UserData, 'name' | 'email'>>): Promise<User> {
    return (await this.$query().patchAndFetch(data)) as User;
  }

  async updatePassword(newPassword: string): Promise<User> {
    return (await this.$query().patchAndFetch({ password: newPassword })) as User;
  }
}

export default User;