from flask import Flask, request, jsonify, Response
from pydantic import BaseModel, EmailStr, Field, ValidationError
from typing import List, Optional

app = Flask(__name__)

# ==========================================
# 1. DATA SCHEMAS & TYPE SAFETY (Pydantic)
# ==========================================

# Database Model
class User(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool

# Schema for creating a new user (POST requires all fields except id)
class UserCreateSchema(BaseModel):
    name: str = Field(..., min_length=1)
    email: str
    role: str = Field(..., min_length=1)
    is_active: bool

# Schema for updating a user completely (PUT)
class UserUpdateSchema(BaseModel):
    name: str
    email: str
    role: str
    is_active: bool

# Schema for updating a user partially (PATCH)
class UserPatchSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


# ==========================================
# 2. IN-MEMORY DATABASE & SEED DATA
# ==========================================
users_db: List[User] = [
    User(id=1, name='Alice Smith', email='alice@example.com', role='Admin', is_active=True),
    User(id=2, name='Bob Jones', email='bob@example.com', role='User', is_active=True),
    User(id=3, name='Charlie Brown', email='charlie@example.com', role='User', is_active=False),
    User(id=4, name='David Miller', email='david@example.com', role='Moderator', is_active=True),
    User(id=5, name='Emma Watson', email='emma@example.com', role='User', is_active=True)
]


# ==========================================
# 3. REST API ENDPOINTS
# ==========================================

# /**
#  * 1. GET /api/users - Get all users with Pagination
#  * Route: http://127.0.0
#  */
@app.route('/api/users', methods=['GET'])
def get_users():
    # Parse query parameters with fallback defaults
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    start_index = (page - 1) * limit
    end_index = page * limit
    
    paginated_users = users_db[start_index:end_index]
    
    # .model_dump() turns Pydantic objects into standard Python dicts for JSON serialization
    return jsonify({
        "data": [user.model_dump() for user in paginated_users],
        "page": page,
        "limit": limit,
        "totalItems": len(users_db),
        "totalPages": (len(users_db) + limit - 1) // limit
    }), 200

# /**
#  * 2. GET /api/users/<id> - Get a single user by ID
#  */
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id: int):
    user = next((u for u in users_db if u.id == user_id), None)
    if not user:
        return jsonify({"error": f"User with ID {user_id} not found"}), 404
        
    return jsonify(user.model_dump()), 200

# /**
#  * 3. POST /api/users - Create a new user (Full Validation)
#  */
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    try:
        # Validate structure against the Create schema
        validated_data = UserCreateSchema(**data)
    except ValidationError as e:
        return jsonify({"error": "Validation Failed", "details": e.errors(include_url=False)}), 400
        
    next_id = max([u.id for u in users_db]) + 1 if users_db else 1
    
    new_user = User(
        id=next_id,
        name=validated_data.name,
        email=validated_data.email,
        role=validated_data.role,
        is_active=validated_data.is_active
    )
    
    users_db.append(new_user)
    return jsonify(new_user.model_dump()), 201

# /**
#  * 4. PUT /api/users/<id> - Replace/Update the entire resource
#  */
@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user_complete(user_id: int):
    user_index = next((i for i, u in enumerate(users_db) if u.id == user_id), None)
    if user_index == -1 or user_index is None:
        return jsonify({"error": "User not found"}), 404
        
    data = request.get_json() or {}
    try:
        validated_data = UserUpdateSchema(**data)
    except ValidationError as e:
        return jsonify({"error": "Validation Failed", "details": e.errors(include_url=False)}), 400
        
    # Replace the entity wholesale while maintaining the original ID
    users_db[user_index] = User(id=user_id, **validated_data.model_dump())
    return jsonify(users_db[user_index].model_dump()), 200

# /**
#  * 5. PATCH /api/users/<id> - Partial update of a resource
#  */
@app.route('/api/users/<int:user_id>', methods=['PATCH'])
def update_user_partial(user_id: int):
    user_index = next((i for i, u in enumerate(users_db) if u.id == user_id), None)
    if user_index == -1 or user_index is None:
        return jsonify({"error": "User not found"}), 404
        
    data = request.get_json() or {}
    try:
        # exclude_unset=True ignores properties client left out of payload
        validated_data = UserPatchSchema(**data).model_dump(exclude_unset=True)
    except ValidationError as e:
        return jsonify({"error": "Validation Failed", "details": e.errors(include_url=False)}), 400
        
    # Fetch current object, turn it into a dict, apply updates, and reconstruct Pydantic model
    current_user_data = users_db[user_index].model_dump()
    current_user_data.update(validated_data)
    
    users_db[user_index] = User(**current_user_data)
    return jsonify(users_db[user_index].model_dump()), 200

# /**
#  * 6. DELETE /api/users/<id> - Remove a resource
#  */
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id: int):
    user_index = next((i for i, u in enumerate(users_db) if u.id == user_id), None)
    if user_index == -1 or user_index is None:
        return jsonify({"error": "User not found"}), 404
        
    users_db.pop(user_index)
    return jsonify({"message": f"User with ID {user_id} deleted successfully"}), 200

# Start Flask Development Server
if __name__ == '__main__':
    app.run(debug=True)
