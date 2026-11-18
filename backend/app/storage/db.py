import sqlite3
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.config import settings

def init_db():
    conn = sqlite3.connect(settings.db_path)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            job_id TEXT PRIMARY KEY,
            mode TEXT NOT NULL,
            startup_name TEXT NOT NULL,
            overall_score REAL NOT NULL,
            score_badge TEXT NOT NULL,
            verdict TEXT NOT NULL,
            report_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def save_report(job_id: str, mode: str, startup_name: str, overall_score: float, score_badge: str, verdict: str, report_data: Dict[str, Any]):
    init_db()
    conn = sqlite3.connect(settings.db_path)
    cursor = conn.cursor()
    now_str = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT OR REPLACE INTO reports (job_id, mode, startup_name, overall_score, score_badge, verdict, report_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (job_id, mode, startup_name, overall_score, score_badge, verdict, json.dumps(report_data), now_str))
    conn.commit()
    conn.close()

def get_report(job_id: str) -> Optional[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(settings.db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT report_json FROM reports WHERE job_id = ?", (job_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row[0])
    return None

def list_past_reports(limit: int = 20) -> List[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(settings.db_path)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT job_id, mode, startup_name, overall_score, score_badge, verdict, created_at 
        FROM reports 
        ORDER BY created_at DESC 
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append({
            "job_id": r[0],
            "mode": r[1],
            "startup_name": r[2],
            "overall_score": r[3],
            "score_badge": r[4],
            "verdict": r[5],
            "created_at": r[6]
        })
    return results
