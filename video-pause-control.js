/**
 * video-pause-control.js
 * Скрипт для управления паузой при клике на видео
 * - Первый клик: запуск видео с начала со звуком
 * - Последующие клики: переключение между паузой и воспроизведением
 */

document.addEventListener("DOMContentLoaded", function () {
  // Находим видеоэлемент
  const video = document.getElementById("local_video");

  // Проверяем, найден ли видеоэлемент
  if (!video) {
    console.error("Элемент видео с ID 'local_video' не найден");
    return;
  }

  // Флаг для отслеживания первого клика
  let isFirstClick = true;

  // Делаем курсор указателем при наведении на видео
  video.style.cursor = "pointer";

  // Функция для управления воспроизведением
  function togglePlayback() {
    if (video.paused) {
      video.play().catch((e) => console.error("Ошибка воспроизведения:", e));
      console.log("Видео запущено");
    } else {
      video.pause();
      console.log("Видео поставлено на паузу");
    }
  }

  // Обработчик клика на видео
  video.addEventListener("click", function () {
    if (isFirstClick) {
      // Действия при первом клике
      video.currentTime = 0; // Перемотка в начало
      video.muted = false; // Включение звука
      video.play().catch((e) => console.error("Ошибка воспроизведения:", e));
      console.log("Первый клик: видео запущено с начала со звуком");
      isFirstClick = false; // Сбрасываем флаг первого клика
    } else {
      // Действия при последующих кликах
      togglePlayback();
    }
  });
});
