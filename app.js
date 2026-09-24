const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();


let enabled = true;


const toggleButton =
    document.getElementById("toggleButton");

const statusText =
    document.getElementById("statusText");


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


toggleButton.addEventListener(
    "click",
    () => {

        enabled = !enabled;

        updateStatus();

        tg.HapticFeedback.impactOccurred(
            "light"
        );
    }
);


document
    .getElementById("exceptionsButton")
    .addEventListener(
        "click",
        () => {

            tg.showAlert(
                "Здесь будет список людей, которым AI не отвечает."
            );
        }
    );


document
    .getElementById("styleButton")
    .addEventListener(
        "click",
        () => {

            tg.showAlert(
                "Здесь мы добавим настройку стиля общения."
            );
        }
    );


document
    .getElementById("memoryButton")
    .addEventListener(
        "click",
        () => {

            tg.showAlert(
                "Здесь будет управление памятью AI."
            );
        }
    );


updateStatus();