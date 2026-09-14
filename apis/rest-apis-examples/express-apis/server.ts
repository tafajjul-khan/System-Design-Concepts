import express, { type Request, type Response } from 'express';

const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// types 
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
}

// Type for request query parameters (Pagination)
interface PaginationQuery {
    page?: string;
    limit?: string;
}

// Response structure for paginated results
interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
}

// seed database in memory array
let users: User[] = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', isActive: true },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'User', isActive: true },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', isActive: false },
    { id: 4, name: 'David Miller', email: 'david@example.com', role: 'Moderator', isActive: true },
    { id: 5, name: 'Emma Watson', email: 'emma@example.com', role: 'User', isActive: true }
];

// rest api endpoints

//1. GET /api/users - Get all users with Pagination
// Route: http://localhost:3000/api/users?page=1&limit=2
app.get('/api/users', (
    req: Request<{}, {}, {}, PaginationQuery>, 
    res: Response<PaginatedResponse<User>>
) => {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedUsers = users.slice(startIndex, endIndex);

    res.status(200).json({
        data: paginatedUsers,
        page,
        limit,
        totalItems: users.length,
        totalPages: Math.ceil(users.length / limit)
    });
});


// 2. GET /api/users/:id - Get a single user by ID

app.get('/api/users/:id', (req: Request<{ id: string }>, res: Response) => {
    const userId = parseInt(req.params.id, 10);
    const user = users.find(u => u.id === userId);

    if (!user) {
        res.status(404).json({ error: `User with ID ${userId} not found` });
        return;
    }

    res.status(200).json(user);
});

// 3. POST /api/users - Create a new user (Full Resource Creation)

app.post('/api/users', (
    req: Request<{}, {}, Omit<User, 'id'>>, 
    res: Response
) => {
    const { name, email, role, isActive } = req.body;

    // Strict structural check for POST
    if (!name || !email || !role || isActive === undefined) {
        res.status(400).json({ error: 'All fields (name, email, role, isActive) are required' });
        return;
    }

    const newUser: User = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name,
        email,
        role,
        isActive
    };

    users.push(newUser);
    res.status(201).json(newUser);
});

// 4. PUT /api/users/:id - Replace/Update the entire resource

app.put('/api/users/:id', (
    req: Request<{ id: string }, {}, Omit<User, 'id'>>, 
    res: Response
) => {
    const userId = parseInt(req.params.id, 10);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    const { name, email, role, isActive } = req.body;

    // PUT requires the complete representation of the entity
    if (!name || !email || !role || isActive === undefined) {
        res.status(400).json({ error: 'PUT requires all fields for a complete replacement' });
        return;
    }

    users[userIndex] = { id: userId, name, email, role, isActive };
    res.status(200).json(users[userIndex]);
});

// 5. PATCH /api/users/:id - Partial update of a resource

app.patch('/api/users/:id', (
    req: Request<{ id: string }, {}, Partial<Omit<User, 'id'>>>, 
    res: Response
) => {
    const userId = parseInt(req.params.id, 10);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    // Blend existing properties with the incoming modifications
    const updatedUser = {
        ...users[userIndex],
        ...req.body
    };

    users[userIndex] = updatedUser;
    res.status(200).json(updatedUser);
});

// 6. DELETE /api/users/:id - Remove a resource

app.delete('/api/users/:id', (req: Request<{ id: string }>, res: Response) => {
    const userId = parseInt(req.params.id, 10);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    users.splice(userIndex, 1);
    res.status(200).json({ message: `User with ID ${userId} deleted successfully` });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Type-Safe REST API running at http://localhost:${PORT}`);
});
