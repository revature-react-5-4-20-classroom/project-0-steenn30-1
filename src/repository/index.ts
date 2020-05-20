import {Pool} from 'pg';

export const connectionPool : Pool = new Pool({
    host: 'database-1.cg7hde7ryogb.us-east-2.rds.amazonaws.com',
    user: 'postgres',
    password: 'Nickster85',
    database: 'testProject0',
    port:5432,
    max:5 //max number of connections. check nodepostgres for how to get unlimited connections
});