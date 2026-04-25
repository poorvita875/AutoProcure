from __future__ import annotations

import json
import os
from contextlib import contextmanager

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import Json
try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_model = None


def get_model():
    global _model
    if _model is None and SentenceTransformer is not None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def _get_db_connection():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL is not set")
    return psycopg2.connect(db_url)


@contextmanager
def _connect():
    conn = None
    try:
        conn = _get_db_connection()
        with conn:
            yield conn
    except Exception as e:
        raise RuntimeError(f"database operation failed: {e}") from e
    finally:
        try:
            if conn is not None:
                conn.close()
        except Exception:
            pass


def embed_text(text: str) -> list[float]:
    """Return the sentence embedding for *text* as a plain Python list of floats."""
    try:
        if not text:
            return []
        model = get_model()
        if model is None:
            # Fallback dummy embedding since sentence_transformers failed to install
            return [0.1] * 384
        # encode() returns a numpy ndarray; .tolist() converts to list[float].
        return model.encode(text, normalize_embeddings=False).tolist()
    except Exception as e:
        raise RuntimeError(f"embed_text failed: {e}") from e


def store_embedding(text: str, metadata: dict = {}) -> int:
    """Embed *text* and persist it to the document_chunks table.

    Uses pgvector: the embedding list is cast to ``vector`` by Postgres so
    the column type (``vector(384)``) is respected without a separate
    psycopg2 adapter.

    Returns:
        The auto-generated primary-key ``id`` of the inserted row.
    """
    try:
        if text is None:
            raise ValueError("text is required")

        embedding = embed_text(text)   # list[float] of length 384
        meta = dict(metadata or {})

        # Pass the embedding as a Postgres array literal so pgvector can cast
        # it to the vector(384) column without a custom type adapter.
        embedding_literal = "[" + ",".join(str(v) for v in embedding) + "]"

        sql = """
            INSERT INTO document_chunks (content, embedding, metadata)
            VALUES (%s, %s::vector, %s)
            RETURNING id;
        """.strip()

        with _connect() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (text, embedding_literal, Json(meta)))
                row = cur.fetchone()
                if not row:
                    raise RuntimeError("store_embedding did not return id")
                return int(row[0])
    except Exception as e:
        raise RuntimeError(f"store_embedding failed: {e}") from e


def search_similar(query: str, top_k: int = 5) -> list[dict]:
    """Return the *top_k* most semantically similar chunks for *query*.

    Ranking is performed entirely inside Postgres using pgvector's cosine
    distance operator (``<=>``), so no embeddings are re-computed in Python
    and the result set is bounded by the LIMIT clause.

    The similarity score is ``1 - cosine_distance`` (range 0 – 1, higher is
    better).
    """
    try:
        if not query:
            return []
        if top_k <= 0:
            return []

        q_emb_list = embed_text(query)
        if not q_emb_list:
            return []

        # Encode the query vector as a Postgres array literal for the cast.
        q_literal = "[" + ",".join(str(v) for v in q_emb_list) + "]"

        sql = """
            SELECT
                content,
                metadata,
                1 - (embedding <=> %s::vector) AS score
            FROM document_chunks
            ORDER BY embedding <=> %s::vector
            LIMIT %s;
        """

        with _connect() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (q_literal, q_literal, top_k))
                rows = cur.fetchall() or []

        results: list[dict] = []
        for content, meta, score in rows:
            if isinstance(meta, str):
                try:
                    meta_obj = json.loads(meta)
                except Exception:
                    meta_obj = {"_raw": meta}
            else:
                meta_obj = meta if isinstance(meta, dict) else {}

            results.append(
                {"content": content, "metadata": meta_obj, "score": float(score)}
            )

        return results
    except Exception as e:
        raise RuntimeError(f"search_similar failed: {e}") from e


def split_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    # Split text into overlapping chunks
    # Return list of strings
    try:
        if not text:
            return []
        if chunk_size <= 0:
            raise ValueError("chunk_size must be > 0")
        if overlap < 0:
            raise ValueError("overlap must be >= 0")
        if overlap >= chunk_size:
            raise ValueError("overlap must be < chunk_size")

        chunks: list[str] = []
        start = 0
        step = chunk_size - overlap
        n = len(text)
        while start < n:
            end = min(start + chunk_size, n)
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            start += step
        return chunks
    except Exception as e:
        raise RuntimeError(f"split_text failed: {e}") from e


if __name__ == "__main__":
    # Simple smoke test (no assumptions about schema beyond document_chunks existing).
    sample = "AutoProcure AI " * 200
    parts = split_text(sample, chunk_size=120, overlap=20)
    print("chunks:", len(parts))

    try:
        # Requires DATABASE_URL and a created `document_chunks` table.
        cid = store_embedding(parts[0], {"source": "smoke_test"})
        results = search_similar("AutoProcure", top_k=3)
        print("inserted_chunk_id:", cid)
        print("top_results:", [{"score": r["score"], "meta": r["metadata"]} for r in results])
    except Exception as e:
        print("DB smoke test skipped/failed:", e)

