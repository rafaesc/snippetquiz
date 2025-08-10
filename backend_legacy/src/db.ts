import Knex from 'knex';
import { Model } from 'objection';
import config from '../knexfile';
const env = process.env.NODE_ENV || 'development';

const knex = Knex(config[env]);
Model.knex(knex);

export default knex;
