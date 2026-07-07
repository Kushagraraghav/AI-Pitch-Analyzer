from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, send_from_directory, url_for
from sqlalchemy import func, or_, and_
from sqlalchemy.orm import joinedload
from werkzeug.utils import secure_filename
import os

from middleware.auth import jwt_required_with_role
from extensions import db
from models.startup import Startup
from models.user import User
from models.analysis import Analysis
from models.investor_action import InvestorAction

startup_blueprint = Blueprint('startup', __name__, url_prefix='/startups')

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_file(file):
    uploads_dir = os.path.join(current_app.root_path, 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    filename = secure_filename(file.filename)
    file_path = os.path.join(uploads_dir, filename)
    file.save(file_path)
    return filename


def serialize_startup(startup, action_status=None):
    data = startup.to_dict()
    if startup.pitch_deck_path:
        data['pitch_deck_url'] = url_for('startup.get_pitch_deck', startup_id=startup.id, _external=False)
    if action_status:
        data['investor_action'] = action_status
    if startup.analysis:
        data['analysis'] = startup.analysis.to_dict()
    return data


def get_upload_filename(path):
    if not path:
        return None
    return os.path.basename(path)


@startup_blueprint.route('', methods=['GET'])
@jwt_required_with_role('Founder', 'Investor')
def list_startups():
    user_id = int(request.user_identity)
    user = User.query.get(user_id)

    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    min_score = request.args.get('min_score')
    max_score = request.args.get('max_score')
    funding_stage = request.args.get('funding_stage', '').strip()
    start_date = request.args.get('start_date', '').strip()
    end_date = request.args.get('end_date', '').strip()
    sort_by = request.args.get('sort_by', 'newest').strip().lower()
    page = int(request.args.get('page', 1))
    page_size = min(int(request.args.get('page_size', 20)), 50)

    query = Startup.query.options(joinedload(Startup.analysis))

    if user and user.role == 'Founder':
        query = query.filter_by(created_by=user_id)

    if category:
        query = query.filter(func.lower(Startup.category) == category.lower())

    if funding_stage:
        query = query.filter(func.lower(Startup.funding_stage) == funding_stage.lower())

    if search:
        terms = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Startup.startup_name).like(terms),
                func.lower(Startup.industry).like(terms),
                func.lower(Startup.description).like(terms),
                func.lower(Startup.problem).like(terms),
                func.lower(Startup.solution).like(terms),
            )
        )

    if start_date:
        try:
            parsed_start = datetime.fromisoformat(start_date)
            query = query.filter(Startup.created_at >= parsed_start)
        except ValueError:
            pass

    if end_date:
        try:
            parsed_end = datetime.fromisoformat(end_date)
            query = query.filter(Startup.created_at <= parsed_end)
        except ValueError:
            pass

    if min_score is not None or max_score is not None:
        if min_score is not None:
            query = query.filter(Analysis.overall_score >= int(min_score))
        if max_score is not None:
            query = query.filter(Analysis.overall_score <= int(max_score))
        query = query.join(Analysis, Startup.id == Analysis.startup_id)

    if sort_by == 'highest_score':
        query = query.order_by(Analysis.overall_score.desc().nullslast(), Startup.created_at.desc())
    elif sort_by == 'oldest':
        query = query.order_by(Startup.created_at.asc())
    elif sort_by == 'most_fundable':
        query = query.order_by(Analysis.funding_readiness_score.desc().nullslast(), Startup.created_at.desc())
    else:
        query = query.order_by(Startup.created_at.desc())

    total = query.count()
    startups = query.offset((page - 1) * page_size).limit(page_size).all()

    investor_actions = {}
    if user and user.role == 'Investor':
        actions = InvestorAction.query.filter_by(investor_id=user_id).all()
        investor_actions = {action.startup_id: action.action for action in actions}

    return jsonify({
        'items': [serialize_startup(startup, investor_actions.get(startup.id)) for startup in startups],
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total': total,
        },
    }), 200


@startup_blueprint.route('/<int:startup_id>', methods=['GET'])
@jwt_required_with_role('Founder', 'Investor')
def get_startup(startup_id):
    startup = Startup.query.get(startup_id)
    if not startup:
        return jsonify({'message': 'Startup not found'}), 404

    user_id = int(request.user_identity)
    user = User.query.get(user_id)
    investor_action = None
    if user and user.role == 'Investor':
        action = InvestorAction.query.filter_by(investor_id=user_id, startup_id=startup_id).first()
        investor_action = action.action if action else None

    if user and user.role == 'Founder' and startup.created_by != user_id:
        return jsonify({'message': 'Forbidden'}), 403

    return jsonify(serialize_startup(startup, investor_action)), 200


@startup_blueprint.route('/<int:startup_id>/pitch_deck', methods=['GET'])
@jwt_required_with_role('Founder', 'Investor')
def get_pitch_deck(startup_id):
    startup = Startup.query.get(startup_id)
    if not startup or not startup.pitch_deck_path:
        return jsonify({'message': 'Pitch deck not found'}), 404

    filename = get_upload_filename(startup.pitch_deck_path)
    uploads_dir = os.path.join(current_app.root_path, 'uploads')
    return send_from_directory(uploads_dir, filename, as_attachment=True)


@startup_blueprint.route('/<int:startup_id>/action', methods=['POST'])
@jwt_required_with_role('Investor')
def post_startup_action(startup_id):
    startup = Startup.query.get(startup_id)
    if not startup:
        return jsonify({'message': 'Startup not found'}), 404

    data = request.get_json(silent=True) or request.form
    action = (data.get('action') or '').strip().lower()
    if action not in {'save', 'reject', 'shortlist'}:
        return jsonify({'message': 'Action must be save, reject, or shortlist'}), 400

    investor_id = int(request.user_identity)
    investor_action = InvestorAction.query.filter_by(investor_id=investor_id, startup_id=startup_id).first()
    if investor_action:
        investor_action.action = action
    else:
        investor_action = InvestorAction(investor_id=investor_id, startup_id=startup_id, action=action)
        db.session.add(investor_action)

    db.session.commit()
    return jsonify({'message': 'Investor action recorded', 'action': action}), 200


@startup_blueprint.route('', methods=['POST'])
@jwt_required_with_role('Founder')
def create_startup():
    data = request.form
    required_fields = ['startup_name', 'industry', 'category', 'problem', 'solution', 'target_market', 'business_model', 'traction', 'funding_ask', 'description']
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return jsonify({'message': f'Missing fields: {", ".join(missing)}'}), 400

    startup = Startup(
        startup_name=data.get('startup_name'),
        industry=data.get('industry'),
        category=data.get('category'),
        problem=data.get('problem'),
        solution=data.get('solution'),
        target_market=data.get('target_market'),
        business_model=data.get('business_model'),
        traction=data.get('traction'),
        funding_ask=data.get('funding_ask'),
        funding_stage=data.get('funding_stage'),
        description=data.get('description'),
        created_by=int(request.user_identity),
    )

    pitch_deck = request.files.get('pitch_deck')
    logo = request.files.get('logo')

    if pitch_deck and allowed_file(pitch_deck.filename):
        startup.pitch_deck_path = save_file(pitch_deck)
    if logo and allowed_file(logo.filename):
        startup.logo_path = save_file(logo)

    db.session.add(startup)
    db.session.commit()
    return jsonify(startup.to_dict()), 201


@startup_blueprint.route('/<int:startup_id>', methods=['PUT'])
@jwt_required_with_role('Founder')
def update_startup(startup_id):
    startup = Startup.query.get(startup_id)
    if not startup:
        return jsonify({'message': 'Startup not found'}), 404
    if startup.created_by != int(request.user_identity):
        return jsonify({'message': 'Forbidden'}), 403

    data = request.form
    for field in ['startup_name', 'industry', 'category', 'problem', 'solution', 'target_market', 'business_model', 'traction', 'funding_ask', 'funding_stage', 'description']:
        if data.get(field) is not None:
            setattr(startup, field, data.get(field))

    pitch_deck = request.files.get('pitch_deck')
    logo = request.files.get('logo')

    if pitch_deck and allowed_file(pitch_deck.filename):
        startup.pitch_deck_path = save_file(pitch_deck)
    if logo and allowed_file(logo.filename):
        startup.logo_path = save_file(logo)

    db.session.commit()
    return jsonify(startup.to_dict()), 200


@startup_blueprint.route('/<int:startup_id>', methods=['DELETE'])
@jwt_required_with_role('Founder')
def delete_startup(startup_id):
    startup = Startup.query.get(startup_id)
    if not startup:
        return jsonify({'message': 'Startup not found'}), 404
    if startup.created_by != int(request.user_identity):
        return jsonify({'message': 'Forbidden'}), 403

    db.session.delete(startup)
    db.session.commit()
    return jsonify({'message': 'Startup deleted successfully'}), 200
