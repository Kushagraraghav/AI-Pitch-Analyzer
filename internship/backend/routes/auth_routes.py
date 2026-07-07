from flask import Blueprint, jsonify
from controllers.auth_controller import AuthController
from middleware.auth import jwt_required_with_role

auth_blueprint = Blueprint('auth', __name__, url_prefix='')


@auth_blueprint.route('/register', methods=['POST'])
def register():
    return AuthController.register()


@auth_blueprint.route('/login', methods=['POST'])
def login():
    return AuthController.login()


@auth_blueprint.route('/profile', methods=['GET'])
@jwt_required_with_role('Founder', 'Investor')
def profile():
    return AuthController.profile()


@auth_blueprint.route('/founder-only', methods=['GET'])
@jwt_required_with_role('Founder')
def founder_only():
    return jsonify({'message': 'Founder access granted'}), 200


@auth_blueprint.route('/investor-only', methods=['GET'])
@jwt_required_with_role('Investor')
def investor_only():
    return jsonify({'message': 'Investor access granted'}), 200
