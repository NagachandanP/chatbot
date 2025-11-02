from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from chatbot import get_response  # assuming chatbot.py has get_response()

app = FastAPI()

# Serve static files (HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def serve_homepage():
    with open("static/index.html", "r") as f:
        return f.read()


@app.post("/chat")
async def chat_api(request: Request):
    data = await request.json()
    user_message = data.get("message", "")
    
    # 🌟 CORRECTION: Await the asynchronous function call
    bot_reply = await get_response(user_message) 
    
    return JSONResponse(content={"reply": bot_reply})