from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from models.user import User


def jwt_required_with_role(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception:
                return jsonify({'message': 'Missing or invalid token'}), 401

            identity = get_jwt_identity()
            claims = get_jwt()
            user_role = claims.get('role') or ''
            user_role = str(user_role).strip().lower()

            user = User.query.get(int(identity)) if identity else None
            if user and user.role:
                user_role = str(user.role).strip().lower()

            normalized_roles = [str(role).strip().lower() for role in roles]
            if roles and user_role not in normalized_roles:
                return jsonify({'message': 'Forbidden: insufficient role'}), 403

            request.user_identity = identity
            request.user_role = user_role
            return fn(*args, **kwargs)

        return wrapper

    return decorator
