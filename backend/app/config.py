import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

class Settings(BaseModel):
    app_name: str = "Startup Co-Pilot"
    version: str = "1.0.0"
    
    # LLM Settings
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini")  # "gemini", "openai", "anthropic", "mock"
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    anthropic_model: str = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    
    # Search Settings
    tavily_api_key: str = os.getenv("TAVILY_API_KEY", "")
    serper_api_key: str = os.getenv("SERPER_API_KEY", "")
    
    # Storage & Paths
    db_path: Path = BASE_DIR / "copilot.db"
    benchmarks_path: Path = BASE_DIR / "benchmarks.json"
    weights_path: Path = BASE_DIR / "rubrics" / "weights.json"
    rubrics_path: Path = BASE_DIR / "rubrics" / "rubrics.json"
    idea_demos_path: Path = BASE_DIR / "demo_data" / "idea_demos.json"
    startup_demos_path: Path = BASE_DIR / "demo_data" / "startup_demos.json"

settings = Settings()
