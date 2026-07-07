from flask import Flask
from dotenv import load_dotenv
from sqlalchemy import text
import os

from extensions import db, jwt, cors

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret')

cors.init_app(app)
jwt.init_app(app)
db.init_app(app)

from routes.auth_routes import auth_blueprint
from routes.health_routes import health_blueprint
from routes.startup_routes import startup_blueprint
from routes.analysis_routes import analysis_blueprint
from models.startup import Startup
from models.analysis import Analysis

app.register_blueprint(auth_blueprint, url_prefix='/api/auth')
app.register_blueprint(health_blueprint, url_prefix='/api')
app.register_blueprint(startup_blueprint, url_prefix='/api/startups')
app.register_blueprint(analysis_blueprint, url_prefix='/api')


def ensure_database_columns():
    if db.engine.dialect.name != 'sqlite':
        return

    startup_info = {row[1] for row in db.session.execute(text('PRAGMA table_info(startups)')).fetchall()}
    startup_columns = {
        'funding_stage': 'VARCHAR(100)',
        'executive_summary': 'TEXT',
        'problem_analysis': 'TEXT',
        'solution_analysis': 'TEXT',
        'target_market_analysis': 'TEXT',
        'business_model_analysis': 'TEXT',
        'traction_analysis': 'TEXT',
        'funding_ask_analysis': 'TEXT',
        'analysis_status': 'VARCHAR(20)',
    }

    for name, col_type in startup_columns.items():
        if name not in startup_info:
            db.session.execute(text(f'ALTER TABLE startups ADD COLUMN {name} {col_type}'))

    analysis_info = {row[1] for row in db.session.execute(text('PRAGMA table_info(analyses)')).fetchall()}
    analysis_columns = {
        'overall_score': 'INTEGER',
        'funding_readiness_score': 'INTEGER',
        'strengths': 'TEXT',
        'weaknesses': 'TEXT',
        'opportunities': 'TEXT',
        'risks': 'TEXT',
        'investment_recommendation': 'TEXT',
        'due_diligence_questions': 'TEXT',
        'direct_competitors': 'TEXT',
        'indirect_competitors': 'TEXT',
        'swot': 'TEXT',
        'tam': 'VARCHAR(255)',
        'sam': 'VARCHAR(255)',
        'som': 'VARCHAR(255)',
        'industry_trends': 'TEXT',
        'emerging_technologies': 'TEXT',
        'consumer_trends': 'TEXT',
        'growth_opportunities': 'TEXT',
        'strategic_recommendations': 'TEXT',
    }

    for name, col_type in analysis_columns.items():
        if name not in analysis_info:
            db.session.execute(text(f'ALTER TABLE analyses ADD COLUMN {name} {col_type}'))

    db.session.commit()


with app.app_context():
    db.create_all()
    ensure_database_columns()


if __name__ == '__main__':
    app.run(debug=True)
