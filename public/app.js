document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('videoPlayer');
  const videoContainer = document.getElementById('videoContainer');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const muteBtn = document.getElementById('muteBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const loadingOverlay = document.getElementById('loadingOverlay');

  const proxyUrl = '/api/playlist'; // The backend proxy URL
  let hls;
  const statusDotPing = document.getElementById('statusDotPing');
  let isHlsSupported = Hls.isSupported();

  // Icons SVG
  const icons = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
    unmuted: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
    muted: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
  };

  function updateStatus(status, message) {
    statusText.textContent = message;
    statusDot.className = 'relative inline-flex rounded-none h-3 w-3';
    statusDotPing.classList.add('hidden');
    
    if (status === 'live') {
      statusDot.classList.add('bg-green-500');
      statusDotPing.classList.remove('hidden');
      statusDotPing.classList.replace('bg-accent', 'bg-green-500');
    } else if (status === 'error') {
      statusDot.classList.add('bg-red-500');
    } else {
      statusDot.classList.add('bg-zinc-600');
    }
  }

  function toggleLoading(show) {
    if (show) {
      loadingOverlay.classList.remove('opacity-0', 'pointer-events-none');
    } else {
      loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
    }
  }

  function initPlayer() {
    if (isHlsSupported) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        // Optional: reduce buffering so we stay closer to the live edge
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
      });

      hls.loadSource(proxyUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        updateStatus('live', 'Live stream active');
        toggleLoading(false);
        // Autoplay requires muted true in many modern browsers
        video.muted = true;
        muteBtn.innerHTML = icons.muted;
        video.play().catch(e => console.log('Autoplay blocked:', e));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              updateStatus('error', 'Network error. Reconnecting...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              updateStatus('error', 'Media error. Recovering...');
              hls.recoverMediaError();
              break;
            default:
              updateStatus('error', 'Stream offline');
              hls.destroy();
              break;
          }
        }
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        toggleLoading(false);
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari native support
      video.src = proxyUrl;
      video.addEventListener('loadedmetadata', () => {
        updateStatus('live', 'Live stream active');
        toggleLoading(false);
        video.muted = true;
        muteBtn.innerHTML = icons.muted;
        video.play().catch(e => console.log('Autoplay blocked:', e));
      });
      video.addEventListener('error', () => {
        updateStatus('error', 'Stream offline');
      });
    } else {
      updateStatus('error', 'HLS not supported in this browser');
      toggleLoading(false);
    }
  }

  // Event Listeners for UI
  video.addEventListener('playing', () => {
    playPauseBtn.innerHTML = icons.pause;
    toggleLoading(false);
  });

  video.addEventListener('pause', () => {
    playPauseBtn.innerHTML = icons.play;
  });

  video.addEventListener('waiting', () => {
    toggleLoading(true);
  });

  playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.innerHTML = video.muted ? icons.muted : icons.unmuted;
  });

  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.webkitRequestFullscreen) { /* Safari */
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) { /* IE11 */
        videoContainer.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });

  // Controls auto hide (mouse)
  let timeout;
  videoContainer.addEventListener('mousemove', () => {
    videoContainer.classList.add('active-controls');
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      videoContainer.classList.remove('active-controls');
    }, 2500);
  });

  videoContainer.addEventListener('mouseleave', () => {
    videoContainer.classList.remove('active-controls');
  });

  /**
   * Toggle controls visibility on touch for mobile devices
  **/
  videoContainer.addEventListener('touchstart', (e) => {
    // Don't toggle if user tapped a control button
    if (e.target.closest('button')) return;
    
    if (videoContainer.classList.contains('active-controls')) {
      videoContainer.classList.remove('active-controls');
    } else {
      videoContainer.classList.add('active-controls');
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        videoContainer.classList.remove('active-controls');
      }, 4000);
    }
  }, { passive: true });

  // Start initialization
  initPlayer();
});
