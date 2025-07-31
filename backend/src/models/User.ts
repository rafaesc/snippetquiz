import { Model } from 'objection';
import knex from '../db';

// Bind the model to the knex instance
Model.knex(knex);

export interface UserData {
  id?: number;
  external_id: string;
  name: string;
  email: string;
  created_date?: Date;
}

export class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  external_id!: string;
  name!: string;
  email!: string;
  created_date!: Date;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['external_id', 'name', 'email'],
      properties: {
        id: { type: 'integer' },
        external_id: { type: 'string', minLength: 1, maxLength: 255 },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: 'string', format: 'email', maxLength: 255 },
        created_date: { type: 'string', format: 'date-time' }
      }
    };
  }

  // Static methods for common operations
  static async findByEmail(email: string): Promise<User | undefined> {
    return this.query().findOne({ email });
  }

  static async findByExternalId(external_id: string): Promise<User | undefined> {
    return this.query().findOne({ external_id });
  }

  static async createUser(userData: Omit<UserData, 'id' | 'created_date'>): Promise<User> {
    return this.query().insert(userData);
  }

  static async updateUser(id: number, userData: Partial<UserData>): Promise<User> {
    return this.query().patchAndFetchById(id, userData);
  }

  static async deleteUser(id: number): Promise<number> {
    return this.query().deleteById(id);
  }

  // Instance methods
  async updateProfile(data: Partial<Pick<UserData, 'name' | 'email'>>): Promise<User> {
    return (await this.$query().patchAndFetch(data)) as User;
  }
}

export default User;