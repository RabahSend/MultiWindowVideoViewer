import { WindowManager } from './windowManager';

// Select buttons and elements from the DOM
const clearButton = document.querySelector<HTMLButtonElement>('.clear');
const addVideoButton = document.querySelector<HTMLButtonElement>('.addVideo');
const videoElement = document.querySelector<HTMLVideoElement>('video');
const svgElement = document.querySelector<SVGElement>('svg');
const pathElement = document.querySelector<SVGElement>('svg path');

// Add event listeners to buttons and window
clearButton?.addEventListener('click', restartApplication);
addVideoButton?.addEventListener('click', addVideoFile);
window.addEventListener('beforeunload', removeCurrentScreen);

// Initialize video file path and current screen id
let videoFilePath = '';
const currentScreenId = `screen-${generateScreenId()}`;

// Define ScreenDetails interface
interface ScreenDetails {
  screenX: number;
  screenY: number;
  screenWidth: number;
  screenHeight: number;
  width: number;
  height: number;
  lastUpdated: number;
}

// Function to retrieve screens from local storage
function retrieveScreens(): [string, ScreenDetails][] {
  return Object.entries(window.localStorage)
    .filter(([key]) => key.startsWith('screen-'))
    .map(([key, value]: [string, string]) => [key, JSON.parse(value) as ScreenDetails]);
}

// Function to generate unique screen id
function generateScreenId() {
  const existingScreenIds = Object.keys(window.localStorage)
    .filter((key) => key.startsWith('screen-'))
    .map((key) => parseInt(key.replace('screen-', '')))
    .sort((a, b) => a - b);
    existingScreenIds[existingScreenIds.length - 1]
}

// Function to update screen details in local storage
function updateScreenDetails() {
  const screenDetails = {
    xPosition: window.screenX,
    yPosition: window.screenY,
    totalWidth: window.screen.availWidth,
    totalHeight: window.screen.availHeight,
    windowWidth: window.outerWidth,
    windowHeight: window.innerHeight,
    lastUpdated: Date.now(),
  };
  window.localStorage.setItem(currentScreenId, JSON.stringify(screenDetails));
}

// Function to restart application
function restartApplication() {
  timers.forEach((timer) => window.clearInterval(timer));
  window.localStorage.removeItem('videoTime');
  window.localStorage.removeItem('videoFilePath');
  setTimeout(() => window.location.reload(), Math.random() * 1000);
}

// Function to add video file
function addVideoFile() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.mp4';
  fileInput.onchange = function(event) {
    if (event.target) {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        videoFilePath = URL.createObjectURL(file);
        window.localStorage.setItem('videoFilePath', videoFilePath);
        initializeVideo();
      }
    }
  };
  fileInput.click();
}

function removeCurrentScreen() {
  localStorage.removeItem(currentScreenId);
}

function removeInactiveScreens() {
  const screens = retrieveScreens();
  for (const [key, screen] of screens) {
    if (Date.now() - screen.lastUpdated > 1000) {
      localStorage.removeItem(key);
    }
  }
}

// This function generates an SVG path that connects the centers of all active screens.
function generateSVG() {
  const screenPath = new WindowManager();

  svgElement?.setAttribute('viewBox', `0 0 ${window.screen.availWidth} ${window.screen.availHeight}`);
  svgElement?.setAttribute('width', `${window.screen.availWidth}px`);
  svgElement?.setAttribute('height', `${window.screen.availHeight}px`);

  svgElement?.setAttribute('style', `transform: translate(-${window.screenX}px, -${window.screenY}px)`);
  
  videoElement?.setAttribute('style', `transform: translate(-${window.screenX}px, -${window.screenY}px)`);
  const screens: [string, ScreenDetails][] = retrieveScreens();
screens
  .map(([key, screen]) => {
    const x = screen.screenX + screen.width / 2;
    const y = screen.screenY + screen.height / 2;
    return [key, { ...screen, x, y }];
  })
  .forEach(([key, screen], i) => {
    if (typeof screen !== 'string') {
      const screenDetails = typeof screen === 'string' ? JSON.parse(screen) : screen;
      if (i === 0) {
        screenPath.moveTo(screenDetails.x, screenDetails.y);
        console.log(screenPath.toString())
      } else {
        screenPath.lineTo(screenDetails.x, screenDetails.y);
        console.log(screenPath.toString())
      }
    }
  });

  screenPath.closePath();
  pathElement?.setAttribute('d', screenPath.toString());
}

// Initialize timers array
const timers: ReturnType<typeof setInterval>[] = [];

function startApplication() {
  timers.push(setInterval(updateScreenDetails, 10));
  timers.push(setInterval(removeInactiveScreens, 100));
  timers.push(setInterval(generateSVG, 10));
}

// Initialize video playback timer
let videoPlaybackTimer: ReturnType<typeof setInterval> | null = null;

function initializeVideo() {

  if (!window.localStorage.getItem('videoFilePath')) return;
  videoFilePath = window.localStorage.getItem('videoFilePath') || '';

  const storedPlaybackTime = window.localStorage.getItem('videoTime');
  const startTime = storedPlaybackTime ? JSON.parse(storedPlaybackTime).time : 0;

  if (!videoElement) return;
  videoElement.width = window.screen.availWidth;
  videoElement.height = window.screen.availHeight;
  videoElement.src = videoFilePath;
  videoElement.currentTime = startTime + 1,6;

  videoElement.play();

  if (videoPlaybackTimer) {
    clearInterval(videoPlaybackTimer);
  }

  videoPlaybackTimer = setInterval(() => {
    if (!window.localStorage.getItem('videoFilePath')) { restartApplication(); return; }

    const currentTime = videoElement.currentTime;

    window.localStorage.setItem('videoTime', JSON.stringify({ time: currentTime }));
  }, 1000);

  videoElement.addEventListener('ended', () => {
    restartApplication();
  });
}

startApplication();

initializeVideo();
