export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface GetUsersArgs {
    page: number;
    limit: number;
    filterRole?: string;
}

export interface GetUsersResponse {
    users: { user: User[] };
    total: number;
}

export interface IdArgs { id: string; }
export interface CreateUserArgs { name: string; email: string; role: string; }
export interface UpdateUserArgs { id: string; name: string; email: string; role: string; }
export interface PatchUserArgs { id: string; name?: string; email?: string; role?: string; }
