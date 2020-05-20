export class User {

    userId : number;
    username : string;
    password : string;
    firstName : string;
    lastName : string;
    email : string;
    roleId : number;

    constructor(userId : number, username:string, password:string,firstName:string, lastName:string, email:string, roleId: number){
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email  = email;
        this.roleId = roleId;
    }
}