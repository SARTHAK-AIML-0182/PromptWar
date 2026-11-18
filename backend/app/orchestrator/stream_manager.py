import asyncio
import json
from typing import Dict, Optional
from app.schemas.common import StreamEvent, AgentStatus

class StreamManager:
    def __init__(self):
        # job_id -> asyncio.Queue of StreamEvent
        self._queues: Dict[str, asyncio.Queue] = {}

    def get_or_create_queue(self, job_id: str) -> asyncio.Queue:
        if job_id not in self._queues:
            self._queues[job_id] = asyncio.Queue()
        return self._queues[job_id]

    async def broadcast_status(self, job_id: str, status: AgentStatus):
        q = self.get_or_create_queue(job_id)
        event = StreamEvent(
            event_type="agent_status",
            job_id=job_id,
            agent_id=status.agent_id,
            state=status.state,
            message=status.message,
            data=status.model_dump()
        )
        await q.put(event)

    async def broadcast_log(self, job_id: str, message: str, agent_id: Optional[str] = None):
        q = self.get_or_create_queue(job_id)
        event = StreamEvent(
            event_type="log",
            job_id=job_id,
            agent_id=agent_id,
            message=message
        )
        await q.put(event)

    async def broadcast_complete(self, job_id: str, report_data: dict):
        q = self.get_or_create_queue(job_id)
        event = StreamEvent(
            event_type="complete",
            job_id=job_id,
            message="Analysis pipeline completed successfully.",
            data=report_data
        )
        await q.put(event)

    async def broadcast_error(self, job_id: str, error_message: str):
        q = self.get_or_create_queue(job_id)
        event = StreamEvent(
            event_type="error",
            job_id=job_id,
            message=error_message
        )
        await q.put(event)

    def cleanup(self, job_id: str):
        if job_id in self._queues:
            del self._queues[job_id]

stream_manager = StreamManager()
