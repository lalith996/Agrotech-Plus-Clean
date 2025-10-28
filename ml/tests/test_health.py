from fastapi.testclient import TestClient
from ml.service.main import app

def test_health_endpoint():
    client = TestClient(app)
    resp = client.get('/health')
    assert resp.status_code == 200
    data = resp.json()
    assert data['status'] == 'ok'
    assert 'served_at' in data