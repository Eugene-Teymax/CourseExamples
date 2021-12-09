LESSON10
Чтобы заинсталить проект прописать npm i или yarn в консоли
Чтобы запустить npm run dev или yarn dev

Задача#10:
Заменить классы Loader и Dropzone на функции, миксин для них соответственно тоже должен быть функцией (доп.задание)
В src/app.js вызывается функция uploadButtonClick, в ней изначально делается POST запрос на сервер и отправляется файл

Response такой {
id: string;
name: string;
createdAt: string;
size: number (bytes, max 1KB);
attachmentURL: null | string;
}

Нужно проверять поле attachmentURL, если не пустое - сразу выводить,
иначе запустить рекурсивную асинхронную функцию repeatRequestUntilDataIsReceived, которая находится в src/utils/helpers.js
В ней уже объявлены аргументы (менять их нельзя)
Сами запросы уже любезно предоставлены нами services/files/index.js

Цель дз: написать тело функции repeatRequestUntilDataIsReceived

baseURL для axios: http://185.233.36.116:8080
