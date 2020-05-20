export class Reimbursement {
    reimbursementId : string;
    author : string;
    amount : string;
    dateSubmitted : string;
    dateResolved : string;
    description : string;
    resolver: string;
    status: string;
    type: string;

    constructor(reimbursementId : string, author : string, amount:string, dateSubmitted : string, dateResolved : string,description:string,resolver:string, status:string, type:string){
        this.reimbursementId = reimbursementId;
        this.author = author;
        this.amount = amount;
        this.dateSubmitted = dateSubmitted;
        this.dateResolved = dateResolved;
        this.description = description;
        this.resolver = resolver;
        this.status = status;
        this.type = type;
    }
}