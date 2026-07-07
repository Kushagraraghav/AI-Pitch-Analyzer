from datetime import datetime
import json
from extensions import db


class Analysis(db.Model):
    __tablename__ = 'analyses'

    id = db.Column(db.Integer, primary_key=True)
    startup_id = db.Column(db.Integer, db.ForeignKey('startups.id'), nullable=False, unique=True)
    market_score = db.Column(db.Integer, nullable=True)
    team_score = db.Column(db.Integer, nullable=True)
    product_score = db.Column(db.Integer, nullable=True)
    business_score = db.Column(db.Integer, nullable=True)
    scalability_score = db.Column(db.Integer, nullable=True)
    financial_score = db.Column(db.Integer, nullable=True)
    overall_score = db.Column(db.Integer, nullable=True)
    funding_readiness_score = db.Column(db.Integer, nullable=True)
    strengths = db.Column(db.Text, nullable=True)
    weaknesses = db.Column(db.Text, nullable=True)
    opportunities = db.Column(db.Text, nullable=True)
    risks = db.Column(db.Text, nullable=True)
    investment_recommendation = db.Column(db.Text, nullable=True)
    due_diligence_questions = db.Column(db.Text, nullable=True)
    direct_competitors = db.Column(db.Text, nullable=True)
    indirect_competitors = db.Column(db.Text, nullable=True)
    swot = db.Column(db.Text, nullable=True)
    tam = db.Column(db.String(255), nullable=True)
    sam = db.Column(db.String(255), nullable=True)
    som = db.Column(db.String(255), nullable=True)
    industry_trends = db.Column(db.Text, nullable=True)
    emerging_technologies = db.Column(db.Text, nullable=True)
    consumer_trends = db.Column(db.Text, nullable=True)
    growth_opportunities = db.Column(db.Text, nullable=True)
    strategic_recommendations = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    startup = db.relationship('Startup', back_populates='analysis')

    def _json_load(self, value, default=None):
        if not value:
            return default if default is not None else []
        try:
            return json.loads(value)
        except Exception:
            return default if default is not None else []

    def _json_load_object(self, value):
        if not value:
            return {}
        try:
            return json.loads(value)
        except Exception:
            return {}

    def to_dict(self):
        return {
            'id': self.id,
            'startup_id': self.startup_id,
            'market_score': self.market_score,
            'team_score': self.team_score,
            'product_score': self.product_score,
            'business_score': self.business_score,
            'scalability_score': self.scalability_score,
            'financial_score': self.financial_score,
            'overall_score': self.overall_score,
            'funding_readiness_score': self.funding_readiness_score,
            'strengths': self._json_load(self.strengths),
            'weaknesses': self._json_load(self.weaknesses),
            'opportunities': self._json_load(self.opportunities),
            'risks': self._json_load(self.risks),
            'investment_recommendation': self.investment_recommendation,
            'due_diligence_questions': self._json_load(self.due_diligence_questions),
            'direct_competitors': self._json_load(self.direct_competitors),
            'indirect_competitors': self._json_load(self.indirect_competitors),
            'swot': self._json_load_object(self.swot),
            'tam': self.tam,
            'sam': self.sam,
            'som': self.som,
            'industry_trends': self.industry_trends,
            'emerging_technologies': self.emerging_technologies,
            'consumer_trends': self.consumer_trends,
            'growth_opportunities': self.growth_opportunities,
            'strategic_recommendations': self.strategic_recommendations,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
