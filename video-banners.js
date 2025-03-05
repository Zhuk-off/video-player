/**
 * video-banners.js
 * Скрипт для управления баннерами в разных состояниях видео:
 * - При беззвучном воспроизведении
 * - Во время паузы
 * - После завершения видео
 */

document.addEventListener("DOMContentLoaded", function () {
  // Находим видеоэлемент и баннеры
  const video = document.getElementById("local_video");
  const mutedBanner = document.getElementById("muted-banner");
  const pausedBanner = document.getElementById("paused-banner");
  const endedBanner = document.getElementById("ended-banner");

  // Проверяем, найдены ли все элементы
  if (!video || !mutedBanner || !pausedBanner || !endedBanner) {
    console.error("Не удалось найти все необходимые элементы для баннеров");
    return;
  }

  // Функция для скрытия всех баннеров
  function hideAllBanners() {
    mutedBanner.style.display = "none";
    pausedBanner.style.display = "none";
    endedBanner.style.display = "none";
  }

  // Показываем баннер беззвучного режима при загрузке, если видео без звука
  if (video.muted) {
    // Небольшая задержка, чтобы баннер появился после полной загрузки видео
    setTimeout(() => {
      mutedBanner.style.display = "block";
    }, 1000);
  }

  // Обработчик события паузы
  video.addEventListener("pause", function () {
    // Показываем баннер паузы только если видео не закончилось и не в начале
    if (!video.ended && video.currentTime > 0.5) {
      hideAllBanners();
      pausedBanner.style.display = "block";
    }
  });

  // Обработчик события воспроизведения
  video.addEventListener("play", function () {
    hideAllBanners();
  });

  // Обработчик события изменения состояния звука
  video.addEventListener("volumechange", function () {
    if (video.muted) {
      // Если звук выключен и видео воспроизводится, показываем баннер
      if (!video.paused && !video.ended) {
        hideAllBanners();
        mutedBanner.style.display = "block";
      }
    } else {
      // Если звук включен, скрываем баннер беззвучного режима
      mutedBanner.style.display = "none";
    }
  });

  // Обработчик события окончания видео
  video.addEventListener("ended", function () {
    hideAllBanners();
    endedBanner.style.display = "block";
  });

  // Обработчики кнопок в баннерах
  mutedBanner.addEventListener("click", function (e) {
    e.stopPropagation(); // Предотвращаем всплытие события клика до видео
    video.muted = false;
    hideAllBanners();
  });

  pausedBanner.addEventListener("click", function (e) {
    e.stopPropagation(); // Предотвращаем всплытие события клика до видео
    video.play().catch((err) => console.error("Ошибка воспроизведения:", err));
    hideAllBanners();
  });

  endedBanner.addEventListener("click", function (e) {
    e.stopPropagation(); // Предотвращаем всплытие события клика до видео
    video.currentTime = 0;
    video.play().catch((err) => console.error("Ошибка воспроизведения:", err));
    hideAllBanners();
  });
});
