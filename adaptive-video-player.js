/**
 * adaptive-video-player.js
 * Скрипт для адаптивного видеоплеера, который автоматически выбирает
 * подходящий источник видео в зависимости от типа устройства и ориентации экрана.
 */

// Константы для типов устройств
const DEVICE_TYPES = {
  MOBILE: "mobile",
  TABLET: "tablet",
  DESKTOP: "desktop",
};

// Константы для путей к видеофайлам
const VIDEO_SOURCES = {
  DESKTOP: "desktop-video.mp4",
  MOBILE_PORTRAIT: "mobile-video.mp4",
  MOBILE_LANDSCAPE: "desktop-video.mp4",
};

// Константы для ориентации экрана
const ORIENTATION = {
  PORTRAIT: "portrait",
  LANDSCAPE: "landscape",
};

/**
 * Определяет тип устройства пользователя на основе User-Agent
 * @returns {string} - тип устройства ('mobile', 'tablet' или 'desktop')
 */
function detectDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase();

  // Проверка на планшет
  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/g.test(userAgent)) {
    return DEVICE_TYPES.TABLET;
  }
  // Проверка на мобильное устройство
  else if (/iphone|ipod|android|blackberry|windows phone/g.test(userAgent)) {
    return DEVICE_TYPES.MOBILE;
  }
  // По умолчанию - десктоп
  else {
    return DEVICE_TYPES.DESKTOP;
  }
}

/**
 * Определяет ориентацию экрана
 * @returns {string} - ориентация экрана ('portrait' или 'landscape')
 */
function getScreenOrientation() {
  // Используем API ориентации экрана, если оно доступно
  if (window.screen && window.screen.orientation) {
    const orientation = window.screen.orientation.type;
    return orientation.includes("portrait")
      ? ORIENTATION.PORTRAIT
      : ORIENTATION.LANDSCAPE;
  }
  // Запасной вариант - определение по соотношению сторон
  else {
    return window.innerHeight > window.innerWidth
      ? ORIENTATION.PORTRAIT
      : ORIENTATION.LANDSCAPE;
  }
}

/**
 * Создает элемент source с указанными параметрами
 * @param {string} src - путь к видеофайлу
 * @param {string} className - класс для элемента source
 * @returns {HTMLElement} - созданный элемент source
 */
function createVideoSource(src, className) {
  const source = document.createElement("source");
  source.src = src;
  source.type = "video/mp4";
  source.className = className;
  return source;
}

/**
 * Выбирает и загружает подходящий источник видео в зависимости от устройства и ориентации экрана
 * @param {string} videoElementId - ID HTML-элемента video
 */
function selectVideoSource(videoElementId = "local_video") {
  const video = document.getElementById(videoElementId);
  if (!video) {
    console.error(`Элемент видео с ID "${videoElementId}" не найден`);
    return;
  }

  const deviceType = detectDeviceType();
  const orientation = getScreenOrientation();

  // Запоминаем текущую позицию воспроизведения
  const currentTime = video.currentTime;
  const wasPlaying = !video.paused;

  // Очищаем все существующие источники
  video.innerHTML = "";

  // Выбираем соответствующий источник видео
  let sourceElement;
  let sourceDescription;

  if (deviceType === DEVICE_TYPES.MOBILE) {
    if (orientation === ORIENTATION.LANDSCAPE) {
      sourceElement = createVideoSource(
        VIDEO_SOURCES.MOBILE_LANDSCAPE,
        "mobile-landscape-video"
      );
      sourceDescription = "мобильное горизонтальное видео";
    } else {
      sourceElement = createVideoSource(
        VIDEO_SOURCES.MOBILE_PORTRAIT,
        "mobile-portrait-video"
      );
      sourceDescription = "мобильное вертикальное видео";
    }
  } else {
    // Для десктопов и планшетов используем десктопное видео
    sourceElement = createVideoSource(VIDEO_SOURCES.DESKTOP, "desktop-video");
    sourceDescription = "десктопное видео";
  }

  video.appendChild(sourceElement);
  console.log(`Загружено ${sourceDescription}`);

  // Добавляем запасной текст для браузеров, не поддерживающих видео
  const fallbackText = document.createTextNode(
    "Your browser does not support videos."
  );
  video.appendChild(fallbackText);

  // Перезагружаем видео для применения изменений
  video.load();

  // Восстанавливаем позицию воспроизведения и состояние
  video.addEventListener(
    "loadedmetadata",
    function () {
      // Устанавливаем текущее время, но не больше длительности видео
      video.currentTime = Math.min(currentTime, video.duration);

      // Пытаемся автоматически воспроизвести видео
      video.play().catch((e) => {
        console.warn("Автоматическое воспроизведение не удалось:", e);
        // Если автовоспроизведение не удалось из-за политики браузера,
        // добавляем обработчик для воспроизведения по первому взаимодействию пользователя
        if (!window._autoplayHandlerAdded) {
          window._autoplayHandlerAdded = true;
          const autoplayHandler = function () {
            video
              .play()
              .catch((e) => console.error("Ошибка воспроизведения:", e));
            // Удаляем обработчики после первого использования
            ["click", "touchstart", "keydown"].forEach((event) => {
              document.removeEventListener(event, autoplayHandler);
            });
          };
          // Добавляем обработчики событий для первого взаимодействия пользователя
          ["click", "touchstart", "keydown"].forEach((event) => {
            document.addEventListener(event, autoplayHandler);
          });
        }
      });
    },
    { once: true }
  );
}

/**
 * Инициализирует адаптивный видеоплеер
 * @param {string} videoElementId - ID HTML-элемента video
 */
function initAdaptiveVideoPlayer(videoElementId = "local_video") {
  // Инициализация при загрузке страницы
  document.addEventListener("DOMContentLoaded", () =>
    selectVideoSource(videoElementId)
  );

  // Обновление при изменении размера окна (включая поворот устройства)
  window.addEventListener("resize", () => selectVideoSource(videoElementId));

  // Обновление при изменении ориентации (для устройств с поддержкой события orientationchange)
  if (window.screen && window.screen.orientation) {
    window.screen.orientation.addEventListener("change", () =>
      selectVideoSource(videoElementId)
    );
  } else {
    window.addEventListener("orientationchange", () =>
      selectVideoSource(videoElementId)
    );
  }
}

// Экспортируем функции для использования в других скриптах
window.AdaptiveVideoPlayer = {
  init: initAdaptiveVideoPlayer,
  selectSource: selectVideoSource,
  detectDeviceType: detectDeviceType,
  getScreenOrientation: getScreenOrientation,
};
