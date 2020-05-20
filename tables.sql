CREATE TABLE UserTable(
    userId  serial PRIMARY KEY,
    username varchar(255) UNIQUE NOT NULL ,
    password varchar(255)  NOT NULL,
    firstName varchar(255)  NOT NULL,
    lastName varchar(255)  NOT NULL,
    email varchar(255)  NOT NULL,
    roleId integer  NOT NULL
)


CREATE TABLE RoleTable (
    roleId serial PRIMARY KEY,
    roleName varchar(255) UNIQUE NOT NULL
)


CREATE TABLE Reimbursement (
    reimbursementId serial PRIMARY KEY,
    author integer NOT NULL,
    amount integer NOT NULL,
    dateSubmitted DATE NOT NULL,
    dateResolved DATE NOT NULL,
    described varchar(255)  NOT NULL,
    resolverId integer  NOT NULL,
    statusId integer  NOT NULL,
    reimbursementType integer,
)

CREATE TABLE ReimbursementStatus (
    statusId serial PRIMARY KEY,
    statusString varchar(255) UNIQUE NOT NULL
)

CREATE TABLE ReimbursementType (
    typeId serial PRIMARY KEY,
    typeName varchar(255) UNIQUE NOT NULL
)


INSERT INTO RoleTable VALUES (1, 'admin')
INSERT INTO RoleTable VALUES (2, 'user')
INSERT INTO RoleTable VALUES (3, 'finance-manager')

INSERT INTO ReimbursementStatus VALUES (1, 'Pending')
INSERT INTO ReimbursementStatus VALUES (2, 'Approved')
INSERT INTO ReimbursementStatus VALUES (3, 'Denied')

Insert INTO ReimbursementType VALUES (1, 'Lodging')
Insert INTO ReimbursementType VALUES (2, 'Travel')
Insert INTO ReimbursementType VALUES (3, 'Food')
Insert INTO ReimbursementType VALUES (4, 'Other')