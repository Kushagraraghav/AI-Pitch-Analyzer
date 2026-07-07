from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Extensions are initialized here and bound to the app in app.py.
db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
