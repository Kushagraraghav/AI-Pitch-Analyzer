def format_response(data, message='Success', status_code=200):
    return {
        'status': status_code,
        'message': message,
        'data': data,
    }, status_code
