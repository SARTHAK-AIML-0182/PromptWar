import os
import sys
from pathlib import Path
import uvicorn

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    is_dev = os.getenv("ENVIRONMENT", "production").lower() == "development"
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=is_dev)
