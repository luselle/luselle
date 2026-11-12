const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", event => {
    event.preventDefault();
    const message = document.getElementById("formMessage");
    message.textContent = "La pantalla está preparada. El inicio de sesión se activará al conectar el backend PHP y MySQL.";
  });
}

/* =========================================
   CHATBOT LUSELLE - CONEXIÓN CON GROQ
========================================= */

const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotWindow = document.getElementById("chatbotWindow");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotToggleIcon = document.getElementById("chatbotToggleIcon");

const chatbotForm = document.getElementById("chatbotForm");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotMessages = document.getElementById("chatbotMessages");
const chatbotSend = document.getElementById("chatbotSend");

const CHATBOT_API = "https://luselle-api.luselle7.workers.dev/api/chat";

let chatbotHistory = [];
let chatbotIsLoading = false;

// Abrir y cerrar el chatbot
function toggleChatbot(open) {
    chatbotWindow.hidden = !open;
    chatbotToggle.setAttribute("aria-expanded", String(open));
    chatbotToggleIcon.textContent = open ? "×" : "💬";

    if (open) {
        chatbotInput.focus();
    }
}

if (chatbotToggle && chatbotWindow) {
    chatbotToggle.addEventListener("click", () => {
        toggleChatbot(chatbotWindow.hidden);
    });
}

if (chatbotClose) {
    chatbotClose.addEventListener("click", () => {
        toggleChatbot(false);
    });
}

// Agregar mensajes sin interpretar HTML
function addChatMessage(text, sender) {
    const message = document.createElement("div");

    message.classList.add("chat-message");
    message.classList.add(
        sender === "user" ? "user-message" : "bot-message"
    );

    message.textContent = text;

    chatbotMessages.appendChild(message);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    return message;
}

// Indicador de espera
function showTyping() {
    const typing = document.createElement("div");

    typing.className = "chatbot-typing";
    typing.textContent = "Luselle está escribiendo...";

    chatbotMessages.appendChild(typing);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    return typing;
}

// Enviar mensaje
if (chatbotForm) {
    chatbotForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userMessage = chatbotInput.value.trim();

        if (!userMessage || chatbotIsLoading) return;

        chatbotIsLoading = true;
        chatbotSend.disabled = true;
        chatbotInput.disabled = true;

        addChatMessage(userMessage, "user");

        chatbotInput.value = "";

        chatbotHistory.push({
            role: "user",
            content: userMessage
        });

        const typing = showTyping();

        try {
            const response = await fetch(CHATBOT_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: chatbotHistory.slice(-10)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "No fue posible consultar al asistente."
                );
            }

            if (!data.reply) {
                throw new Error("El asistente no devolvió una respuesta.");
            }

            chatbotHistory.push({
                role: "assistant",
                content: data.reply
            });

            addChatMessage(data.reply, "assistant");

            // Conservar únicamente los últimos 10 mensajes
            chatbotHistory = chatbotHistory.slice(-10);

        } catch (error) {
            console.error("Error en el chatbot:", error);

            addChatMessage(
                "Lo siento, no pude responder en este momento. Inténtalo nuevamente. 💗",
                "assistant"
            );

            // Retirar el mensaje que no pudo enviarse
            chatbotHistory.pop();

        } finally {
            typing.remove();

            chatbotIsLoading = false;
            chatbotSend.disabled = false;
            chatbotInput.disabled = false;

            chatbotInput.focus();
        }
    });
}