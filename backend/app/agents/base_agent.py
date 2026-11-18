import time
import logging
from typing import Optional, Dict, Any, Type, TypeVar
from pydantic import BaseModel
from app.tools.llm_client import llm_client
from app.schemas.common import AgentStatus

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)

class BaseAgent:
    def __init__(self, agent_id: str, name: str, description: str):
        self.agent_id = agent_id
        self.name = name
        self.description = description
        self.status = AgentStatus(
            agent_id=agent_id,
            name=name,
            state="waiting",
            message=f"{name} is initialized."
        )

    def set_running(self, message: str):
        self.status.state = "running"
        self.status.message = message

    def set_done(self, message: str, elapsed_ms: int):
        self.status.state = "done"
        self.status.message = message
        self.status.elapsed_ms = elapsed_ms

    def set_failed(self, error: str):
        self.status.state = "failed"
        self.status.state = "failed"
        self.status.message = f"Error: {error}"
        self.status.error = error

    async def execute_llm_task(
        self,
        system_prompt: str,
        user_prompt: str,
        response_model: Type[T],
        temperature: float = 0.2,
        mock_data: Optional[Dict[str, Any]] = None
    ) -> T:
        start_time = time.time()
        try:
            result = await llm_client.generate_structured(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_model=response_model,
                temperature=temperature,
                mock_fallback_data=mock_data
            )
            elapsed = int((time.time() - start_time) * 1000)
            self.set_done(f"{self.name} completed analysis.", elapsed)
            return result
        except Exception as e:
            logger.error(f"Agent {self.agent_id} execution failed: {e}")
            self.set_failed(str(e))
            raise e
