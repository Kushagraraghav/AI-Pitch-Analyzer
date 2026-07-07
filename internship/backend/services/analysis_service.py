import fitz
import json
import os
from dotenv import load_dotenv
from openai import OpenAI
from fpdf import FPDF

load_dotenv()


def extract_text_from_pdf(file_path):
    text = []
    with fitz.open(file_path) as doc:
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text.append(page_text)
    return '\n'.join(text)


def _parse_list_response(text):
    lines = [line.strip('- ').strip() for line in text.splitlines() if line.strip()]
    return [line for line in lines if line]


def _extract_json_object(text):
    text = text.strip()
    if text.startswith('```') and '```' in text[3:]:
        parts = text.split('```')
        if len(parts) >= 3:
            text = parts[1].strip()

    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        return text[start:end + 1]
    return text


def _normalize_score(value, minimum=1, maximum=10):
    if isinstance(value, (int, float)):
        return max(minimum, min(maximum, int(round(value))))
    if isinstance(value, str) and value.strip().isdigit():
        return max(minimum, min(maximum, int(value.strip())))
    return None


def _normalize_list(value):
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        return _parse_list_response(value)
    return []


def _normalize_string(value):
    if value is None:
        return ''
    return str(value).strip()


def _safe_parse_json(value, default):
    if isinstance(value, dict) or isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return default
    return default


def generate_ai_analysis(text, startup=None):
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    if not OPENAI_API_KEY or OPENAI_API_KEY.strip() == '' or OPENAI_API_KEY == 'change-me':
        return {
            'market_score': 8,
            'team_score': 9,
            'product_score': 7,
            'business_score': 8,
            'scalability_score': 9,
            'financial_score': 6,
            'overall_score': 8,
            'funding_readiness_score': 7,
            'strengths': ['Strong technical team with domain expertise', 'Large addressable market (TAM)', 'Highly scalable SaaS business model'],
            'weaknesses': ['High initial customer acquisition costs', 'Early-stage product with limited customer testimonials', 'Relatively low barrier to entry for copycat competitors'],
            'opportunities': ['Enterprise partnerships', 'International expansion in adjacent markets', 'Premium pricing and usage-based revenue expansion'],
            'risks': ['Execution risk during rapid scaling', 'Dependency on a narrow customer segment', 'Potential margin pressure from low-cost competitors'],
            'investment_recommendation': 'Promising investment candidate with strong market and team signals. Validate execution capability and unit economics before a follow-on commitment.',
            'due_diligence_questions': ['What is your current customer acquisition cost and payback period?', 'How do you plan to scale the team over the next 18 months?', 'What are the main barriers for competitors to copy your solution?']
        }

    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        prompt = f"""
You are an expert venture capital analyst. Review the startup pitch text below and return ONLY valid JSON.
The JSON must contain all keys listed below.

- executive_summary (string)
- market_score (integer 1-10)
- team_score (integer 1-10)
- product_score (integer 1-10)
- business_score (integer 1-10)
- scalability_score (integer 1-10)
- financial_score (integer 1-10)
- funding_readiness_score (integer 1-10)
- overall_score (integer 1-10)
- strengths (array of strings)
- weaknesses (array of strings)
- opportunities (array of strings)
- risks (array of strings)
- investment_recommendation (string)
- due_diligence_questions (array of strings)

If a section cannot be rated, return null for its numeric value and an empty array or empty string for lists/text.

Pitch text:
{text}
"""

        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {'role': 'user', 'content': prompt}
            ],
            max_tokens=1200,
            temperature=0.2,
        )

        output_text = response.choices[0].message.content.strip()
        json_text = _extract_json_object(output_text)
        result = json.loads(json_text)

        normalized = {
            'executive_summary': _normalize_string(result.get('executive_summary')),
            'market_score': _normalize_score(result.get('market_score')),
            'team_score': _normalize_score(result.get('team_score')),
            'product_score': _normalize_score(result.get('product_score')),
            'business_score': _normalize_score(result.get('business_score')),
            'scalability_score': _normalize_score(result.get('scalability_score')),
            'financial_score': _normalize_score(result.get('financial_score')),
            'funding_readiness_score': _normalize_score(result.get('funding_readiness_score')),
            'overall_score': _normalize_score(result.get('overall_score')),
            'strengths': _normalize_list(result.get('strengths')),
            'weaknesses': _normalize_list(result.get('weaknesses')),
            'opportunities': _normalize_list(result.get('opportunities')),
            'risks': _normalize_list(result.get('risks')),
            'investment_recommendation': _normalize_string(result.get('investment_recommendation')),
            'due_diligence_questions': _normalize_list(result.get('due_diligence_questions')),
        }

        return normalized
    except Exception as exc:
        print(f'Error calling OpenAI API: {exc}')
        return {
            'market_score': 5,
            'team_score': 5,
            'product_score': 5,
            'business_score': 5,
            'scalability_score': 5,
            'financial_score': 5,
            'funding_readiness_score': 5,
            'overall_score': 5,
            'strengths': ['Fallback strengths due to API error'],
            'weaknesses': ['Fallback weaknesses due to API error'],
            'opportunities': ['Fallback opportunities due to API error'],
            'risks': ['API connection failed'],
            'executive_summary': 'Analysis unavailable because the AI service failed. Please retry later.',
            'market_score': 5,
            'team_score': 5,
            'product_score': 5,
            'business_score': 5,
            'scalability_score': 5,
            'financial_score': 5,
            'funding_readiness_score': 5,
            'overall_score': 5,
            'strengths': ['Fallback strengths due to API error'],
            'weaknesses': ['Fallback weaknesses due to API error'],
            'opportunities': ['Fallback opportunities due to API error'],
            'risks': ['API connection failed'],
            'investment_recommendation': f'Could not generate dynamic analysis. Technical details: {exc}',
            'due_diligence_questions': []
        }


def generate_market_intelligence(text, startup=None):
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    if not OPENAI_API_KEY or OPENAI_API_KEY.strip() == '' or OPENAI_API_KEY == 'change-me':
        return {
            'direct_competitors': ['Competitor One', 'Competitor Two'],
            'indirect_competitors': ['Indirect Competitor A', 'Indirect Competitor B'],
            'swot': {
                'strengths': ['Experienced founding team', 'Clear market need'],
                'weaknesses': ['Early revenue model', 'Customer onboarding complexity'],
                'opportunities': ['Adjacent verticals', 'Partnership expansion'],
                'threats': ['Incumbent competition', 'regulatory changes'],
            },
            'tam': 'Large enterprise spend in the target category',
            'sam': 'Core addressable segment for early adoption',
            'som': 'Practical initial serviceable obtainable market',
            'industry_trends': 'AI-enabled automation, vertical specialization, subscription-based SaaS adoption',
            'emerging_technologies': 'Generative AI, API-first platforms, low-code integration',
            'consumer_trends': 'Demand for personalization, self-service onboarding, remote collaboration tools',
            'growth_opportunities': 'Enterprise partnerships, upsell paths, geographic expansion',
            'strategic_recommendations': 'Focus on early customer success, simplify pricing, and build defensible distribution channels',
        }

    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        prompt = f"""
You are a market intelligence researcher. Analyze the startup pitch text below and return ONLY valid JSON.
The JSON must include the following keys:
- direct_competitors (array of strings)
- indirect_competitors (array of strings)
- swot (object with strengths, weaknesses, opportunities, threats)
- tam (string)
- sam (string)
- som (string)
- industry_trends (string)
- emerging_technologies (string)
- consumer_trends (string)
- growth_opportunities (string)
- strategic_recommendations (string)

Pitch text:
{text}
"""
        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {'role': 'user', 'content': prompt}
            ],
            max_tokens=1200,
            temperature=0.2,
        )

        output_text = response.choices[0].message.content.strip()
        json_text = _extract_json_object(output_text)
        result = json.loads(json_text)

        return {
            'direct_competitors': _normalize_list(result.get('direct_competitors')),
            'indirect_competitors': _normalize_list(result.get('indirect_competitors')),
            'swot': _safe_parse_json(result.get('swot'), {}),
            'tam': _normalize_string(result.get('tam')),
            'sam': _normalize_string(result.get('sam')),
            'som': _normalize_string(result.get('som')),
            'industry_trends': _normalize_string(result.get('industry_trends')),
            'emerging_technologies': _normalize_string(result.get('emerging_technologies')),
            'consumer_trends': _normalize_string(result.get('consumer_trends')),
            'growth_opportunities': _normalize_string(result.get('growth_opportunities')),
            'strategic_recommendations': _normalize_string(result.get('strategic_recommendations')),
        }
    except Exception as exc:
        print(f'Error calling OpenAI API: {exc}')
        return {
            'direct_competitors': ['Competitor One', 'Competitor Two'],
            'indirect_competitors': ['Indirect Competitor A', 'Indirect Competitor B'],
            'swot': {
                'strengths': ['Experienced founding team', 'Clear market need'],
                'weaknesses': ['Early revenue model', 'Customer onboarding complexity'],
                'opportunities': ['Adjacent verticals', 'Partnership expansion'],
                'threats': ['Incumbent competition', 'regulatory changes'],
            },
            'tam': 'Large enterprise spend in the target category',
            'sam': 'Core addressable segment for early adoption',
            'som': 'Practical initial serviceable obtainable market',
            'industry_trends': 'AI-enabled automation, vertical specialization, subscription-based SaaS adoption',
            'emerging_technologies': 'Generative AI, API-first platforms, low-code integration',
            'consumer_trends': 'Demand for personalization, self-service onboarding, remote collaboration tools',
            'growth_opportunities': 'Enterprise partnerships, upsell paths, geographic expansion',
            'strategic_recommendations': 'Focus on early customer success, simplify pricing, and build defensible distribution channels',
        }


def generate_pdf_report(startup, analysis):
    pdf = FPDF()
    pdf.set_auto_page_break(True, margin=15)
    pdf.add_page()

    pdf.set_font('Helvetica', 'B', 20)
    pdf.cell(0, 12, f'{startup.startup_name} - Evaluation Report', ln=True)
    pdf.set_font('Helvetica', '', 11)
    pdf.ln(3)
    pdf.multi_cell(0, 7, f'Industry: {startup.industry} | Category: {startup.category} | Funding Stage: {startup.funding_stage or 'N/A'}')
    pdf.ln(4)
    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 8, 'Executive Summary', ln=True)
    pdf.set_font('Helvetica', '', 11)
    pdf.multi_cell(0, 7, analysis.get('investment_recommendation') or 'No executive summary available.')
    pdf.ln(3)

    score_keys = [
        ('Market', analysis.get('market_score')),
        ('Team', analysis.get('team_score')),
        ('Product', analysis.get('product_score')),
        ('Business', analysis.get('business_score')),
        ('Scalability', analysis.get('scalability_score')),
        ('Financial', analysis.get('financial_score')),
        ('Funding Readiness', analysis.get('funding_readiness_score')),
        ('Overall', analysis.get('overall_score')),
    ]

    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 8, 'Score Summary', ln=True)
    pdf.set_font('Helvetica', '', 11)
    for label, score in score_keys:
        pdf.cell(0, 7, f'{label}: {score or "N/A"}/10', ln=True)
    pdf.ln(3)

    for section, values in [
        ('Strengths', analysis.get('strengths') or []),
        ('Weaknesses', analysis.get('weaknesses') or []),
        ('Opportunities', analysis.get('opportunities') or []),
        ('Risks', analysis.get('risks') or []),
        ('Due Diligence Questions', analysis.get('due_diligence_questions') or []),
    ]:
        pdf.set_font('Helvetica', 'B', 14)
        pdf.cell(0, 8, section, ln=True)
        pdf.set_font('Helvetica', '', 11)
        if isinstance(values, list) and values:
            for item in values:
                pdf.multi_cell(0, 7, f'- {item}')
        else:
            pdf.multi_cell(0, 7, 'None available.')
        pdf.ln(2)

    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 8, 'Market Intelligence', ln=True)
    pdf.set_font('Helvetica', '', 11)
    intelligence_fields = [
        ('Direct Competitors', analysis.get('direct_competitors')),
        ('Indirect Competitors', analysis.get('indirect_competitors')),
        ('TAM', analysis.get('tam')),
        ('SAM', analysis.get('sam')),
        ('SOM', analysis.get('som')),
        ('Industry Trends', analysis.get('industry_trends')),
        ('Emerging Technologies', analysis.get('emerging_technologies')),
        ('Consumer Trends', analysis.get('consumer_trends')),
        ('Growth Opportunities', analysis.get('growth_opportunities')),
        ('Strategic Recommendations', analysis.get('strategic_recommendations')),
    ]
    for title, content in intelligence_fields:
        pdf.set_font('Helvetica', 'B', 12)
        pdf.cell(0, 7, title, ln=True)
        pdf.set_font('Helvetica', '', 11)
        if isinstance(content, list):
            for item in content:
                pdf.multi_cell(0, 7, f'- {item}')
        else:
            pdf.multi_cell(0, 7, _normalize_string(content) or 'No data available.')
        pdf.ln(2)

    return pdf.output(dest='S').encode('latin-1')

