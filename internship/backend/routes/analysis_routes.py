from flask import Blueprint
from controllers.analysis_controller import AnalysisController
from middleware.auth import jwt_required_with_role

analysis_blueprint = Blueprint('analysis', __name__)

analysis_blueprint.route('/generate-analysis', methods=['POST'])(jwt_required_with_role('Founder')(AnalysisController.generate_analysis))
analysis_blueprint.route('/analysis/<int:startup_id>', methods=['GET'])(jwt_required_with_role('Founder')(AnalysisController.get_analysis))
analysis_blueprint.route('/analysis/<int:startup_id>/report', methods=['GET'])(jwt_required_with_role('Founder')(AnalysisController.download_report))
