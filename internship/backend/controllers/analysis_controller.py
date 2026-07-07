import json
import os
from io import BytesIO
from flask import jsonify, request, current_app, send_file
from extensions import db
from models.startup import Startup
from models.analysis import Analysis
from services.analysis_service import extract_text_from_pdf, generate_ai_analysis, generate_market_intelligence, generate_pdf_report


class AnalysisController:
    @staticmethod
    def generate_analysis():
        data = request.get_json(silent=True) or {}
        startup_id = data.get('startup_id')
        if not startup_id:
            return jsonify({'message': 'startup_id is required'}), 400

        startup = Startup.query.get(startup_id)
        if not startup:
            return jsonify({'message': 'Startup not found'}), 404

        if startup.created_by != int(request.user_identity):
            return jsonify({'message': 'Forbidden'}), 403

        if not startup.pitch_deck_path:
            return jsonify({'message': 'No pitch deck available for this startup'}), 400

        startup.analysis_status = 'running'
        db.session.commit()

        try:
            pdf_path = os.path.join(current_app.root_path, 'uploads', startup.pitch_deck_path)
            extracted_text = extract_text_from_pdf(pdf_path)
            analysis = generate_ai_analysis(extracted_text, startup)
            market_intelligence = generate_market_intelligence(extracted_text, startup)

            startup.executive_summary = analysis.get('executive_summary')
            startup.analysis_status = 'completed'
            db.session.commit()

            analysis_record = Analysis.query.filter_by(startup_id=startup.id).first()
            if not analysis_record:
                analysis_record = Analysis(startup_id=startup.id)
                db.session.add(analysis_record)

            analysis_record.market_score = analysis.get('market_score')
            analysis_record.team_score = analysis.get('team_score')
            analysis_record.product_score = analysis.get('product_score')
            analysis_record.business_score = analysis.get('business_score')
            analysis_record.scalability_score = analysis.get('scalability_score')
            analysis_record.financial_score = analysis.get('financial_score')
            analysis_record.overall_score = analysis.get('overall_score')
            analysis_record.funding_readiness_score = analysis.get('funding_readiness_score')
            analysis_record.strengths = json.dumps(analysis.get('strengths') or [])
            analysis_record.weaknesses = json.dumps(analysis.get('weaknesses') or [])
            analysis_record.opportunities = json.dumps(analysis.get('opportunities') or [])
            analysis_record.risks = json.dumps(analysis.get('risks') or [])
            analysis_record.investment_recommendation = analysis.get('investment_recommendation')
            analysis_record.due_diligence_questions = json.dumps(analysis.get('due_diligence_questions') or [])
            analysis_record.direct_competitors = json.dumps(market_intelligence.get('direct_competitors') or [])
            analysis_record.indirect_competitors = json.dumps(market_intelligence.get('indirect_competitors') or [])
            analysis_record.swot = json.dumps(market_intelligence.get('swot') or {})
            analysis_record.tam = market_intelligence.get('tam')
            analysis_record.sam = market_intelligence.get('sam')
            analysis_record.som = market_intelligence.get('som')
            analysis_record.industry_trends = market_intelligence.get('industry_trends')
            analysis_record.emerging_technologies = market_intelligence.get('emerging_technologies')
            analysis_record.consumer_trends = market_intelligence.get('consumer_trends')
            analysis_record.growth_opportunities = market_intelligence.get('growth_opportunities')
            analysis_record.strategic_recommendations = market_intelligence.get('strategic_recommendations')

            db.session.commit()

            return jsonify({'message': 'Analysis completed', 'startup': startup.to_dict(), 'analysis': analysis_record.to_dict()}), 200
        except Exception as exc:
            startup.analysis_status = 'failed'
            db.session.commit()
            return jsonify({'message': 'Analysis failed', 'error': str(exc)}), 500

    @staticmethod
    def get_analysis(startup_id):
        startup = Startup.query.get(startup_id)
        if not startup:
            return jsonify({'message': 'Startup not found'}), 404

        if startup.created_by != int(request.user_identity):
            return jsonify({'message': 'Forbidden'}), 403

        analysis_record = Analysis.query.filter_by(startup_id=startup_id).first()
        if not analysis_record:
            return jsonify({'message': 'No analysis found for this startup'}), 404

        return jsonify({'analysis': analysis_record.to_dict(), 'startup': startup.to_dict()}), 200

    @staticmethod
    def download_report(startup_id):
        startup = Startup.query.get(startup_id)
        if not startup:
            return jsonify({'message': 'Startup not found'}), 404

        if startup.created_by != int(request.user_identity):
            return jsonify({'message': 'Forbidden'}), 403

        analysis_record = Analysis.query.filter_by(startup_id=startup_id).first()
        if not analysis_record:
            return jsonify({'message': 'Analysis required before downloading report'}), 404

        report_bytes = generate_pdf_report(startup, analysis_record.to_dict())
        report_stream = BytesIO(report_bytes)
        report_stream.seek(0)

        return send_file(
            report_stream,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'{startup.startup_name.replace(" ", "_")}_evaluation_report.pdf'
        )
