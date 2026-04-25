"""
agents/rfq_agent.py
===================
RFQ Agent for AutoProcure AI.

Pipeline
--------
1. Receive plain-English procurement requirement ("product_request")
2. Extract intent — item_name, quantity, unit, category      ← Groq LLM
3. Fetch matching vendors from PostgreSQL via db_tools
4. Generate a professional RFQ email                          ← Groq LLM
5. Persist RFQ to rfqs table
6. Audit-log via db_tools.log_agent_action
7. Return structured result dict — never raises

Orchestrator contract
---------------------
  Input key : "product_request"   (set by orchestrator.rfq_node)
  Class name: RfqAgent            (imported as: from agents.rfq_agent import RfqAgent)
"""

from __future__ import annotations

import json
import os
import uuid

from dotenv import load_dotenv
from groq import Groq

from agents.tools import db_tools


class RfqAgent:

    AGENT_NAME = "RfqAgent"
    MODEL      = "llama-3.1-70b-versatile"

    # ──────────────────────────────────────────────────────────────────────
    # Lifecycle
    # ──────────────────────────────────────────────────────────────────────

    def __init__(self) -> None:
        load_dotenv()
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set")
        self.client = Groq(api_key=api_key)

    # ──────────────────────────────────────────────────────────────────────
    # Step 1 – Intent extraction
    # ──────────────────────────────────────────────────────────────────────

    def extract_intent(self, product_request: str) -> dict:
        """
        Use Groq to parse a plain-English procurement request into structured
        fields consumed by the rest of the pipeline.

        Returns
        -------
        dict with keys: item_name, quantity (int|None), unit (str|None),
                        category (Manufacturing|Pharma|Construction|General)

        Falls back to a safe default when the LLM response cannot be parsed.
        """
        try:
            prompt = (
                f"Extract procurement intent. Return ONLY valid JSON with:\n"
                f"item_name, quantity (int or null), unit (string or null), \n"
                f"category (one of: Manufacturing, Pharma, Construction, General)\n\n"
                f"Input: {product_request}"
            )

            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.MODEL,
                temperature=0.1,
            )

            raw = response.choices[0].message.content.strip()

            # Strip optional markdown code-fence wrappers
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]

            return json.loads(raw.strip())

        except Exception:
            return {
                "item_name": product_request,
                "quantity":  None,
                "unit":      None,
                "category":  "General",
            }

    # ──────────────────────────────────────────────────────────────────────
    # Step 2 – Vendor matching
    # ──────────────────────────────────────────────────────────────────────

    def get_matching_vendors(self, category: str) -> list[dict]:
        """
        Query the vendors table for suppliers matching *category* OR 'General'.
        Returns up to 5 vendors ordered by ascending risk_score (safest first).

        Uses db_tools.get_db_connection() directly — the cursor is managed
        here because this query is not wrapped in a db_tools helper.

        Falls back to 3 hardcoded mock vendors when the DB is unavailable
        or returns no rows.
        """
        try:
            conn   = db_tools.get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, name, contact_email, category, risk_level
                FROM   vendors
                WHERE  category = %s OR category = 'General'
                ORDER  BY risk_score ASC
                LIMIT  5
                """,
                (category,),
            )
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            if not rows:
                raise ValueError("No matching vendors returned by DB")

            return [
                {
                    "id":            row[0],
                    "name":          row[1],
                    "contact_email": row[2],
                    "category":      row[3],
                    "risk_level":    row[4],
                }
                for row in rows
            ]

        except Exception:
            # Always return something actionable so the pipeline keeps running
            return [
                {
                    "id": 1,
                    "name": "SteelCo India",
                    "contact_email": "billing@steelco.in",
                    "category": "Manufacturing",
                    "risk_level": "Low",
                },
                {
                    "id": 2,
                    "name": "BuildRight Pvt",
                    "contact_email": "supply@buildright.in",
                    "category": "Construction",
                    "risk_level": "Low",
                },
                {
                    "id": 3,
                    "name": "MetalWorks Ltd",
                    "contact_email": "orders@metalworks.in",
                    "category": "General",
                    "risk_level": "Medium",
                },
            ]

    # ──────────────────────────────────────────────────────────────────────
    # Step 3 – RFQ email generation
    # ──────────────────────────────────────────────────────────────────────

    def generate_rfq_text(
        self,
        product_request: str,
        intent: dict,
        vendors: list[dict],
    ) -> str:
        """
        Use Groq to draft a concise, professional RFQ email.
        Falls back to a deterministic template when the LLM is unavailable.
        """
        try:
            vendor_names = ", ".join(v["name"] for v in vendors)
            item_name    = intent.get("item_name", product_request)
            quantity     = intent.get("quantity") or "as required"
            unit         = intent.get("unit")     or "units"

            prompt = (
                f"You are a procurement manager. Write a professional RFQ email.\n\n"
                f"Requirement: {product_request}\n"
                f"Item: {item_name}\n"
                f"Quantity: {quantity} {unit}\n"
                f"Vendors to contact: {vendor_names}\n\n"
                f"Write the email with:\n"
                f"- Subject line\n"
                f"- Professional greeting\n"
                f"- Clear description of what is needed\n"
                f"- Request for: unit price, delivery timeline, payment terms, minimum order\n"
                f"- Response deadline: 7 days from today\n"
                f"- Sign off as: AutoProcure AI Procurement Team\n\n"
                f"Keep it under 200 words. Be professional and specific."
            )

            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.MODEL,
                temperature=0.7,
            )

            return response.choices[0].message.content.strip()

        except Exception:
            item_name = intent.get("item_name", product_request)
            return (
                f"Subject: Request for Quotation – {item_name}\n\n"
                f"Dear Valued Vendors,\n\n"
                f"We are writing to request a quotation for the following requirement:\n"
                f"{product_request}\n\n"
                f"Please provide your unit price, delivery timeline, payment terms, "
                f"and minimum order quantity within 7 days of receiving this email.\n\n"
                f"Best Regards,\n"
                f"AutoProcure AI Procurement Team"
            )

    # ──────────────────────────────────────────────────────────────────────
    # Step 4 – Persistence
    # ──────────────────────────────────────────────────────────────────────

    def save_rfq(self, product_request: str, rfq_text: str) -> int:
        """
        Insert the generated RFQ into the rfqs table with status 'pending'.
        Returns the new row's id.

        Uses db_tools.get_db_connection() directly — db_tools does not expose
        an insert_rfq helper, so the SQL is executed via raw psycopg2.

        Raises RuntimeError on any DB failure (caught in run()).
        """
        try:
            conn   = db_tools.get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO rfqs (plain_text_request, generated_rfq, status)
                VALUES (%s, %s, 'pending')
                RETURNING id
                """,
                (product_request, rfq_text),
            )
            new_id = cursor.fetchone()[0]
            conn.commit()
            cursor.close()
            conn.close()
            return int(new_id)

        except Exception as exc:
            raise RuntimeError(f"save_rfq failed: {exc}") from exc

    # ──────────────────────────────────────────────────────────────────────
    # Main entry point
    # ──────────────────────────────────────────────────────────────────────

    def run(self, product_request: str) -> dict:
        """
        Orchestrate the full RFQ pipeline.

        Called by orchestrator.rfq_node via:
            result = RfqAgent().run(product_request)

        Returns a fully structured dict — never raises.
        """
        try:
            # 1. Validate
            if not product_request or not product_request.strip():
                raise ValueError("product_request cannot be empty")

            # 2. Track task (fire-and-forget — never block the pipeline)
            task_id = str(uuid.uuid4())
            try:
                db_tools.insert_agent_task(
                    task_id,
                    self.AGENT_NAME,
                    {"product_request": product_request},
                )
            except Exception:
                pass

            # 3. Extract intent
            intent   = self.extract_intent(product_request)
            category = intent.get("category") or "General"

            # 4. Match vendors
            vendors = self.get_matching_vendors(category)

            # 5. Generate RFQ email
            rfq_text = self.generate_rfq_text(product_request, intent, vendors)

            # 6. Persist RFQ (degrade gracefully if DB is down)
            try:
                rfq_id = self.save_rfq(product_request, rfq_text)
            except Exception:
                rfq_id = -1

            # 7. Build result
            result = {
                "success":         True,
                "rfq_id":          rfq_id,
                "rfq_text":        rfq_text,
                "item_name":       intent.get("item_name"),
                "quantity":        intent.get("quantity"),
                "unit":            intent.get("unit"),
                "vendors_matched": len(vendors),
                "vendor_names":    [v["name"] for v in vendors],
                "error":           None,
            }

            # 8. Audit log (fire-and-forget)
            try:
                db_tools.update_agent_task(task_id, result, "done")
                db_tools.log_agent_action(
                    self.AGENT_NAME,
                    "rfq_generated",
                    json.dumps({
                        "rfq_id":          rfq_id,
                        "vendors_matched": len(vendors),
                        "item_name":       intent.get("item_name"),
                    }),
                )
            except Exception:
                pass

            return result

        except Exception as exc:
            return {
                "success":  False,
                "error":    str(exc),
                "rfq_text": None,
            }


# ──────────────────────────────────────────────────────────────────────────────
# Smoke test
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    agent  = RfqAgent()
    result = agent.run("Need 200 TMT steel rods for construction project")
    print(json.dumps(result, indent=2))
