import express from "express";
import * as soap from "soap";
import * as fs from "fs";
import * as path from "path";

import {
    type User,
    type GetUsersArgs,
    type GetUsersResponse,
    type IdArgs,
    type CreateUserArgs,
    type UpdateUserArgs,
    type PatchUserArgs
} from "./types.js";

const app = express();

const wsdlPath = path.resolve(process.cwd(), "user.wsdl");

let users: User[] = [
    {
        id: "1",
        name: "Alice",
        email: "alice@example.com",
        role: "Admin"
    },
    {
        id: "2",
        name: "Bob",
        email: "bob@example.com",
        role: "User"
    },
    {
        id: "3",
        name: "Charlie",
        email: "charlie@example.com",
        role: "User"
    }
];

let nextUserId = 4;

const soapService = {
    UserService: {
        UserPort: {

            getUsers: (
                args: GetUsersArgs
            ): GetUsersResponse => {

                let filtered = [...users];

                if (args.filterRole) {
                    filtered = filtered.filter(
                        user =>
                            user.role.toLowerCase() ===
                            args.filterRole!.toLowerCase()
                    );
                }

                const page = Math.max(
                    Number(args.page) || 1,
                    1
                );

                const limit = Math.max(
                    Number(args.limit) || 10,
                    1
                );

                const startIndex = (page - 1) * limit;

                const paginatedUsers =
                    filtered.slice(
                        startIndex,
                        startIndex + limit
                    );

                return {
                    users: {
                        user: paginatedUsers
                    },
                    total: filtered.length
                };
            },

            getUserById: (
                args: IdArgs
            ): { user: User | null } => {

                const user =
                    users.find(
                        u => u.id === String(args.id)
                    ) || null;

                return { user };
            },

            createUser: (
                args: CreateUserArgs
            ): { user: User } => {

                const newUser: User = {
                    id: String(nextUserId++),
                    name: args.name,
                    email: args.email,
                    role: args.role
                };

                users.push(newUser);

                return {
                    user: newUser
                };
            },

            updateUser: (
                args: UpdateUserArgs
            ): { user: User | null } => {

                const index =
                    users.findIndex(
                        u => u.id === String(args.id)
                    );

                if (index === -1) {
                    return {
                        user: null
                    };
                }

                const updatedUser: User = {
                    id: String(args.id),
                    name: args.name,
                    email: args.email,
                    role: args.role
                };

                users[index] = updatedUser;

                return {
                    user: updatedUser
                };
            },

            patchUser: (
                args: PatchUserArgs
            ): { user: User | null } => {

                const user =
                    users.find(
                        u => u.id === String(args.id)
                    );

                if (!user) {
                    return {
                        user: null
                    };
                }

                if (args.name !== undefined) {
                    user.name = args.name;
                }

                if (args.email !== undefined) {
                    user.email = args.email;
                }

                if (args.role !== undefined) {
                    user.role = args.role;
                }

                return {
                    user
                };
            },

            deleteUser: (
                args: IdArgs
            ): { success: boolean } => {

                const initialLength =
                    users.length;

                users = users.filter(
                    u => u.id !== String(args.id)
                );

                return {
                    success:
                        users.length < initialLength
                };
            }
        }
    }
};

const wsdlXml =
    fs.readFileSync(
        wsdlPath,
        "utf8"
    );

soap.listen(
    app,
    "/userservice",
    soapService,
    wsdlXml
);

app.listen(8000, () => {
    console.log(
        "🚀 SOAP server running at:"
    );

    console.log(
        "http://localhost:8000/userservice"
    );

    console.log(
        "WSDL:"
    );

    console.log(
        "http://localhost:8000/userservice?wsdl"
    );
});