import asyncio
import json
import uuid
from typing import Dict, Any, Optional
from fastapi import APIRouter, BackgroundTasks, UploadFile, File, HTTPException, Response
from fastapi.responses import StreamingResponse
from app.schemas.input_schemas import StartupInput
from app.orchestrator.engine import orchestrator
from app.orchestrator.stream_manager import stream_manager
from app.storage.db import get_report, list_past_reports
from app.tools.deck_parser import parse_pitch_deck
from app.pdf.report_generator import generate_pdf_report
from app.config import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.version,
        "llm_provider": settings.llm_provider
    }

@router.get("/demos")
async def get_demo_presets():
    """Returns the pre-configured 3 Idea Stage and 2 Running Startup presets."""
    idea_demos = []
    startup_demos = []
    
    if settings.idea_demos_path.exists():
        with open(settings.idea_demos_path, "r", encoding="utf-8") as f:
            idea_demos = json.load(f)
            
    if settings.startup_demos_path.exists():
        with open(settings.startup_demos_path, "r", encoding="utf-8") as f:
            startup_demos = json.load(f)
            
    return {
        "idea_demos": idea_demos,
        "startup_demos": startup_demos
    }

@router.get("/reports")
async def get_past_reports():
    """Returns past reports saved in SQLite database."""
    return list_past_reports(limit=25)

@router.post("/analyze")
async def start_analysis(payload: StartupInput, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    # Start pipeline in background task
    background_tasks.add_task(orchestrator.run_pipeline, job_id, payload)
    return {
        "job_id": job_id,
        "status": "started",
        "mode": payload.mode,
        "message": "Multi-agent evaluation pipeline initialized."
    }

@router.get("/stream/{job_id}")
async def stream_agent_progress(job_id: str):
    """Server-Sent Events (SSE) streaming endpoint for live agent status."""
    queue = stream_manager.get_or_create_queue(job_id)

    async def event_generator():
        # First send initial keepalive
        yield f"event: ping\ndata: {json.dumps({'message': 'Connected to live stream'})}\n\n"
        
        while True:
            try:
                # Wait for next event with a timeout to allow ping
                event = await asyncio.wait_for(queue.get(), timeout=15.0)
                event_data = event.model_dump()
                yield f"event: {event.event_type}\ndata: {json.dumps(event_data)}\n\n"
                
                if event.event_type in ["complete", "error"]:
                    break
            except asyncio.TimeoutError:
                # Send periodic heartbeat comment so proxies/browsers keep connection open
                yield ": keepalive\n\n"
            except asyncio.CancelledError:
                break

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/report/{job_id}")
async def fetch_report(job_id: str):
    report = get_report(job_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found or analysis still in progress.")
    return report

@router.get("/report/{job_id}/pdf")
async def download_pdf_report(job_id: str):
    report = get_report(job_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found or analysis still in progress.")
    
    pdf_bytes = generate_pdf_report(report)
    startup_name = report.get("reliability", {}).get("startup_name", "startup").replace(" ", "_")
    filename = f"{startup_name}_reliability_report.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=\"{filename}\""
        }
    )

@router.post("/upload-deck")
async def upload_deck(file: UploadFile = File(...)):
    """Uploads a pitch deck PDF and extracts startup parameters."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF pitch decks are supported.")
    
    content = await file.read()
    result = parse_pitch_deck(content)
    return result
