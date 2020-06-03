import express, {Router, Request, Response} from 'express';
import { Reimbursement } from '../models/reimbursement';
import { connectionPool } from '.';
import { PoolClient, QueryResult } from 'pg';



export async function getReimbursementsWithResolver() : Promise<Reimbursement[]>{
    let client : PoolClient;
    client = await connectionPool.connect();
    try{
       let result : QueryResult;
        result =  await client.query(`
        SELECT 
        r.reimbursementid, r.author, r.amount, 
        r.datesubmitted, r.dateresolved,
        r.described, 
        ut.firstname + ' ' +ut.lastname as resolver,
        r.statusid,
        r.reimbursementtype 
        FROM reimbursement r 
        INNER JOIN usertable ut ON usertable.userid = r.resolver 
        WHERE r.status IN (2,3) ORDER BY datesubmitted`);
        
        
        const reimbursementList = result.rows.map((r)=>{
            return new Reimbursement(r.reimbursementid, r.author, r.amount, r.datesubmitted, r.dateresolved, r.described, r.resolverid, r.statusid, r.reimbursementtype);
        });
        return reimbursementList;
    } catch(e){
            throw new Error(`Failed to validate User with DB: ${e.message}`)
    } finally{
            client && client.release();
    }
}
 export async function getReimbursementsByStatus(statusId : string) : Promise<Reimbursement[]>{
    let client : PoolClient;
    client = await connectionPool.connect();
    try{
       let result : QueryResult;
        result =  await client.query('SELECT * FROM reimbursement WHERE statusid = $1 ORDER BY datesubmitted', [statusId]);
        
        
        const reimbursementList = result.rows.map((r)=>{
            return new Reimbursement(r.reimbursementid, r.author, r.amount, r.datesubmitted, r.dateresolved, r.described, r.resolverid, r.statusid, r.reimbursementtype);
        });
        return reimbursementList;
        
        
    } catch(e){
            throw new Error(`Failed to validate User with DB: ${e.message}`)
    } finally{
            client && client.release();
    }
    
}


export async function getReimbursementByUserId(userId : string) : Promise<Reimbursement[]>{
    let client : PoolClient;
    client = await connectionPool.connect();
    try{
       let result : QueryResult;
        result =  await client.query('SELECT * FROM reimbursement WHERE author = $1 ORDER BY datesubmitted', [userId]);
        
        
        const reimbursementList = result.rows.map((r)=>{
            return new Reimbursement(r.reimbursementid, r.author, r.amount, r.datesubmitted, r.dateresolved, r.described, r.resolverid, r.statusid, r.reimbursementtype);
        });
        console.log(reimbursementList);
        return reimbursementList;
        
        
    } catch(e){
            throw new Error(`Failed to validate User with DB: ${e.message}`)
    } finally{
            client && client.release();
    }
    
}

export async function submitReimbursement(amount : string, type : string, description : string, authorId : any){
    let client : PoolClient;
    client = await connectionPool.connect();
    try{
        var res = await client.query('INSERT INTO reimbursement VALUES (DEFAULT,$1, $2,CURRENT_DATE, NULL, $3,NULL,1,$4);', [authorId, amount, description, type]);
    
        let newRecord = await client.query('SELECT * FROM reimbursement WHERE reimbursementid IN (SELECT MAX(reimbursementid) from reimbursement);');
        const reimbursementReturn = newRecord.rows.map((r)=>{
            return new Reimbursement(r.reimbursementid,r.author,r.amount,r.datesubmitted,r.dateresolved,r.described,r.resolverid,r.statusid,r.reimbursementtype);
        });
        return reimbursementReturn;
    } catch(e){
            throw new Error(`Failed to validate User with DB: ${e.message}`)
    } finally{
            client && client.release();
    }
}

export async function updateReimbursement(reimbursement : Reimbursement, userId:any): Promise<Reimbursement>{
    let client : PoolClient;
    client = await connectionPool.connect();
    console.log(reimbursement);
    try{
        if(reimbursement.reimbursementId != undefined){
                if(reimbursement.author !== undefined){
                    let updateAuthor =  await client.query("UPDATE reimbursement SET author=$1 WHERE reimbursementid=$2", [reimbursement.author,reimbursement.reimbursementId]);
                }
                if(reimbursement.amount !== undefined){
                    let updatePassword = await client.query("UPDATE reimbursement SET amount=$1 WHERE reimbursementid = $2", [reimbursement.amount, reimbursement.reimbursementId]);
                }
                if(reimbursement.dateSubmitted !== undefined){
                    let updateFirstName = await client.query("UPDATE reimbursement SET dateSubmitted=$1 WHERE reimbursementid=$2", [reimbursement.dateSubmitted, reimbursement.reimbursementId]);
                    
                }
                if(reimbursement.description !== undefined){
                    let updateLastName = await client.query("UPDATE reimbursement SET descrip=$1 WHERE userid=$2", [reimbursement.description,reimbursement.reimbursementId]);
                }
                
                    if(userId !== undefined){
                        let updateEmail = await client.query("UPDATE reimbursement SET resolverid=$1 WHERE reimbursementid=$2", [userId,reimbursement.reimbursementId]);
                    }
                

                if(reimbursement.status=='2' || reimbursement.status=='3'){
                    let updateDateResolved = await client.query("UPDATE reimbursement SET dateResolved=CURRENT_DATE WHERE reimbursementid=$1", [reimbursement.reimbursementId]);
                }
               
                if(reimbursement.status !== undefined){
                    let updateRoleId = await client.query("UPDATE reimbursement SET statusid=$1 WHERE reimbursementid=$2", [reimbursement.status, reimbursement.reimbursementId]);
                }
                if(reimbursement.type !== undefined){
                    let updateRoleId = await client.query("UPDATE reimbursement SET reimbursementtype=$1 WHERE reimbursementid=$2", [reimbursement.type, reimbursement.reimbursementId]);
                }
                
     
        }
        let result : QueryResult;
       
        result = await client.query("SELECT * FROM reimbursement WHERE reimbursementid=$1", [reimbursement.reimbursementId]);
        
        const reimbursementReturn = result.rows.map((r)=>{
            return new Reimbursement(r.reimbursementid,r.author,r.amount,r.datesubmitted,r.dateresolved,r.described,r.resolverid,r.statusid,r.reimbursementtype);
        });
        
        return reimbursementReturn[0];
    } catch(e){
            throw new Error(`Failed to validate User with DB: ${e.message}`)
    } finally{
            
            client && client.release();
    }
}