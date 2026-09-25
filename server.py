from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json


app = Flask(__name__)
CORS(app)


DATA_FILE = "data.json"


# =========================
# ЗАГРУЗКА ДАННЫХ
# =========================

def load_data():

    if not os.path.exists(DATA_FILE):

        return {
            "enabled": False,
            "exceptions": [],
            "users": []
        }

    try:

        with open(
            DATA_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)


        # Если старый data.json
        # ещё не содержит users

        if "users" not in data:
            data["users"] = []


        if "exceptions" not in data:
            data["exceptions"] = []


        if "enabled" not in data:
            data["enabled"] = False


        return data


    except Exception:

        return {
            "enabled": False,
            "exceptions": [],
            "users": []
        }


# =========================
# СОХРАНЕНИЕ
# =========================

def save_data():

    with open(
        DATA_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            data,
            file,
            ensure_ascii=False,
            indent=4
        )


data = load_data()


# =========================
# СТАТУС
# =========================

@app.route(
    "/status",
    methods=["GET"]
)
def get_status():

    return jsonify({
        "enabled": data["enabled"]
    })


# =========================
# ВКЛ / ВЫКЛ
# =========================

@app.route(
    "/toggle",
    methods=["POST"]
)
def toggle():

    request_data = (
        request.get_json(
            silent=True
        ) or {}
    )


    if "enabled" in request_data:

        data["enabled"] = bool(
            request_data["enabled"]
        )

        save_data()


    return jsonify({
        "enabled": data["enabled"]
    })


# =========================
# ПОЛУЧИТЬ ПОЛЬЗОВАТЕЛЕЙ
# =========================

@app.route(
    "/users",
    methods=["GET"]
)
def get_users():

    return jsonify({
        "users": data["users"]
    })


# =========================
# ДОБАВИТЬ / ОБНОВИТЬ
# ПОЛЬЗОВАТЕЛЯ
# =========================

@app.route(
    "/users",
    methods=["POST"]
)
def add_user():

    request_data = (
        request.get_json(
            silent=True
        ) or {}
    )


    telegram_id = request_data.get(
        "id"
    )


    if telegram_id is None:

        return jsonify({
            "success": False,
            "error": "Telegram ID не указан"
        }), 400


    try:

        telegram_id = int(
            telegram_id
        )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({
            "success": False,
            "error": "Telegram ID должен быть числом"
        }), 400


    first_name = request_data.get(
        "first_name",
        ""
    )


    last_name = request_data.get(
        "last_name",
        ""
    )


    username = request_data.get(
        "username",
        ""
    )


    # Проверяем, есть ли уже такой пользователь

    for user in data["users"]:

        if user["id"] == telegram_id:

            user["first_name"] = first_name
            user["last_name"] = last_name
            user["username"] = username

            save_data()

            return jsonify({
                "success": True,
                "user": user
            })


    # Новый пользователь

    user = {
        "id": telegram_id,
        "first_name": first_name,
        "last_name": last_name,
        "username": username
    }


    data["users"].append(
        user
    )


    save_data()


    return jsonify({
        "success": True,
        "user": user
    })


# =========================
# ИСКЛЮЧЕНИЯ
# =========================

@app.route(
    "/exceptions",
    methods=["GET"]
)
def get_exceptions():

    return jsonify({
        "exceptions": data["exceptions"]
    })


# =========================
# ДОБАВИТЬ ИСКЛЮЧЕНИЕ
# =========================

@app.route(
    "/exceptions",
    methods=["POST"]
)
def add_exception():

    request_data = (
        request.get_json(
            silent=True
        ) or {}
    )


    telegram_id = request_data.get(
        "id"
    )


    if telegram_id is None:

        return jsonify({
            "success": False,
            "error": "Telegram ID не указан"
        }), 400


    try:

        telegram_id = int(
            telegram_id
        )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({
            "success": False,
            "error": "Telegram ID должен быть числом"
        }), 400


    for user in data["exceptions"]:

        if user["id"] == telegram_id:

            return jsonify({
                "success": False,
                "error": "Этот пользователь уже в исключениях"
            }), 400


    data["exceptions"].append({
        "id": telegram_id
    })


    save_data()


    return jsonify({
        "success": True,
        "exceptions": data["exceptions"]
    })


# =========================
# УДАЛИТЬ ИСКЛЮЧЕНИЕ
# =========================

@app.route(
    "/exceptions",
    methods=["DELETE"]
)
def delete_exception():

    request_data = (
        request.get_json(
            silent=True
        ) or {}
    )


    telegram_id = request_data.get(
        "id"
    )


    if telegram_id is None:

        return jsonify({
            "success": False,
            "error": "Telegram ID не указан"
        }), 400


    try:

        telegram_id = int(
            telegram_id
        )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({
            "success": False,
            "error": "Telegram ID должен быть числом"
        }), 400


    old_length = len(
        data["exceptions"]
    )


    data["exceptions"] = [
        user
        for user in data["exceptions"]
        if user["id"] != telegram_id
    ]


    if len(data["exceptions"]) == old_length:

        return jsonify({
            "success": False,
            "error": "Такого ID нет в исключениях"
        }), 404


    save_data()


    return jsonify({
        "success": True,
        "exceptions": data["exceptions"]
    })


# =========================
# ПРОВЕРКА ИСКЛЮЧЕНИЯ
# =========================

@app.route(
    "/exceptions/check",
    methods=["POST"]
)
def check_exception():

    request_data = (
        request.get_json(
            silent=True
        ) or {}
    )


    telegram_id = request_data.get(
        "id"
    )


    if telegram_id is None:

        return jsonify({
            "excluded": False
        })


    try:

        telegram_id = int(
            telegram_id
        )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({
            "excluded": False
        })


    excluded = any(
        user["id"] == telegram_id
        for user in data["exceptions"]
    )


    return jsonify({
        "excluded": excluded
    })


# =========================
# ГЛАВНАЯ
# =========================

@app.route("/")
def home():

    return "AI Assistant server is running!"


# =========================
# ЗАПУСК
# =========================

if __name__ == "__main__":

    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )


    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )
