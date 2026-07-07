from services.health_service import HealthService


class HealthController:
    @staticmethod
    def get_status():
        return HealthService.get_status()
