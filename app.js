(() => {
  const samples = {
    city: {
      title: "CitySpeechMix",
      duration: 10,
      durationLabel: "10 sec",
      metadata: "CitySpeechMix <span>·</span> 10 sec <span>·</span> 44.1 kHz <span>·</span> Mono",
      before: "assets/audio/cityspeechmix-before.mp3",
      after: "assets/audio/cityspeechmix-after.mp3"
    },
    edinburgh: {
      title: "Edinburgh noisy speech",
      duration: 2.340917,
      durationLabel: "2.3 sec",
      metadata: "Edinburgh noisy speech <span>·</span> 2.3 sec <span>·</span> 48 kHz <span>·</span> Mono",
      before: "assets/audio/edinburgh-before.mp3",
      after: "assets/audio/edinburgh-after.mp3"
    }
  };

  const card = document.querySelector(".listen-card");
  const audio = document.querySelector("#demo-audio");
  const seek = document.querySelector("#audio-seek");
  const playButton = document.querySelector("#play-button");
  const timeReadout = document.querySelector("#time-readout");
  const sampleMeta = document.querySelector("#sample-meta");
  const status = document.querySelector("#player-status");
  const bars = document.querySelector("#sound-bars");
  const waveforms = window.SpeechLensWaveforms;
  const sampleButtons = [...document.querySelectorAll("[data-sample]")];
  const versionButtons = [...document.querySelectorAll("[data-version]")];

  let selectedSample = "city";
  let selectedVersion = "before";
  let assignedSource = "";
  let playIntent = false;
  let queuedSeek = 0;

  function renderWaveform() {
    const fragment = document.createDocumentFragment();
    waveforms[selectedSample][selectedVersion].forEach((height) => {
      const bar = document.createElement("i");
      bar.style.height = `${height}px`;
      fragment.append(bar);
    });
    bars.replaceChildren(fragment);
  }

  function setRadioSelection(buttons, selectedButton) {
    buttons.forEach((button) => {
      const active = button === selectedButton;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", String(active));
      button.tabIndex = active ? 0 : -1;
    });
  }

  function addRadioKeyboardControls(buttons) {
    buttons.forEach((button, index) => {
      button.addEventListener("keydown", (event) => {
        let nextIndex;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % buttons.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = buttons.length - 1;
        else return;
        event.preventDefault();
        buttons[nextIndex].focus();
        buttons[nextIndex].click();
      });
    });
  }

  renderWaveform();

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const whole = Math.floor(seconds);
    const minutes = Math.floor(whole / 60);
    const remainder = String(whole % 60).padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function selectedSource() {
    return samples[selectedSample][selectedVersion];
  }

  function setStatus(message, state = "") {
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  function updateTime(current = audio.currentTime, duration = audio.duration) {
    const knownDuration = Number.isFinite(duration) && duration > 0 ? duration : samples[selectedSample].duration;
    const progress = knownDuration > 0 ? Math.min(100, Math.max(0, current / knownDuration * 100)) : 0;
    seek.max = String(knownDuration);
    seek.value = String(Math.min(current, knownDuration));
    seek.style.setProperty("--progress", `${progress}%`);
    bars.style.setProperty("--progress", `${progress}%`);
    timeReadout.innerHTML = `${formatTime(current)} <span>/</span> ${formatTime(knownDuration)}`;
  }

  function updatePlayState() {
    card.classList.toggle("is-playing", !audio.paused && !audio.ended);
    const versionName = selectedVersion === "before" ? "original" : "enhanced";
    playButton.setAttribute("aria-label", playIntent && !audio.paused ? `Pause ${versionName} audio` : `Play ${versionName} audio`);
  }

  async function startPlayback() {
    try {
      await audio.play();
      playIntent = true;
      setStatus("Switch versions at the same point in the recording.");
      updatePlayState();
    } catch {
      playIntent = false;
      updatePlayState();
      setStatus("Playback could not start. Press play to try again.", "error");
    }
  }

  function loadSelectedSource({ resume = playIntent, time = audio.currentTime || queuedSeek } = {}) {
    const source = selectedSource();
    if (source === assignedSource) {
      if (resume) startPlayback();
      return;
    }

    assignedSource = source;
    queuedSeek = Math.max(0, Number.isFinite(time) ? time : 0);
    audio.pause();
    audio.src = source;
    audio.load();
    setStatus("Loading the sample…", "loading");
  }

  sampleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.sample === selectedSample) return;
      selectedSample = button.dataset.sample;
      selectedVersion = "before";
      playIntent = false;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      assignedSource = "";
      queuedSeek = 0;
      setRadioSelection(sampleButtons, button);
      setRadioSelection(versionButtons, versionButtons.find((item) => item.dataset.version === selectedVersion));
      sampleMeta.innerHTML = samples[selectedSample].metadata;
      renderWaveform();
      updateTime(0, samples[selectedSample].duration);
      updatePlayState();
      setStatus("Switch versions at the same point in the recording.");
    });
  });

  versionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextVersion = button.dataset.version;
      if (nextVersion === selectedVersion) return;
      selectedVersion = nextVersion;
      setRadioSelection(versionButtons, button);
      renderWaveform();
      updatePlayState();
      if (assignedSource) {
        const wasPlaying = playIntent && !audio.paused;
        const currentTime = audio.currentTime || queuedSeek;
        loadSelectedSource({ resume: wasPlaying, time: currentTime });
      } else {
        setStatus("Press play to hear this version.");
      }
    });
  });

  addRadioKeyboardControls(sampleButtons);
  addRadioKeyboardControls(versionButtons);

  playButton.addEventListener("click", () => {
    if (playIntent && !audio.paused) {
      playIntent = false;
      audio.pause();
      setStatus("Switch versions at the same point in the recording.");
      updatePlayState();
      return;
    }
    playIntent = true;
    if (!assignedSource) loadSelectedSource({ resume: true, time: queuedSeek });
    else startPlayback();
    updatePlayState();
  });

  seek.addEventListener("input", () => {
    queuedSeek = Number(seek.value);
    updateTime(queuedSeek, samples[selectedSample].duration);
    if (assignedSource && audio.readyState >= HTMLMediaElement.HAVE_METADATA) audio.currentTime = queuedSeek;
  });

  audio.addEventListener("loadedmetadata", () => {
    const max = Number.isFinite(audio.duration) ? audio.duration : samples[selectedSample].duration;
    queuedSeek = Math.min(queuedSeek, max);
    try { audio.currentTime = queuedSeek; } catch { /* The browser will apply the saved point when seeking becomes available. */ }
    updateTime(queuedSeek, max);
    setStatus("Switch versions at the same point in the recording.");
    if (playIntent) startPlayback();
  });

  audio.addEventListener("timeupdate", () => {
    queuedSeek = audio.currentTime;
    updateTime(audio.currentTime, audio.duration);
  });
  audio.addEventListener("play", updatePlayState);
  audio.addEventListener("pause", updatePlayState);
  audio.addEventListener("ended", () => {
    playIntent = false;
    updatePlayState();
    setStatus("Sample finished. Choose a version or play it again.");
  });
  audio.addEventListener("waiting", () => setStatus("Loading audio…", "loading"));
  audio.addEventListener("error", () => {
    playIntent = false;
    assignedSource = "";
    updatePlayState();
    setStatus("This sample could not load. Press play to retry.", "error");
  });

  updateTime(0, samples.city.duration);
  updatePlayState();

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-nav");
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    nav.classList.toggle("is-open", !isOpen);
  });
  nav.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
      nav.classList.remove("is-open");
    });
  });

  function revealHashDisclosure() {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    const disclosure = target.matches("details")
      ? target
      : target.closest("details") || target.querySelector("details");
    if (!disclosure) return;
    disclosure.open = true;
    disclosure.querySelector("summary")?.focus({ preventScroll: true });
  }

  window.addEventListener("hashchange", revealHashDisclosure);
  document.addEventListener("click", (event) => {
    const clicked = event.target instanceof Element ? event.target.closest("a[href^='#']") : null;
    if (!clicked) return;
    const destination = new URL(clicked.href, window.location.href);
    const samePage = destination.origin === window.location.origin && destination.pathname === window.location.pathname;
    if (samePage && destination.hash === window.location.hash) window.requestAnimationFrame(revealHashDisclosure);
  });
  revealHashDisclosure();
})();
