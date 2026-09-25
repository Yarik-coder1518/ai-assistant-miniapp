const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const SERVER_URL = "https://ai-assistant-miniapp-2.onrender.com";

const toggleButton = document.getElementById("toggleButton");
const statusText = document.getElementById("statusText");

let enabled = false;


// =========================
// СТАТУС АВТООТВЕТЧИКА
// =========================

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
        const response = await fetch(
            SERVER_URL + "/status"
        );

        const data = await response.json();

        enabled = data.enabled;

        updateStatus();

    } catch (error) {
        console.error(
            "Ошибка подключения:",
            error
        );
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
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    enabled: newState
                })
            }
        );

        const data = await response.json();

        enabled = data.enabled;

        updateStatus();

        tg.HapticFeedback.impactOccurred(
            "light"
        );

    } catch (error) {

        console.error(
            "Ошибка переключения:",
            error
        );

        tg.showAlert(
            "Не удалось подключиться к серверу."
        );
    }
}


toggleButton.addEventListener(
    "click",
    toggleAssistant
);


// =========================
// ЭКРАН ИСКЛЮЧЕНИЙ
// =========================

function showExceptionsScreen() {

    const container =
        document.querySelector(".container");

    container.innerHTML = `

        <header>

            <button
                id="backButton"
                class="back-button"
            >
                ‹
            </button>

            <div>
                <h1>Исключения</h1>

                <p>
                    Кому AI не отвечает
                </p>
            </div>

        </header>


        <section class="info-card">

            <h3>
                Добавить пользователя
            </h3>

            <p>
                Введи Telegram ID человека,
                которому AI не должен отвечать.
            </p>

            <input
                id="telegramIdInput"
                class="telegram-input"
                type="number"
                placeholder="Например: 123456789"
            >

            <button
                id="addExceptionButton"
                class="primary-button"
            >
                Добавить
            </button>

        </section>


        <section class="section">

            <h2>
                Список исключений
            </h2>

            <div id="exceptionsList">

                <div class="loading">
                    Загрузка...
                </div>

            </div>

        </section>

    `;


    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            showMainScreen
        );


    document
        .getElementById("addExceptionButton")
        .addEventListener(
            "click",
            addException
        );


    loadExceptions();
}


// =========================
// ЗАГРУЗКА ИСКЛЮЧЕНИЙ
// =========================

async function loadExceptions() {

    const list =
        document.getElementById(
            "exceptionsList"
        );

    try {

        const response = await fetch(
            SERVER_URL + "/exceptions"
        );

        const data =
            await response.json();

        const exceptions =
            data.exceptions || [];


        if (exceptions.length === 0) {

            list.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        👤
                    </div>

                    <strong>
                        Исключений пока нет
                    </strong>

                    <small>
                        AI отвечает всем пользователям
                    </small>

                </div>

            `;

            return;
        }


        list.innerHTML = "";


        exceptions.forEach(
            function(user) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "exception-item";


                item.innerHTML = `

                    <div>

                        <strong>
                            Telegram ID
                        </strong>

                        <small>
                            ${user.id}
                        </small>

                    </div>


                    <button
                        class="delete-button"
                        data-id="${user.id}"
                    >
                        Удалить
                    </button>

                `;


                item
                    .querySelector(
                        ".delete-button"
                    )
                    .addEventListener(
                        "click",
                        function() {

                            deleteException(
                                user.id
                            );

                        }
                    );


                list.appendChild(item);

            }
        );

    } catch (error) {

        console.error(
            "Ошибка загрузки исключений:",
            error
        );

        list.innerHTML = `

            <div class="empty-state">

                Не удалось загрузить список.

            </div>

        `;
    }
}


// =========================
// ДОБАВЛЕНИЕ ИСКЛЮЧЕНИЯ
// =========================

async function addException() {

    const input =
        document.getElementById(
            "telegramIdInput"
        );

    const id =
        input.value.trim();


    if (!id) {

        tg.showAlert(
            "Введи Telegram ID."
        );

        return;
    }


    if (!/^\d+$/.test(id)) {

        tg.showAlert(
            "Telegram ID должен состоять только из цифр."
        );

        return;
    }


    try {

        const response = await fetch(
            SERVER_URL + "/exceptions",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    id: Number(id)
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            tg.showAlert(
                data.error ||
                "Не удалось добавить пользователя."
            );

            return;
        }


        input.value = "";


        tg.HapticFeedback
            .impactOccurred("light");


        await loadExceptions();

    } catch (error) {

        console.error(
            "Ошибка добавления:",
            error
        );

        tg.showAlert(
            "Не удалось подключиться к серверу."
        );
    }
}


// =========================
// УДАЛЕНИЕ ИСКЛЮЧЕНИЯ
// =========================

async function deleteException(id) {

    try {

        const response = await fetch(
            SERVER_URL + "/exceptions",
            {
                method: "DELETE",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    id: Number(id)
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            tg.showAlert(
                data.error ||
                "Не удалось удалить пользователя."
            );

            return;
        }


        tg.HapticFeedback
            .impactOccurred("light");


        await loadExceptions();

    } catch (error) {

        console.error(
            "Ошибка удаления:",
            error
        );

        tg.showAlert(
            "Не удалось подключиться к серверу."
        );
    }
}


// =========================
// ГЛАВНЫЙ ЭКРАН
// =========================

function showMainScreen() {

    location.reload();
}


// =========================
// КНОПКИ ГЛАВНОГО ЭКРАНА
// =========================

document
    .getElementById("exceptionsButton")
    .addEventListener(
        "click",
        showExceptionsScreen
    );


document
    .getElementById("styleButton")
    .addEventListener(
        "click",
        function() {

            tg.showAlert(
                "Здесь мы добавим настройку стиля общения."
            );

        }
    );


document
    .getElementById("memoryButton")
    .addEventListener(
        "click",
        function() {

            tg.showAlert(
                "Здесь будет управление памятью AI."
            );

        }
    );


// =========================
// ЗАПУСК
// =========================

updateStatus();

loadStatus();
