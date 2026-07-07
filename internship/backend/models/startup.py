from datetime import datetime
from extensions import db


class Startup(db.Model):
    __tablename__ = 'startups'

    id = db.Column(db.Integer, primary_key=True)
    startup_name = db.Column(db.String(255), nullable=False)
    industry = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    problem = db.Column(db.Text, nullable=False)
    solution = db.Column(db.Text, nullable=False)
    target_market = db.Column(db.Text, nullable=False)
    business_model = db.Column(db.Text, nullable=False)
    traction = db.Column(db.Text, nullable=False)
    funding_ask = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    pitch_deck_path = db.Column(db.String(255), nullable=True)
    logo_path = db.Column(db.String(255), nullable=True)
    funding_stage = db.Column(db.String(100), nullable=True)
    executive_summary = db.Column(db.Text, nullable=True)
    problem_analysis = db.Column(db.Text, nullable=True)
    solution_analysis = db.Column(db.Text, nullable=True)
    target_market_analysis = db.Column(db.Text, nullable=True)
    business_model_analysis = db.Column(db.Text, nullable=True)
    traction_analysis = db.Column(db.Text, nullable=True)
    funding_ask_analysis = db.Column(db.Text, nullable=True)
    analysis_status = db.Column(db.String(20), nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = db.relationship('User', backref='startups')
    analysis = db.relationship('Analysis', uselist=False, back_populates='startup')

    def to_dict(self):
        return {
            'id': self.id,
            'startup_name': self.startup_name,
            'industry': self.industry,
            'category': self.category,
            'problem': self.problem,
            'solution': self.solution,
            'target_market': self.target_market,
            'business_model': self.business_model,
            'traction': self.traction,
            'funding_ask': self.funding_ask,
            'description': self.description,
            'pitch_deck_path': self.pitch_deck_path,
            'logo_path': self.logo_path,
            'funding_stage': self.funding_stage,
            'executive_summary': self.executive_summary,
            'problem_analysis': self.problem_analysis,
            'solution_analysis': self.solution_analysis,
            'target_market_analysis': self.target_market_analysis,
            'business_model_analysis': self.business_model_analysis,
            'traction_analysis': self.traction_analysis,
            'funding_ask_analysis': self.funding_ask_analysis,
            'analysis_status': self.analysis_status,
            'analysis': self.analysis.to_dict() if self.analysis else None,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
