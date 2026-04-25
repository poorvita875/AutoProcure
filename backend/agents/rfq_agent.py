import uuid
import json
from datetime import datetime


class RFQAgent:
    """
    Autonomous RFQ generation agent.
    Parses a plain-English requirement, generates a formal RFQ email,
    matches top vendors, and returns a structured result.
    """

    def __init__(self, vendor_db=None):
        # vendor_db can be injected (e.g. from a DB or FAISS store).
        # Defaults to a small in-memory mock so the server runs standalone.
        self.vendor_db = vendor_db or self._default_vendor_db()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def run(self, requirement: str) -> dict:
        """
        Main entry point.  Takes a free-text requirement and returns a
        structured dict ready to be serialised as JSON.
        """
        try:
            rfq_id = f"RFQ-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

            # 1. Parse intent from requirement text
            intent = self._parse_intent(requirement)

            # 2. Generate the formal RFQ email body
            rfq_text = self._generate_rfq_text(intent, rfq_id)

            # 3. Match top vendors
            vendors = self._match_vendors(intent)

            return {
                "success": True,
                "rfq_id": rfq_id,
                "rfq_text": rfq_text,
                "item_name": intent.get("item_name"),
                "quantity": intent.get("quantity"),
                "unit": intent.get("unit"),
                "vendors_matched": len(vendors),
                "vendor_names": [v["name"] for v in vendors],
                "top_vendors": vendors,   # ← required by frontend
                "error": None,
            }

        except Exception as exc:
            return {
                "success": False,
                "rfq_id": None,
                "rfq_text": None,
                "item_name": None,
                "quantity": None,
                "unit": None,
                "vendors_matched": 0,
                "vendor_names": [],
                "top_vendors": [],
                "error": str(exc),
            }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _parse_intent(self, requirement: str) -> dict:
        """
        Lightweight keyword-based intent parser.
        Replace with an LLM call (e.g. Groq / OpenAI) for production.
        """
        req_lower = requirement.lower()

        # --- quantity ---
        import re
        qty_match = re.search(r"(\d[\d,]*)\s*(units?|pcs?|pieces?|nos?|sets?|kgs?|tonnes?|ltrs?|liters?|boxes?)?", req_lower)
        quantity = int(qty_match.group(1).replace(",", "")) if qty_match else None
        unit = qty_match.group(2).rstrip("s") if (qty_match and qty_match.group(2)) else "unit"

        # --- item ---
        item_name = requirement.strip()   # fallback — use raw text
        for kw in ["need", "require", "want", "buy", "purchase", "order", "get"]:
            if kw in req_lower:
                after = req_lower.split(kw, 1)[1].strip()
                item_name = after.split("deliver")[0].split("by")[0].strip().title()
                break

        # --- deadline ---
        deadline = None
        for kw in ["by", "before", "until"]:
            if kw in req_lower:
                deadline = req_lower.split(kw, 1)[1].strip().split(".")[0].strip()
                break

        # --- category inference ---
        category = "General"
        cat_map = {
            "bearing": "Industrial Components",
            "steel": "Raw Materials",
            "circuit": "Electronics",
            "motor": "Electrical",
            "pump": "Machinery",
            "valve": "Fluid Control",
            "pipe": "Plumbing",
            "sensor": "Instrumentation",
            "software": "Technology",
        }
        for keyword, cat in cat_map.items():
            if keyword in req_lower:
                category = cat
                break

        return {
            "item_name": item_name,
            "quantity": quantity,
            "unit": unit,
            "deadline": deadline,
            "category": category,
            "raw": requirement,
        }

    def _generate_rfq_text(self, intent: dict, rfq_id: str) -> str:
        item = intent.get("item_name", "the specified item")
        qty = intent.get("quantity", "TBD")
        unit = intent.get("unit", "units")
        deadline = intent.get("deadline", "as soon as possible")

        return f"""REQUEST FOR QUOTATION
RFQ ID  : {rfq_id}
Date    : {datetime.now().strftime("%B %d, %Y")}
─────────────────────────────────────────────

Dear Vendor,

We request your best quotation for the following requirement:

  Item        : {item}
  Quantity    : {qty} {unit}
  Delivery By : {deadline}

Please include in your response:
  1. Unit price (inclusive of all taxes)
  2. Lead time / delivery schedule
  3. Minimum order quantity (if applicable)
  4. Payment terms
  5. Warranty / quality certifications

Kindly submit your quote within 24 hours of receipt.

Regards,
Procurement Team — AutoProcure AI
"""

    def _match_vendors(self, intent: dict) -> list:
        """
        Score and rank vendors from vendor_db.
        Replace scoring logic with FAISS similarity search for production.
        """
        import random

        category = intent.get("category", "General")
        scored = []

        for v in self.vendor_db:
            # Exact category match boosts score
            base_score = 60 if v.get("category") == category else 40
            # Add some deterministic jitter based on vendor id so results are stable
            jitter = (hash(v["id"]) % 20)
            score = base_score + jitter

            risk_score = v.get("risk_score", 50)
            if risk_score < 30:
                risk_level = "Low"
            elif risk_score < 60:
                risk_level = "Medium"
            else:
                risk_level = "High"

            scored.append({
                **v,
                "match_score": score,
                "risk_level": risk_level,
                "risk_score": risk_score,
            })

        # Sort by match score descending, return top 3
        scored.sort(key=lambda x: x["match_score"], reverse=True)
        return scored[:3]

    # ------------------------------------------------------------------
    # Default in-memory vendor database (used when no DB is injected)
    # ------------------------------------------------------------------

    @staticmethod
    def _default_vendor_db() -> list:
        return [
            {"id": "v1", "name": "ABC Bearings Ltd",    "category": "Industrial Components", "risk_score": 18},
            {"id": "v2", "name": "XYZ Parts Co",         "category": "Industrial Components", "risk_score": 42},
            {"id": "v3", "name": "LMN Industries",       "category": "Raw Materials",          "risk_score": 35},
            {"id": "v4", "name": "Prime Electronics",    "category": "Electronics",            "risk_score": 22},
            {"id": "v5", "name": "Vertex Machinery",     "category": "Machinery",              "risk_score": 55},
            {"id": "v6", "name": "Global Steels",        "category": "Raw Materials",          "risk_score": 28},
            {"id": "v7", "name": "TechFlow Solutions",   "category": "Technology",             "risk_score": 15},
            {"id": "v8", "name": "FluidMaster Pvt Ltd",  "category": "Fluid Control",          "risk_score": 70},
        ]
