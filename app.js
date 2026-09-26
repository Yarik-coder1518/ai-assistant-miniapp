const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const SERVER_URL =
    "https://ai-assistant-miniapp-2.onrender.com";

const toggleButton =
    document.getElementById("toggleButton");

const statusText =
    document.getElementById("statusText");

let enabled = false;


// =========================
// СТАТУС
// =========================

function updateStatus() {

    if (enabled) {

        statusText.textContent =
            "Автоответчик включён";

        toggleButton.textContent =
            "ВЫКЛЮЧИТЬ";

    } else {

        statusText.textContent =
            "Автоответчик выключен";

        toggleButton.textContent =
            "ВКЛЮЧИТЬ";
    }
}


async function loadStatus() {

    try {

        const response =
            await fetch(
                SERVER_URL + "/status"
            );

        const data =
            await response.json();

        enabled = data.enabled;

        updateStatus();

    } catch (error) {

        console.error(
            "Ошибка загрузки статуса:",
            error
        );
    }
}


// =========================
// ВКЛ / ВЫКЛ
// =========================

async function toggleAssistant() {

    const newState = !enabled;

    try {

        const response =
            await fetch(
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

        const data =
            await response.json();

        enabled = data.enabled;

        updateStatus();

        tg.HapticFeedback
            .impactOccurred("light");

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

    container.innerHTML =
        '<header>' +

            '<button id="backButton" ' +
            'class="back-button">' +
                '‹' +
            '</button>' +

            '<div>' +
                '<h1>Исключения</h1>' +
                '<p>Кому AI не отвечает</p>' +
            '</div>' +

        '</header>' +

        '<section class="section">' +

            '<h2>Люди</h2>' +

            '<div id="usersList">' +
                '<div class="loading">' +
                    'Загрузка...' +
                '</div>' +
            '</div>' +

        '</section>';


    document
        .getElementById("backButton")
        .addEventListener(
            "click",
            showMainScreen
        );


    loadUsers();
}


// =========================
// ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ
// =========================

async function loadUsers() {

    const usersList =
        document.getElementById(
            "usersList"
        );


    try {

        const usersResponse =
            await fetch(
                SERVER_URL + "/users"
            );


        const usersData =
            await usersResponse.json();


        const users =
            usersData.users || [];


        const exceptionsResponse =
            await fetch(
                SERVER_URL + "/exceptions"
            );


        const exceptionsData =
            await exceptionsResponse.json();


        const exceptions =
            exceptionsData.exceptions || [];


        const exceptionIds =
            exceptions.map(
                function(user) {
                    return Number(user.id);
                }
            );


        if (users.length === 0) {

            usersList.innerHTML =
                '<div class="empty-state">' +

                    '<div class="empty-icon">' +
                        '👤' +
                    '</div>' +

                    '<strong>' +
                        'Пока нет пользователей' +
                    '</strong>' +

                    '<small>' +
                        'Когда кто-нибудь напишет ' +
                        'тебе, он появится здесь.' +
                    '</small>' +

                '</div>';

            return;
        }


        usersList.innerHTML = "";


        users.forEach(
            function(user) {

                const id =
                    Number(user.id);


                const isExcluded =
                    exceptionIds.includes(id);


                let displayName =
                    "Без имени";


                if (user.first_name) {

                    displayName =
                        user.first_name;


                    if (user.last_name) {

                        displayName +=
                            " " +
                            user.last_name;
                    }
                }


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "user-item";


                const userInfo =
                    document.createElement(
                        "div"
                    );


                userInfo.className =
                    "user-info";


                const avatar =
                    document.createElement(
                        "div"
                    );


                avatar.className =
                    "user-avatar";


                avatar.textContent =
                    getInitial(displayName);


                const textBlock =
                    document.createElement(
                        "div"
                    );


                const nameElement =
                    document.createElement(
                        "strong"
                    );


                nameElement.textContent =
                    displayName;


                const usernameElement =
                    document.createElement(
                        "small"
                    );


                if (user.username) {

                    usernameElement.textContent =
                        "@" + user.username;

                } else {

                    usernameElement.textContent =
                        "Telegram ID: " + id;
                }


                textBlock.appendChild(
                    nameElement
                );

                textBlock.appendChild(
                    usernameElement
                );


                userInfo.appendChild(
                    avatar
                );

                userInfo.appendChild(
                    textBlock
                );


                const button =
                    document.createElement(
                        "button"
                    );


                if (isExcluded) {

                    button.className =
                        "remove-exception-button";

                    button.textContent =
                        "Убрать";


                    button.addEventListener(
                        "click",
                        function() {

                            deleteException(id);

                        }
                    );

                } else {

                    button.className =
                        "add-exception-button";

                    button.textContent =
                        "Исключить";


                    button.addEventListener(
                        "click",
                        function() {

                            addException(id);

                        }
                    );
                }


                item.appendChild(
                    userInfo
                );

                item.appendChild(
                    button
                );


                usersList.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "Ошибка загрузки пользователей:",
            error
        );


        usersList.innerHTML =
            '<div class="empty-state">' +
                'Не удалось загрузить ' +
                'пользователей.' +
            '</div>';
    }
}


// =========================
// ДОБАВИТЬ ИСКЛЮЧЕНИЕ
// =========================

async function addException(id) {

    try {

        const response =
            await fetch(
                SERVER_URL + "/exceptions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        id: id
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            tg.showAlert(
                data.error ||
                "Не удалось добавить исключение."
            );

            return;
        }


        tg.HapticFeedback
            .impactOccurred("light");


        await loadUsers();


    } catch (error) {

        console.error(
            "Ошибка добавления исключения:",
            error
        );


        tg.showAlert(
            "Не удалось подключиться к серверу."
        );
    }
}


// =========================
// УДАЛИТЬ ИСКЛЮЧЕНИЕ
// =========================

async function deleteException(id) {

    try {

        const response =
            await fetch(
                SERVER_URL + "/exceptions",
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        id: id
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            tg.showAlert(
                data.error ||
                "Не удалось убрать исключение."
            );

            return;
        }


        tg.HapticFeedback
            .impactOccurred("light");


        await loadUsers();


    } catch (error) {

        console.error(
            "Ошибка удаления исключения:",
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
// ПЕРВАЯ БУКВА
// =========================

function getInitial(name) {

    if (!name) {
        return "?";
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}


// =========================
// КНОПКА ИСКЛЮЧЕНИЙ
// =========================

document
    .getElementById("exceptionsButton")
    .addEventListener(
        "click",
        showExceptionsScreen
    );


// =========================
// СТИЛЬ
// =========================

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


// =========================
// ПАМЯТЬ
// =========================

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
