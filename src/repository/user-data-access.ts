import express, {Router, Request, Response} from 'express';
import { User } from '../models/user';
import { connectionPool } from '.';
import { PoolClient, QueryResult } from 'pg';

export async function findUserByUsernamePassword(username : string, password2 : string) : Promise<User>{
    let client : PoolClient;
    client = await connectionPool.connect();
    const Scrypt = require('scrypt-kdf');
    try{
       let result : QueryResult;
       let password : QueryResult = await client.query(`SELECT  usertable.password
                                    from usertable
                                    WHERE usertable.username= $1;`, [username]);
        let passwordToMatch = password.rows.map((p)=>{   
            return p.password;
        });

        let keyBuf : Buffer =Buffer.from(passwordToMatch[0]);

        let passToHash = await Scrypt.kdf(password2, { logN: 15 });
        let passHashedString = keyBuf.toString();

        let keyBuf3 : Buffer =Buffer.from(passToHash);
            
        let keyBuf2 = passwordToMatch[0];

        result = await client.query(`SELECT usertable.userid,usertable.username, usertable.password,usertable.firstname,usertable.lastname,usertable.email,usertable.roleid
                                    from usertable
                                    WHERE (usertable.username= $1 AND usertable.password=$2);`, [username, keyBuf3.toString()]);
        

        
        const usersMatchingUsernamePassword   = result.rows.map((u)=>{

                    return new User(u.userid, u.username, u.password, u.firstname, u.lastname, u.email, u.roleid);
            
        });
        let usersMatchingUsernamePassword2 :User[] = [new User(0,'','','','','',0)];
        console.log(keyBuf);
        console.log('');
        console.log('');
        console.log(password2);

        let ok = false;
        if(keyBuf.toString() == keyBuf3.toString()){
            ok = true;
        } else{
            throw new Error(`Hashes don't match`);
        }
        
        console.log(ok);
        if(ok){
            
            usersMatchingUsernamePassword2[0] = usersMatchingUsernamePassword[0];
        }

        if(usersMatchingUsernamePassword2.length > 0 && usersMatchingUsernamePassword.length > 0){
            // We assume username and password combo is unique
            
            return usersMatchingUsernamePassword2[0];
        }
        else{
            throw new Error('Username and Password not matched to a valid user');
        }
    } catch(e){
            throw new Error(`Failed to validate User with DB: ${e.message}`);
    } finally{
            client && client.release();
    }
}

export async function getUsersFM() : Promise<User[]>{

    let client : PoolClient;
    client = await connectionPool.connect();
    try{
       let result : QueryResult;
       
        result = await client.query("SELECT * FROM usertable");
        
        const usersList = result.rows.map((u)=>{
            return new User(u.userid, u.username, u.password, u.firstname, u.lastname, u.email, u.roleid);
        });
        return usersList;

    } catch(e){
            throw new Error(`Failed to validate User with DB: ${e.message}`)
    } finally{
            
            client && client.release();
    }
    
}

export async function getUsersById(userId : any) : Promise<User[]>{

    let client : PoolClient;
    client = await connectionPool.connect();
    try{
       let result : QueryResult;
       
        result = await client.query("SELECT * FROM usertable WHERE userid=$1", [userId]);
        
        const usersList = result.rows.map((u)=>{
            return new User(u.userid, u.username, u.password, u.firstname, u.lastname, u.email, u.roleid);
        });
        return usersList;

    } catch(e){
            throw new Error(`Failed to validate User with DB: ${e.message}`)
    } finally{
            
            client && client.release();
    }
    
}

export async function updateUser(userId:string, username : string, password : string, firstName:string, lastName : string, email:string, roleId : string): Promise<User>{
    const Scrypt = require('scrypt-kdf');
    let client : PoolClient;
    client = await connectionPool.connect();
    try{
        if(userId != undefined){
                if(username != undefined){
                    let updateUsername =  await client.query("UPDATE usertable SET username=$1 WHERE userid=$2", [username,userId]);
                }
                if(password != undefined){
                    let hashedPass : Buffer =Buffer.from(password);

                    hashedPass = await Scrypt.kdf(hashedPass, { logN: 15 });
                    console.log(hashedPass);
                    let hashedPassString = hashedPass.toString('base64');
                    let updatePassword = await client.query("UPDATE usertable SET password=$1 WHERE userid = $2", [hashedPassString,userId]);
                }
                if(firstName != undefined){
                    let updateFirstName = await client.query("UPDATE usertable SET firstname=$1 WHERE userid=$2", [firstName, userId]);
                    
                }
                if(lastName != undefined){
                    let updateLastName = await client.query("UPDATE usertable SET lastname=$1 WHERE userid=$2", [lastName,userId]);
                }
                if(email != undefined){
                    let updateEmail = await client.query("UPDATE usertable SET email=$1 WHERE userid=$2", [email,userId]);
                }
                if(roleId != undefined){
                    let updateRoleId = await client.query("UPDATE usertable SET roleid=$1 WHERE userid=$2", [roleId, userId]);
                }
     
        }
        let result : QueryResult;
       
        result = await client.query("SELECT * FROM usertable WHERE userid=$1", [userId]);
        
        const usersList = result.rows.map((u)=>{
            return new User(u.userid, u.username, u.password, u.firstname, u.lastname, u.email, u.roleid);
        });
        
        return usersList[0];
    } catch(e){
            throw new Error(`Failed to validate User with DB: ${e.message}`)
    } finally{
            
            client && client.release();
    }
}

export async function createUser(userToCreate : User){
    const Scrypt = require('scrypt-kdf');
    console.log(userToCreate);

    let client : PoolClient;
    client = await connectionPool.connect();

    let hashedPass : Buffer =Buffer.from(userToCreate.password);

    hashedPass = await Scrypt.kdf(hashedPass, { logN: 15 });
    console.log(hashedPass);
    let hashedPassString = hashedPass.toString('base64');
    console.log(hashedPassString);
    

    try{
        let result : QueryResult;
        result = await client.query('INSERT INTO usertable VALUES(DEFAULT,$1,$2,$3,$4,$5, $6)', [userToCreate.username, hashedPassString, userToCreate.firstName, userToCreate.lastName, userToCreate.email, userToCreate.roleId]);
     
    } catch(e){
            throw new Error(`Failed to validate User with DB: ${e.message}`)
    } finally{
            
            client && client.release();
    }

}
