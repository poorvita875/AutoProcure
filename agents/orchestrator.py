"""
agents/orchestrator.py
======================
LangGraph-based orchestrator for AutoProcure AI.

Routing table
─────────────
  "rfq"  →  rfq_node   (RFQAgent)

To add a new agent:
  1. Write the agent class in agents/<name>_agent.py
  2. Add a <name>_node function below
  3. Register: _graph.add_node / _graph.add_edge
  4. Add an elif branch in route_to_agent()
"""

from __future__ import annotations

from typing import Any, TypedDict

from langgraph.graph import END, StateGraph

# ---------------------------------------------------------------------------
# State schema
# ---------------------------------------------------------------------------

class AgentState(TypedDict):
    """Shared state passed between every graph node."""
    intent:     str
    input_data: dict[str, Any]
    result:     dict[str, Any] | None
    error:      str | None


# ---------------------------------------------------------------------------
# Intent classification
# ---------------------------------------------------------------------------

def classify_intent(data: dict[str, Any]) -> str:
    """
    Map raw input data to a routing key.

    Priority order:
      1. Explicit "intent" key in data
      2. Presence of "requirement" key  → "rfq"
      3. Default fallback               → "unknown"
    """
    if "intent" in data:
        return str(data["intent"]).lower().strip()

    if data.get("requirement"):
        return "rfq"

    return "unknown"


# ---------------------------------------------------------------------------
# Router node
# ---------------------------------------------------------------------------

def route_to_agent(state: AgentState) -> str:
    """
    LangGraph conditional-edge resolver.
    Returns the name of the next node to execute.
    """
    intent = state.get("intent", "unknown")

    if intent == "rfq":
        return "rfq"

    return "fallback"


# ---------------------------------------------------------------------------
# Agent nodes
# ---------------------------------------------------------------------------

def rfq_node(state: AgentState) -> AgentState:
    """Execute the RFQAgent pipeline."""
    try:
        from agents.rfq_agent import RFQAgent  # late import to keep graph init fast

        requirement = state["input_data"].get("requirement", "")
        if not requirement:
            err = "requirement is required"
            return {
                **state,
                "result": {"success": False, "error": err},
                "error":  err,
            }

        result = RFQAgent().run(requirement)
        return {**state, "result": result, "error": None}

    except Exception as exc:
        err = f"rfq_node failed: {exc}"
        return {
            **state,
            "result": {"success": False, "error": err},
            "error":  err,
        }


def fallback_node(state: AgentState) -> AgentState:
    """Catch-all for unrecognised intents."""
    err = f"No agent registered for intent: '{state.get('intent', 'unknown')}'"
    return {
        **state,
        "result": {"success": False, "error": err},
        "error":  err,
    }


# ---------------------------------------------------------------------------
# Graph construction (built once at import time)
# ---------------------------------------------------------------------------

def _build_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    # Nodes
    graph.add_node("rfq",      rfq_node)
    graph.add_node("fallback", fallback_node)

    # Conditional routing from the virtual START → agent node
    graph.set_conditional_entry_point(
        route_to_agent,
        {
            "rfq":      "rfq",
            "fallback": "fallback",
        },
    )

    # Every agent node exits to END
    graph.add_edge("rfq",      END)
    graph.add_edge("fallback", END)

    return graph.compile()


_graph = _build_graph()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def run_agent(raw_input: dict[str, Any]) -> dict[str, Any]:
    """
    Main entry point called by FastAPI routes.

    Parameters
    ----------
    raw_input : dict
        Arbitrary key/value payload from the API layer.
        Must contain at least one of:
          - "requirement" (str) → triggers RFQ pipeline
          - "intent" (str)      → explicit override

    Returns
    -------
    dict
        Whatever the resolved agent node placed in state["result"].
    """
    intent = classify_intent(raw_input)

    initial_state: AgentState = {
        "intent":     intent,
        "input_data": raw_input,
        "result":     None,
        "error":      None,
    }

    final_state = _graph.invoke(initial_state)
    return final_state.get("result") or {
        "success": False,
        "error":   final_state.get("error", "unknown error"),
    }
