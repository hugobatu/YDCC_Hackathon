import asyncio
import sys
import os
import logging

# Add the current directory to sys.path to ensure 'app' can be imported
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.simulation import simulation_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    logger.info("Starting Simulation Service...")
    await simulation_service.start()
    
    # Keep the script running forever
    try:
        # Wait forever
        await asyncio.Event().wait()
    except asyncio.CancelledError:
        pass
    finally:
        await simulation_service.stop()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        # Handle manual stop (Ctrl+C)
        # Note: asyncio.run() creates a new loop, but we need to stop the service cleanly.
        # Since simulation_service is global, we can't easily re-enter the loop to stop it if the loop is closed.
        # But simulation_service.stop() is async.
        # The finally block in main() handles it if we use asyncio.run properly context management, 
        # but KeyboardInterrupt usually breaks out.
        pass
