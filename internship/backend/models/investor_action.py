from datetime import datetime
from extensions import db


class InvestorAction(db.Model):
    __tablename__ = 'investor_actions'

    id = db.Column(db.Integer, primary_key=True)
    investor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    startup_id = db.Column(db.Integer, db.ForeignKey('startups.id'), nullable=False)
    action = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('investor_id', 'startup_id', name='uix_investor_startup'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'investor_id': self.investor_id,
            'startup_id': self.startup_id,
            'action': self.action,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
