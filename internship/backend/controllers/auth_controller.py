from flask import jsonify, request
from flask_jwt_extended import create_access_token
from extensions import db
from models.user import User
from utils.helpers import format_response
import logging


class AuthController:
    @staticmethod
    def register():
        data = request.get_json(silent=True) or {}
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        role = (data.get('role') or 'Investor').strip().title()

        if not name or not email or not password:
            return jsonify({'message': 'Name, email, and password are required'}), 400

        if role not in {'Founder', 'Investor'}:
            return jsonify({'message': 'Role must be Founder or Investor'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'Email already registered'}), 409

        user = User(name=name, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        return jsonify({'message': 'Registration successful', 'user': user.to_dict()}), 201

    @staticmethod
    def login():
        try:
            data = request.get_json(silent=True) or {}
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')

            if not email or not password:
                return jsonify({'message': 'Email and password are required'}), 400

            user = User.query.filter_by(email=email).first()
            if not user or not user.check_password(password):
                return jsonify({'message': 'Invalid email or password'}), 401

            token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})
            return jsonify({
                'message': 'Login successful',
                'token': token,
                'user': user.to_dict(),
            }), 200
        except Exception as e:
            logging.exception('Error during login')
            return jsonify({'message': 'An internal error occurred during login'}), 500

    @staticmethod
    def profile():
        user_id = request.user_identity
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({'message': 'User not found'}), 404
        return jsonify({'user': user.to_dict()}), 200
