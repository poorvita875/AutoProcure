"""
agents/tools/db_tools.py
========================
Shared database utilities for all AutoProcure AI agents.
Provides:
  - get_db_connection()       → psycopg2 connection
  - log_agent_action(...)     → writes to audit_log table
  - insert_agent_task(...)    → creates a row in agent_tasks
  - update_agent_task(...)    → updates status/output in agent_tasks
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone

import psycopg2
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Connection helper
# ---------------------------------------------------------------------------

def get_db_connection() -> psycopg2.extensions.connection:
    """
    Return a live psycopg2 connection using DATABASE_URL from the environment.
    Falls back to individual PG_* env-vars if DATABASE_URL is absent.

    Raises RuntimeError when no valid connection parameters are found.
    """
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        conn = psycopg2.connect(database_url)
    else:
        host     = os.getenv("PG_HOST",     "localhost")
        port     = os.getenv("PG_PORT",     "5432")
        dbname   = os.getenv("PG_DB",       "autoprocure")
        user     = os.getenv("PG_USER",     "postgres")
        password = os.getenv("PG_PASSWORD", "")
        conn = psycopg2.connect(
            host=host, port=port, dbname=dbname,
            user=user, password=password
        )
    conn.autocommit = False
    return conn


# ---------------------------------------------------------------------------
# Audit log
# ---------------------------------------------------------------------------

def log_agent_action(agent_name: str, action: str, result: str) -> None:
    """
    Append a row to the audit_log table.

    Table DDL (must exist):
        CREATE TABLE IF NOT EXISTS audit_log (
            id          SERIAL PRIMARY KEY,
            agent_name  TEXT        NOT NULL,
            action      TEXT        NOT NULL,
            result      TEXT,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

    Silently swallows all exceptions so callers are never blocked.
    """
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO audit_log (agent_name, action, result, created_at)
            VALUES (%s, %s, %s, %s)
            """,
            (agent_name, action, str(result), datetime.now(tz=timezone.utc)),
        )
        conn.commit()
        cursor.close()
        conn.close()
    except Exception:
        # Never surface audit failures to callers
        pass


# ---------------------------------------------------------------------------
# Agent task tracking
# ---------------------------------------------------------------------------

def insert_agent_task(task_id: str, agent_name: str, input_data: dict) -> int:
    """
    Create a new task row in agent_tasks and return its surrogate PK.

    Table DDL (must exist):
        CREATE TABLE IF NOT EXISTS agent_tasks (
            id          SERIAL PRIMARY KEY,
            task_id     TEXT        NOT NULL UNIQUE,
            agent_name  TEXT        NOT NULL,
            input_data  JSONB,
            output_data JSONB,
            status      TEXT        NOT NULL DEFAULT 'pending',
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO agent_tasks (task_id, agent_name, input_data, status, created_at, updated_at)
            VALUES (%s, %s, %s::jsonb, 'pending', %s, %s)
            RETURNING id
            """,
            (
                task_id,
                agent_name,
                json.dumps(input_data),
                datetime.now(tz=timezone.utc),
                datetime.now(tz=timezone.utc),
            ),
        )
        row = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return row[0] if row else -1
    except Exception as exc:
        raise RuntimeError(f"insert_agent_task failed: {exc}") from exc


def update_agent_task(task_id: str, output_data: dict, status: str) -> None:
    """
    Update the output and status of an existing task row.
    """
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE agent_tasks
            SET    output_data = %s::jsonb,
                   status      = %s,
                   updated_at  = %s
            WHERE  task_id     = %s
            """,
            (
                json.dumps(output_data),
                status,
                datetime.now(tz=timezone.utc),
                task_id,
            ),
        )
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as exc:
        raise RuntimeError(f"update_agent_task failed: {exc}") from exc
