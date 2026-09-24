const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const SERVER_URL = "https://ai-assistant-miniapp-2.onrender.com";

const toggleButton = document.getElementById("toggleButton");
const statusText = document.getElementById("statusText");

let enabled = false;


function updateStatus() {
    if (enabled) {
        statusText.textContent = "Автоответчик включён";
        toggleButton.textContent = "ВЫКЛЮЧИТЬ";
    } else {
        statusText.textContent = "Автоответчик выключен";
        toggleButton.textContent = "ВКЛЮЧИТЬ";
    }
}


async function loadStatus() {
    try {
        const response = await fetch(SERVER_URL + "/status");
        const data = await response.json();

        enabled = data.enabled;
        updateStatus();

    } catch (error) {
        console.error("Ошибка подключения:", error);
    }
}


async function toggleAssistant() {
    const newState = !enabled;

    try {
        const response = await fetch(
            SERVER_URL + "/toggle",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    enabled: newState
                })
            }
        );

        const data = await response.json();

        enabled = data.enabled;
        updateStatus();

        tg.HapticFeedback.impactOccurred("light");

    } catch (error) {
        console.error("Ошибка переключения:", error);

        tg.showAlert(
            "Не удалось подключиться к серверу."
        );
    }
}


toggleButton.addEventListener(
    "click",
    toggleAssistant
);


document
    .getElementById("exceptionsButton")
    .addEventListener("click", function () {
        tg.showAlert(
            "Здесь будет список людей, которым AI не отвечает."
        );
    });


document
    .getElementById("styleButton")
    .addEventListener("click", function () {
        tg.showAlert(
            "Здесь мы добавим настройку стиля общения."
        );
    });


document
    .getElementById("memoryButton")
    .addEventListener("click", function () {
        tg.showAlert(
            "Здесь будет управление памятью AI."
        );
    });


updateStatus();
loadStatus();
