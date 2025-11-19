from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage
from app.agent.tools import get_user_tools
import os
from dotenv import load_dotenv

load_dotenv()

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]

def create_user_graph(user_id: int):
    user_tools = get_user_tools(user_id)

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in .env file")

    llm = ChatGoogleGenerativeAI(
        model="models/gemini-flash-latest", 
        google_api_key=api_key,
        temperature=0
    )

    llm_with_tools = llm.bind_tools(user_tools)

    # --- THE NEW INTELLIGENCE ---
    # This prompt forces the AI to "Translate" natural language into IDs
    system_prompt = """You are a smart Todo Assistant.
    
    CRITICAL RULES:
    1. When the user asks to Update or Delete a task by NAME (e.g., "Delete the milk task") or by NUMBER (e.g., "Delete task #1"):
       - First, CALL 'read_todos' to see the list.
       - Look for the task that matches the name or the visual number (#1, #2).
       - Find the 'Real ID' associated with it.
       - ONLY then call 'delete_todo' or 'update_todo' using that Real ID.
       
    2. Never guess the ID. Always read the list first.
    """

    def chatbot(state: AgentState):
        # We prepend the system message to the history so the AI sees it first
        messages = [SystemMessage(content=system_prompt)] + state["messages"]
        return {"messages": [llm_with_tools.invoke(messages)]}

    workflow = StateGraph(AgentState)
    workflow.add_node("agent", chatbot)
    workflow.add_node("tools", ToolNode(user_tools)) 
    workflow.add_edge(START, "agent") 
    workflow.add_conditional_edges("agent", tools_condition)
    workflow.add_edge("tools", "agent")

    return workflow.compile()