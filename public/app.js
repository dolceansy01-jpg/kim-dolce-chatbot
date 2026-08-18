const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const typing = document.getElementById("typing");
const newChatBtn = document.getElementById("newChatBtn");
const welcome = document.getElementById("welcome");
const suggestions = document.querySelectorAll(".suggestion");

let messages = [];

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function addMessage(text, type) {
  if (welcome) {
    welcome.style.display = "none";
  }

  const message = document.createElement("div");
  message.className = `message ${type}`;

  const content = document.createElement("div");
  content.className = "message-content";

  content.textContent = text;

  const time = document.createElement("span");
  time.className = "message-time";
  time.textContent = getTime();

  content.appendChild(time);
  message.appendChild(content);
  chat.appendChild(message);

  chat.scrollTop = chat.scrollHeight;

  messages.push({
    role: type === "user" ? "user" : "assistant",
    content: text
  });
}

function showTyping() {
  typing.classList.remove("hidden");
  chat.scrollTop = chat.scrollHeight;
}

function hideTyping() {
  typing.classList.add("hidden");
}

async function sendMessage() {
  const message = messageInput.value.trim();

  if (!message) return;

  addMessage(message, "user");

  messageInput.value = "";
  messageInput.style.height = "auto";

  sendBtn.disabled = true;
  showTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    const data = await response.json();

    hideTyping();

    if (!response.ok) {
      throw new Error(data.error || "Erreur serveur");
    }

    addMessage(data.reply, "ai");

  } catch (error) {
    hideTyping();

    addMessage(
      "Désolé, une erreur est survenue. Vérifie que le serveur et l'API AI sont correctement configurés.",
      "ai"
    );

    console.error(error);

  } finally {
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height =
    Math.min(messageInput.scrollHeight, 140) + "px";
});

suggestions.forEach((button) => {
  button.addEventListener("click", () => {
    messageInput.value = button.textContent.trim();
    messageInput.focus();
    messageInput.dispatchEvent(new Event("input"));
  });
});

newChatBtn.addEventListener("click", () => {
  chat.innerHTML = "";

  if (welcome) {
    chat.appendChild(welcome);
    welcome.style.display = "block";
  }

  messages = [];
  messageInput.value = "";
  messageInput.style.height = "auto";
  messageInput.focus();
});

messageInput.focus();
