from flask import Blueprint, jsonify
from middleware.auth import jwt_required_with_role

health_blueprint = Blueprint('health', __name__, url_prefix='')


@health_blueprint.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "API is running"
    }), 200