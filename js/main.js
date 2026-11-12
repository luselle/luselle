
/* =========================================
   MENÚ DE NAVEGACIÓN
========================================= */

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


/* =========================================
   AÑO AUTOMÁTICO
========================================= */

const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}


/* =========================================
   CARGAR SERVICIOS DESDE CLOUDFLARE D1
========================================= */

async function loadPublicServices() {
    const container = document.getElementById("publicServices");

    if (!container) return;

    try {
        container.innerHTML = `
            <p class="service-loading">Cargando servicios...</p>
        `;

        const data = await window.Luselle.api("/api/services");

        const services = data.services || [];

        if (services.length === 0) {
            container.innerHTML = `
                <p class="service-loading">
                    Actualmente no hay servicios disponibles.
                </p>
            `;
            return;
        }

        container.innerHTML = services.map((service, index) => `
            <article class="service-card">

                <span class="service-number">
                    ${(index + 1).toString().padStart(2, "0")}
                </span>

                <h3 class="service-name">
                    ${window.Luselle.escape(service.name)}
                </h3>

                <p class="service-description">
                    ${window.Luselle.escape(
                        service.description || "Servicio de belleza y cuidado capilar."
                    )}
                </p>

                <p class="service-price">
                    ${window.Luselle.money(service.price)}
                </p>

            </article>
        `).join("");

    } catch (error) {
        console.error("Error cargando los servicios:", error);

        container.innerHTML = `
            <p class="service-loading">
                No fue posible cargar los servicios.
                Intenta nuevamente más tarde.
            </p>
        `;
    }
}

// Ejecutar la consulta
loadPublicServices();


/* =========================================
   CHATBOT LUSELLE - GROQ
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


/* Abrir y cerrar chatbot */

function toggleChatbot(open) {
    if (!chatbotWindow || !chatbotToggle) return;

    chatbotWindow.hidden = !open;

    chatbotToggle.setAttribute("aria-expanded", String(open));

    if (chatbotToggleIcon) {
        chatbotToggleIcon.textContent = open ? "×" : "💬";
    }

    if (open && chatbotInput) {
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


/* Agregar mensajes */

function addChatMessage(text, sender) {
    if (!chatbotMessages) return;

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


/* Indicador de escritura */

function showTyping() {
    if (!chatbotMessages) return null;

    const typing = document.createElement("div");

    typing.className = "chatbot-typing";
    typing.textContent = "Luselle está escribiendo...";

    chatbotMessages.appendChild(typing);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    return typing;
}


/* Enviar mensajes */

if (
    chatbotForm &&
    chatbotInput &&
    chatbotMessages &&
    chatbotSend
) {
    chatbotForm.addEventListener("submit", async event => {
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

            chatbotHistory = chatbotHistory.slice(-10);

        } catch (error) {
            console.error("Error en el chatbot:", error);

            addChatMessage(
                "Lo siento, no pude responder en este momento. Inténtalo nuevamente. 💗",
                "assistant"
            );

            chatbotHistory.pop();

        } finally {
            if (typing) typing.remove();

            chatbotIsLoading = false;

            chatbotSend.disabled = false;
            chatbotInput.disabled = false;

            chatbotInput.focus();
        }
    });
}
