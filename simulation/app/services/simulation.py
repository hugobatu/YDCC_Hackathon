import asyncio
import random
import logging
import math
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from db.connection import SessionLocal
from models.models import Pool, WaterMeasurement
from services.engine import risk_engine

logger = logging.getLogger(__name__)


class SimulationService:
    """
    IoT Water Sensor Simulation Service
    - Insert data every 5 minutes
    - Random Walk + Mean Reversion
    - Diurnal (day/night) cycle
    - Event-based anomalies
    """
    
    INTERVAL_SECONDS = 300  # 5 minutes

    # Ideal biological targets (SAFE ZONE)
    IDEAL_RANGES = {
        "tom": {
            "temp": 29.0,
            "ph": 8.0,
            "do": 6.5,
            "ammonia": 0.05,
            "turbidity": 30.0,
        },
        "ca_tra": {
            "temp": 28.0,
            "ph": 7.5,
            "do": 5.0,
            "ammonia": 0.1,
            "turbidity": 80.0,
        },
        "default": {
            "temp": 28.0,
            "ph": 7.5,
            "do": 5.5,
            "ammonia": 0.05,
            "turbidity": 40.0,
        },
    }

    # Hard biological limits
    LIMITS = {
        "temp": (15.0, 40.0),
        "ph": (4.0, 10.0),
        "do": (0.5, 15.0),
        "ammonia": (0.0, 5.0),
        "turbidity": (0.0, 500.0),
    }

    def __init__(self):
        self.running = False
        self.task = None

    async def start(self):
        if self.running:
            return
        self.running = True
        logger.info("🌊 Simulation Service STARTED (5-minute interval)")
        self.task = asyncio.create_task(self._run_loop())

    async def stop(self):
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("🛑 Simulation Service STOPPED")

    async def _run_loop(self):
        while self.running:
            try:
                self._generate_for_all_pools()
            except Exception as e:
                logger.exception(f"Simulation loop error: {e}")
            await asyncio.sleep(self.INTERVAL_SECONDS)

    # ===================== CORE LOGIC =====================

    def _generate_for_all_pools(self):
        db: Session = SessionLocal()
        try:
            pools = db.query(Pool).all()
            if not pools:
                return

            now = datetime.now(timezone.utc)
            hour = now.hour
            diurnal = math.sin(2 * math.pi * hour / 24)

            for pool in pools:
                profile = self.IDEAL_RANGES.get(
                    pool.species_id, self.IDEAL_RANGES["default"]
                )

                last = (
                    db.query(WaterMeasurement)
                    .filter(WaterMeasurement.pool_id == pool.pool_id)
                    .order_by(WaterMeasurement.created_at.desc())
                    .first()
                )

                if last:
                    data = self._next_values(last, profile, diurnal)
                else:
                    data = self._initial_values(profile)

                measurement = WaterMeasurement(
                    pool_id=pool.pool_id,
                    temperature=round(data["temperature"], 2),
                    ph=round(data["ph"], 2),
                    dissolved_oxygen=round(data["dissolved_oxygen"], 2),
                    amonia=round(data["amonia"], 4),
                    turbidity=round(data["turbidity"], 2),
                    created_at=now,
                )
                db.add(measurement)

            db.commit()
            logger.info(
                f"✅ Generated data for {len(pools)} pools at {now.strftime('%H:%M:%S')} UTC"
            )

        except Exception as e:
            db.rollback()
            logger.exception(f"DB error in simulation: {e}")
        finally:
            db.close()

    # ===================== VALUE GENERATION =====================

    def _next_values(self, last, profile, diurnal):
        alpha = 0.1  # mean reversion strength

        temp = self._drift(last.temperature, profile["temp"], alpha, 0.2)
        do = self._drift(last.dissolved_oxygen, profile["do"], alpha, 0.3)
        ph = self._drift(last.ph, profile["ph"], alpha, 0.05)
        ammonia = self._drift(last.amonia, profile["ammonia"], alpha, 0.01)
        turbidity = self._drift(last.turbidity, profile["turbidity"], alpha, 2.0)

        # Day/Night cycle
        temp += diurnal * 0.5
        do -= diurnal * 0.4

        # Event-based anomaly (rain / oxygen crash)
        if random.random() < 0.01:
            turbidity += random.uniform(30, 80)
            ph -= random.uniform(0.3, 0.8)

        if random.random() < 0.01:
            do -= random.uniform(1.0, 2.5)

        return {
            "temperature": self._clamp(temp, *self.LIMITS["temp"]),
            "ph": self._clamp(ph, *self.LIMITS["ph"]),
            "dissolved_oxygen": self._clamp(do, *self.LIMITS["do"]),
            "amonia": self._clamp(ammonia, *self.LIMITS["ammonia"]),
            "turbidity": self._clamp(turbidity, *self.LIMITS["turbidity"]),
        }

    def _initial_values(self, profile):
        return {
            "temperature": profile["temp"] + random.uniform(-0.5, 0.5),
            "ph": profile["ph"] + random.uniform(-0.2, 0.2),
            "dissolved_oxygen": profile["do"] + random.uniform(-0.5, 0.5),
            "amonia": profile["ammonia"] + random.uniform(0, 0.02),
            "turbidity": profile["turbidity"] + random.uniform(-5, 5),
        }

    def _drift(self, current, target, alpha, noise_scale):
        noise = random.gauss(0, noise_scale)
        pull = alpha * (target - current)
        return current + pull + noise

    @staticmethod
    def _clamp(val, min_v, max_v):
        return max(min_v, min(max_v, val))

    # ===================== PUBLIC API =====================

    def seed_new_pool(self, pool_id):
        db: Session = SessionLocal()
        try:
            pool = db.query(Pool).filter(Pool.pool_id == pool_id).first()
            if not pool:
                return

            profile = self.IDEAL_RANGES.get(
                pool.species_id, self.IDEAL_RANGES["default"]
            )

            measurement = WaterMeasurement(
                pool_id=pool.pool_id,
                temperature=profile["temp"],
                ph=profile["ph"],
                dissolved_oxygen=profile["do"],
                amonia=profile["ammonia"],
                turbidity=profile["turbidity"],
                created_at=datetime.now(timezone.utc),
            )
            db.add(measurement)
            db.commit()
            logger.info(f"🌱 Seeded initial data for pool {pool_id}")

        except Exception as e:
            db.rollback()
            logger.exception(f"Seed new pool error: {e}")
        finally:
            db.close()


# Singleton
simulation_service = SimulationService()