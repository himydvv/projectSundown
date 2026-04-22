const loader = document.querySelector("#loader");
const previewCard = document.querySelector("#preview-card");
const previewTitle = document.querySelector("#preview-title");
const previewCopy = document.querySelector("#preview-copy");
const previewLabel = document.querySelector("#preview-label");
const previewNote = document.querySelector("#preview-note");
const featureRows = document.querySelectorAll(".feature-row");
const ritualTabs = document.querySelectorAll(".ritual-tab");
const ritualKicker = document.querySelector("#ritual-kicker");
const ritualDescription = document.querySelector("#ritual-description");
const ritualVisual = document.querySelector("#ritual-visual");
const scrollButtons = document.querySelectorAll("[data-target]");
const popRevealItems = document.querySelectorAll(".pop-block, .pop-heading");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const smoothState = {
  current: 0,
  target: 0,
  rafId: 0,
  ease: 0.085,
  enabled: false,
};

const ritualContent = {
  write: {
    kicker: "Writing mode",
    description:
      "Clear the interface down to a single entry card, a timer, and a prompt that gets out of your way after you begin.",
    html: `
      <div class="ritual-screen">
        <div class="ritual-screen-top">
          <span>Write</span>
          <span>8:00</span>
        </div>
        <div class="ritual-screen-body">
          <div class="ritual-line ritual-line-long"></div>
          <div class="ritual-line ritual-line-mid"></div>
          <div class="ritual-line ritual-line-short"></div>
          <div class="ritual-card">
            <small>Prompt</small>
            <p>What felt lighter than expected today?</p>
          </div>
        </div>
      </div>
    `,
  },
  review: {
    kicker: "Review mode",
    description:
      "Return to recurring themes, strongest sentences, and emotional patterns without turning your journal into a productivity dashboard.",
    html: `
      <div class="ritual-screen">
        <div class="ritual-screen-top">
          <span>Review</span>
          <span>Sunday</span>
        </div>
        <div class="ritual-screen-body">
          <div class="ritual-card">
            <small>Recurring line</small>
            <p>I keep wanting slower mornings.</p>
          </div>
          <div class="mood-item">
            <strong>Calm entries</strong>
            <span>11</span>
          </div>
          <div class="mood-item">
            <strong>Late-night recordings</strong>
            <span>4</span>
          </div>
          <div class="mood-item">
            <strong>Most tagged feeling</strong>
            <span>Relief</span>
          </div>
        </div>
      </div>
    `,
  },
  rituals: {
    kicker: "Ritual mode",
    description:
      "Build repeatable reflection rhythms for mornings, evenings, or difficult weeks and keep them gentle enough to sustain.",
    html: `
      <div class="ritual-screen">
        <div class="ritual-screen-top">
          <span>Rituals</span>
          <span>Night reset</span>
        </div>
        <div class="ritual-screen-body">
          <div class="mood-item">
            <strong>1. Exhale</strong>
            <span>45 sec</span>
          </div>
          <div class="mood-item">
            <strong>2. Write</strong>
            <span>4 min</span>
          </div>
          <div class="mood-item">
            <strong>3. Tag the feeling</strong>
            <span>30 sec</span>
          </div>
          <div class="ritual-card">
            <small>Closing line</small>
            <p>What can stay unfinished until tomorrow?</p>
          </div>
        </div>
      </div>
    `,
  },
};

function hideLoader() {
  const delay = prefersReducedMotion.matches ? 400 : 3000;
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
    window.setTimeout(() => {
      revealPopItems();
    }, 120);
  }, delay);
}

function showPreview() {
  if (window.innerWidth > 980) {
    previewCard.classList.add("is-visible");
  }
}

function hidePreview() {
  previewCard.classList.remove("is-visible");
}

function updatePreview(row, options = {}) {
  const { show = true } = options;

  previewTitle.textContent = row.dataset.title;
  previewCopy.textContent = row.dataset.copy;
  previewLabel.textContent = row.dataset.label;
  previewNote.textContent = row.dataset.note;

  featureRows.forEach((item) => item.classList.remove("is-active"));
  row.classList.add("is-active");

  if (show) {
    showPreview();
  }
}

function bindFeaturePreview() {
  if (!featureRows.length) return;

  updatePreview(featureRows[0], { show: false });

  featureRows.forEach((row) => {
    row.addEventListener("mouseenter", () => updatePreview(row));
    row.addEventListener("focus", () => updatePreview(row));
  });

  const featurePage = document.querySelector("#page3");
  featurePage.addEventListener("mouseleave", () => {
    hidePreview();
  });

  previewCard.addEventListener("mouseenter", () => {
    showPreview();
  });

  previewCard.addEventListener("mouseleave", () => {
    hidePreview();
  });
}

function setRitualTab(tabKey) {
  const content = ritualContent[tabKey];
  if (!content) return;

  ritualKicker.textContent = content.kicker;
  ritualDescription.textContent = content.description;
  ritualVisual.innerHTML = content.html;

  ritualTabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabKey;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function bindTabs() {
  ritualTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setRitualTab(tab.dataset.tab);
    });
  });
}

function getTargetOffset(target) {
  const element = document.querySelector(target);
  if (!element) return 0;
  return element.offsetTop;
}

function scrollToTarget(target) {
  const top = getTargetOffset(target);
  window.scrollTo({
    top,
    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
  });
}

function bindScrollButtons() {
  scrollButtons.forEach((button) => {
    button.addEventListener("click", () => {
      scrollToTarget(button.dataset.target);
    });
  });
}

function revealPopItems(forceAll = false) {
  if (!popRevealItems.length) return;

  if (forceAll || prefersReducedMotion.matches) {
    popRevealItems.forEach((item) => item.classList.add("is-inview"));
    return;
  }

  const triggerPoint = window.innerHeight * 0.88;

  popRevealItems.forEach((item) => {
    if (item.classList.contains("is-inview")) return;

    const rect = item.getBoundingClientRect();
    if (rect.top <= triggerPoint) {
      item.classList.add("is-inview");
    }
  });
}

function setBodyHeight() {
  if (!smoothState.enabled) {
    document.body.style.height = "";
    document.querySelector("#main").style.transform = "";
    return;
  }

  document.body.style.height = `${document.querySelector("#main").getBoundingClientRect().height}px`;
}

function renderSmoothScroll() {
  const main = document.querySelector("#main");
  const delta = window.scrollY - smoothState.current;

  smoothState.target = window.scrollY;
  smoothState.current += delta * smoothState.ease;

  if (Math.abs(smoothState.target - smoothState.current) < 0.15) {
    smoothState.current = smoothState.target;
  }

  main.style.transform = `translate3d(0, ${-smoothState.current}px, 0)`;
  revealPopItems();
  smoothState.rafId = window.requestAnimationFrame(renderSmoothScroll);
}

function stopSmoothScroll() {
  const main = document.querySelector("#main");
  document.body.classList.remove("is-smooth");
  smoothState.enabled = false;
  window.cancelAnimationFrame(smoothState.rafId);
  smoothState.current = window.scrollY;
  main.style.transform = "";
  document.body.style.height = "";
}

function enableSmoothScroll() {
  if (prefersReducedMotion.matches || window.innerWidth <= 980) {
    stopSmoothScroll();
    return;
  }

  if (smoothState.enabled) {
    setBodyHeight();
    return;
  }

  document.body.classList.add("is-smooth");
  smoothState.enabled = true;
  smoothState.current = window.scrollY;
  setBodyHeight();
  renderSmoothScroll();
}

function handleResize() {
  enableSmoothScroll();
  revealPopItems();

  if (window.innerWidth <= 980) {
    hidePreview();
  }
}

hideLoader();
bindFeaturePreview();
bindTabs();
bindScrollButtons();
setRitualTab("write");
enableSmoothScroll();

window.addEventListener("resize", handleResize);
window.addEventListener("load", () => {
  setBodyHeight();
});
window.addEventListener("scroll", () => {
  if (!smoothState.enabled) {
    revealPopItems();
  }
}, { passive: true });
prefersReducedMotion.addEventListener("change", handleResize);
