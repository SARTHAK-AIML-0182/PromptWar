import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "Startup Co-Pilot"

def test_demos_endpoint():
    res = client.get("/api/demos")
    assert res.status_code == 200
    data = res.json()
    assert len(data["idea_demos"]) == 3
    assert len(data["startup_demos"]) == 2
    
    # Check chips
    chip_labels = [d["chip_label"] for d in data["idea_demos"]]
    assert any("AI Crop" in l for l in chip_labels)
    assert any("Pharmacy" in l for l in chip_labels)
    assert any("Interview" in l for l in chip_labels)

def test_analyze_and_report_flow():
    payload = {
        "mode": "idea",
        "currency": "INR",
        "idea_input": {
            "idea_description": "Hyperlocal 15-Minute Prescription Delivery aggregating mom-and-pop chemists in tier-2 cities.",
            "industry": "HealthTech",
            "target_market": "India / Tier-2 Cities"
        }
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "job_id" in data
    assert data["status"] == "started"
    job_id = data["job_id"]

    # Background task in TestClient runs during request; check report
    res_report = client.get(f"/api/report/{job_id}")
    assert res_report.status_code == 200
    report = res_report.json()
    assert report["job_id"] == job_id
    assert report["reliability"]["overall_score"] > 0
    assert len(report["reliability"]["pillars"]) == 10

    # Test PDF generation endpoint
    res_pdf = client.get(f"/api/report/{job_id}/pdf")
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert len(res_pdf.content) > 1000  # PDF generated with content

def test_past_reports_list():
    res = client.get("/api/reports")
    assert res.status_code == 200
    reports = res.json()
    assert isinstance(reports, list)
    assert len(reports) >= 1
