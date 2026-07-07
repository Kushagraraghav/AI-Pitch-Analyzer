class HealthService:
    @staticmethod
    def get_status():
        return {
            'status': 'ok',
            'message': 'API is running'
        }
