import express from 'express';
import bodyparser from 'body-parser';
import {Application, Request, Response} from 'express'
import {User} from './models/user';
import {Reimbursement} from './models/reimbursement';
import { findUserByUsernamePassword, getUsersFM, getUsersById, updateUser,createUser} from './repository/user-data-access';
import { sessionMiddleware } from './middleware/sessionMiddleware';
import {getReimbursementsByStatus,getReimbursementByUserId,submitReimbursement, updateReimbursement, getReimbursementsWithResolver, getReimbursementsByStatusAndUser} from './repository/reimbursement-data-access';
import { corsFilter } from './middleware/corsFilter';



const app : Application = express();

//Check if webhook works by pushing new enpoint:
app.get('/new-endpoint', (req:Request,res:Response) => {
    res.send('Webhooks worked');
});

//app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(sessionMiddleware);
app.use(corsFilter);


app.get('/reimbursements/author/userId/:userId', async(req : Request, res : Response) =>{

    let userId : string = req.params.userId;
    
    if(req.session){
        if(req.session.user.roleId =='2' || req.session.user.userId == userId){
            let reimbursementListByUserID =  await getReimbursementByUserId(userId);
            res.send(reimbursementListByUserID);
        } else{
            res.send('Must be logged in as the finance-manager or the specified user');
        }
    } 
        
});


app.get('/reimbursements/status/:statusId/user/:byUser', async (req : Request, res : Response) => {
    let statusId: string = req.params.statusId;
    let byUser: string = req.params.byUser;
    let userId : string = req.params.userId;
    if(req.session){
        if(req.session.user.roleId == '3'|| req.session.user.roleId == '2'){
            if(byUser === "true"){
                let reimbursementListByStatusAndUser = await getReimbursementsByStatusAndUser(statusId,userId);  
                res.send(reimbursementListByStatusAndUser);
            } else{
                let reimbursementListByStatus = await getReimbursementsByStatus(statusId);  
                res.send(reimbursementListByStatus);
            }
            
        } else {
            res.send('Must be finance-manager to view this page');
        }
    }
    
});

app.get('/reimbursements/resolver', async (req:Request, res:Response) =>{
    try{
        let settledReimbursements = await getReimbursementsWithResolver();
        res.send(settledReimbursements);
    } catch(e){
        res.send(e.message);
    }
    
})

app.patch('/reimbursements', async (req : Request, res : Response) =>{

    if(req.session){
        if(req.session.user.roleId == '2'){
            let reimbursement : Reimbursement = new Reimbursement(req.body.reimbursementid, req.body.author, req.body.amount, req.body.dateSubmitted, req.body.dateResolved, req.body.description,req.body.resolver, req.body.status, req.body.type);
            let newReimbursement = await updateReimbursement(reimbursement,req.session.user.userId);
            res.send(newReimbursement);
        } else {
            res.send('Must be finance-manager to view this page');
        }
    }

    
});

app.post('/reimbursements', async (req : Request, res : Response) =>{
   let amount : string =req.body.amount;
   let type : string = req.body.type;
   let descrip : string = req.body.descrip;
    if(req.session){
       let newR =  await submitReimbursement(amount, type, descrip, req.session.user.userId);
       console.log(newR);
       res.status(201).send(newR);
    }
});

app.get('/users', async (req:Request, res:Response) =>{
        
    if(req.session){
        if(req.session.user.userId == '2'){
           const usersList = await getUsersFM();
           res.send(usersList);
        } else{
            res.send('Must be a finance-manager to access this request');
        }
    } 
});

app.get('/users/:userid', async (req:Request, res:Response) =>{
    let idToFind = req.params.userid;
   
    if(req.session){
        if(req.session.user.roleId == '2' || req.session.user.userId == idToFind){
           const usersList = await getUsersById(idToFind);
           res.send(usersList);
        } else{
            res.send('Must be logged in as the finance-manager or the specified user');
        }
    } 
});

app.patch('/users', async (req:Request, res:Response)=>{
    
    let userId : string = req.body.userid;
    let username : string = req.body.username;
    let password : string = req.body.password;
    let firstName : string = req.body.firstname;
    let lastName : string = req.body.lastname;
    let email : string = req.body.email;
    let roleId : string = req.body.roleid;

    if(req.session){
        if(req.session.user.userId == req.body.userid){
            let updatedUser = await updateUser(userId, username, password, firstName, lastName, email, roleId);
            res.status(200).send(updatedUser);
        } else {
            res.send('Must be admin to update users');
        }
    }
});



app.post('/login', async (req:Request, res:Response) => {
    let {username, password} = req.body;
    if(!username || !password){
        res.status(400).send('Please include username and password fields for login');
    } else{
        try{
            const user = await findUserByUsernamePassword(username, password);
            if(req.session){
                req.session.user = user;
            }
            res.send(user);
        } catch(e){
            
            //res.status(400).send(`Failed to authenticate username and password: ${e}`);
            res.status(400).send(`Failed to authenticate username and password: ${app._router.stack}`);
        }
        
    }
});

app.patch('/logout', async (req:Request, res:Response) => {
    try{
        if(req.session){
           req.session.user = null;
        }
        res.send('Logged out');
    } catch(e){
        res.send(e);
    }
});

app.post('/create', async (req:Request, res:Response) => {
    let userId = req.body.userid;
    let username  = req.body.username;
    let password = req.body.password;
    let firstName = req.body.firstname;
    let lastName = req.body.lastname;
    let email  = req.body.email;
    let roleId = req.body.roleid;

    let newUser : User = new User(userId, username, password, firstName, lastName, email, roleId);
    console.log(newUser);
        try{
            await createUser(newUser);
            
            res.send('Creation successful')
        } catch(e){
            console.log(e);
            res.status(400).send('User not created');
        }
});

app.listen(3005, ()=>{
    app._router.stack.forEach(function(r:any){
        if (r.route && r.route.path){
          console.log(r.route.path)
        }
      })
    console.log('app has started');
});


