/**
 * video-player.js
 * Управление видео: воспроизведение, пауза, центрирование и баннеры
 */

document.addEventListener("DOMContentLoaded", () => {
  // Инициализация элементов
  const video = document.getElementById("local_video");
  const container = document.querySelector(".video-container");
  const banners = {
    muted: document.getElementById("muted-banner"),
    paused: document.getElementById("paused-banner"),
    ended: document.getElementById("ended-banner"),
  };

  // Проверка наличия элементов
  if (
    !video ||
    !container ||
    Object.values(banners).some((banner) => !banner)
  ) {
    console.error("Не найдены все необходимые элементы видеоплеера");
    return;
  }

  // Состояние и настройка
  let isFirstClick = true;
  video.style.cursor = "pointer";

  // Функции управления интерфейсом
  const ui = {
    // Управление баннерами
    hideBanners: () =>
      Object.values(banners).forEach(
        (banner) => (banner.style.display = "none")
      ),
    showBanner: (key) => {
      ui.hideBanners();
      banners[key].style.display = "block";
    },

    // Центрирование видео
    center: () => {
      // Пропускаем центрирование для беззвучного воспроизведения (кроме первого клика)
      if (video.muted && !video.paused && !isFirstClick) return;
      container.scrollIntoView({ behavior: "smooth", block: "center" });
    },

    // Воспроизведение видео
    play: () =>
      video.play().catch((e) => console.error("Ошибка воспроизведения:", e)),
  };

  // Показываем баннер беззвучного режима при загрузке
  if (video.muted) setTimeout(() => ui.showBanner("muted"), 1000);

  // Действия для разных событий
  const actions = {
    // Первый клик по видео
    firstClick: () => {
      video.currentTime = 0;
      video.muted = false;
      isFirstClick = false;
      ui.center();
      return ui.play();
    },

    // Клик по видео
    videoClick: () =>
      isFirstClick
        ? actions.firstClick()
        : video.paused
        ? ui.play()
        : video.pause(),

    // Клик по баннеру "без звука"
    mutedBannerClick: () => {
      video.currentTime = 0;
      video.muted = false;
      isFirstClick = false;
      ui.center();
      return ui.play();
    },

    // Клик по баннеру "пауза"
    pausedBannerClick: () => ui.play(),

    // Клик по баннеру "завершено"
    endedBannerClick: () => {
      video.currentTime = 0;
      return ui.play();
    },
  };

  // Обработчики событий видео
  const videoEvents = {
    click: actions.videoClick,

    pause: () => {
      ui.center();
      if (!video.ended && video.currentTime > 0.5) ui.showBanner("paused");
    },

    play: () => {
      if (!isFirstClick && !video.muted) ui.center();
      ui.hideBanners();
    },

    volumechange: () => {
      if (video.muted && !video.paused && !video.ended) {
        ui.showBanner("muted");
      } else if (!video.muted) {
        banners.muted.style.display = "none";
      }
    },

    ended: () => ui.showBanner("ended"),
  };

  // Привязка обработчиков событий

  // 1. События видео
  Object.entries(videoEvents).forEach(([event, handler]) => {
    video.addEventListener(event, handler);
  });

  // 2. События баннеров
  const bannerActions = {
    muted: actions.mutedBannerClick,
    paused: actions.pausedBannerClick,
    ended: actions.endedBannerClick,
  };

  Object.entries(bannerActions).forEach(([key, action]) => {
    banners[key].addEventListener("click", (e) => {
      e.stopPropagation();
      action();
      ui.hideBanners();
    });
  });
});
