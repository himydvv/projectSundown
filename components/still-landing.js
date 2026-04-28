"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    title: "Morning Pages",
    copy: "Begin with a blank page, a quiet prompt, and a timer that nudges you to keep writing.",
    label: "2 minute ritual",
    note: "Today I wrote before I checked anything else. The page felt cleaner than my head.",
    eyebrow: "Capture",
    summary: "Blank-page ritual",
  },
  {
    title: "Mood Atlas",
    copy: "Map your emotional patterns over days and weeks without turning journaling into a dashboard.",
    label: "Pattern view",
    note: "Calm peaked on days I walked before noon. That pattern took months to notice by memory alone.",
    eyebrow: "Notice",
    summary: "Emotion patterns",
  },
  {
    title: "Voice to Entry",
    copy: "Talk when writing feels too far away, then turn the transcript into a clean journal page later.",
    label: "Low-friction capture",
    note: "Recorded this during a late walk. Re-read it tonight and finally understood what I was carrying.",
    eyebrow: "Record",
    summary: "From voice to page",
  },
  {
    title: "Weekly Rewind",
    copy: "Every Sunday, Still returns your recurring themes, strongest lines, and unfinished thoughts.",
    label: "Sunday digest",
    note: "The same sentence appeared three times this week: I need slower mornings. Maybe that is the answer.",
    eyebrow: "Review",
    summary: "Pattern-based summary",
  },
  {
    title: "Quiet Prompts",
    copy: "Prompts arrive as invitations, not demands, so the app never feels louder than your own thinking.",
    label: "Prompt deck",
    note: "What did you stop pretending about today? That one question was enough to open the page.",
    eyebrow: "Reflect",
    summary: "Intentional guidance",
  },
];

const ritualContent = {
  write: {
    kicker: "Writing mode",
    description:
      "Clear the interface down to a single entry card, a timer, and a prompt that gets out of your way after you begin.",
  },
  review: {
    kicker: "Review mode",
    description:
      "Return to recurring themes, strongest sentences, and emotional patterns without turning your journal into a productivity dashboard.",
  },
  rituals: {
    kicker: "Ritual mode",
    description:
      "Build repeatable reflection rhythms for mornings, evenings, or difficult weeks and keep them gentle enough to sustain.",
  },
};

const audienceCards = [
  { title: "For writers", copy: "A place to keep fragments before they disappear." },
  { title: "For students", copy: "Capture shifting moods and keep a record of difficult seasons." },
  { title: "For founders", copy: "Separate strategic thinking from personal noise." },
  { title: "For therapists", copy: "Hold reflective prompts between sessions." },
  { title: "For night thinkers", copy: "Voice-first capture when typing feels too loud." },
  { title: "For anyone tired of feeds", copy: "Return to a private archive that belongs only to you." },
];

function getPrefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function renderRitualScreen(tab) {
  if (tab === "review") {
    return (
      <div className="ritual-screen">
        <div className="ritual-screen-top">
          <span>Review</span>
          <span>Sunday</span>
        </div>
        <div className="ritual-screen-body">
          <div className="ritual-card">
            <small>Recurring line</small>
            <p>I keep wanting slower mornings.</p>
          </div>
          <div className="mood-item">
            <strong>Calm entries</strong>
            <span>11</span>
          </div>
          <div className="mood-item">
            <strong>Late-night recordings</strong>
            <span>4</span>
          </div>
          <div className="mood-item">
            <strong>Most tagged feeling</strong>
            <span>Relief</span>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "rituals") {
    return (
      <div className="ritual-screen">
        <div className="ritual-screen-top">
          <span>Rituals</span>
          <span>Night reset</span>
        </div>
        <div className="ritual-screen-body">
          <div className="mood-item">
            <strong>1. Exhale</strong>
            <span>45 sec</span>
          </div>
          <div className="mood-item">
            <strong>2. Write</strong>
            <span>4 min</span>
          </div>
          <div className="mood-item">
            <strong>3. Tag the feeling</strong>
            <span>30 sec</span>
          </div>
          <div className="ritual-card">
            <small>Closing line</small>
            <p>What can stay unfinished until tomorrow?</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ritual-screen">
      <div className="ritual-screen-top">
        <span>Write</span>
        <span>8:00</span>
      </div>
      <div className="ritual-screen-body">
        <div className="ritual-line ritual-line-long"></div>
        <div className="ritual-line ritual-line-mid"></div>
        <div className="ritual-line ritual-line-short"></div>
        <div className="ritual-card">
          <small>Prompt</small>
          <p>What felt lighter than expected today?</p>
        </div>
      </div>
    </div>
  );
}

export default function StillLandingPage() {
  const [loaderHidden, setLoaderHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [ritualTab, setRitualTab] = useState("write");
  const mainRef = useRef(null);
  const revealItemsRef = useRef(new Set());
  const smoothStateRef = useRef({
    current: 0,
    target: 0,
    rafId: 0,
    ease: 0.085,
    enabled: false,
  });

  const registerRevealItem = (node) => {
    if (node) {
      revealItemsRef.current.add(node);
    }
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      setPrefersReducedMotion(media.matches);
    };

    handleChange();
    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const delay = getPrefersReducedMotion() ? 400 : 3000;
    const timeoutId = window.setTimeout(() => {
      setLoaderHidden(true);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!loaderHidden) {
      return;
    }

    const items = Array.from(revealItemsRef.current);

    if (prefersReducedMotion) {
      items.forEach((item) => item.classList.add("is-inview"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [loaderHidden, prefersReducedMotion]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smoothState = smoothStateRef.current;
    let rafId = 0;

    const setBodyHeight = () => {
      if (!smoothState.enabled) {
        document.body.style.height = "";
        main.style.transform = "";
        return;
      }

      document.body.style.height = `${main.getBoundingClientRect().height}px`;
    };

    const stopSmoothScroll = () => {
      document.body.classList.remove("is-smooth");
      smoothState.enabled = false;
      window.cancelAnimationFrame(rafId);
      smoothState.current = window.scrollY;
      main.style.transform = "";
      document.body.style.height = "";
    };

    const renderSmoothScroll = () => {
      const delta = window.scrollY - smoothState.current;
      smoothState.target = window.scrollY;
      smoothState.current += delta * smoothState.ease;

      if (Math.abs(smoothState.target - smoothState.current) < 0.15) {
        smoothState.current = smoothState.target;
      }

      main.style.transform = `translate3d(0, ${-smoothState.current}px, 0)`;
      rafId = window.requestAnimationFrame(renderSmoothScroll);
      smoothState.rafId = rafId;
    };

    const enableSmoothScroll = () => {
      if (media.matches || window.innerWidth <= 980) {
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
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(renderSmoothScroll);
      smoothState.rafId = rafId;
    };

    const handleResize = () => {
      enableSmoothScroll();

      if (window.innerWidth <= 980) {
        setPreviewVisible(false);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (smoothState.enabled) {
        setBodyHeight();
      }
    });

    resizeObserver.observe(main);
    enableSmoothScroll();
    window.addEventListener("resize", handleResize);
    media.addEventListener("change", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      media.removeEventListener("change", handleResize);
      stopSmoothScroll();
    };
  }, []);

  const scrollToTarget = (target) => {
    const element = document.querySelector(target);
    if (!element) {
      return;
    }

    window.scrollTo({
      top: element.offsetTop,
      behavior: getPrefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const handleFeatureActivate = (feature, showPreview = true) => {
    setActiveFeature(feature);

    if (showPreview) {
      setPreviewVisible(true);
    }
  };

  const activeRitual = ritualContent[ritualTab];

  return (
    <>
      <div id="loader" aria-hidden="true" className={loaderHidden ? "is-hidden" : ""}>
        <h1>Reflect</h1>
        <h1>Release</h1>
        <h1>Return</h1>
      </div>

      <aside
        id="preview-card"
        aria-hidden={previewVisible ? "false" : "true"}
        className={previewVisible ? "is-visible" : ""}
        onMouseEnter={() => setPreviewVisible(true)}
        onMouseLeave={() => setPreviewVisible(false)}
      >
        <p className="preview-kicker">Feature Preview</p>
        <h3 id="preview-title">{activeFeature.title}</h3>
        <p id="preview-copy">{activeFeature.copy}</p>
        <div className="preview-surface">
          <div className="preview-pill" id="preview-label">
            {activeFeature.label}
          </div>
          <div className="preview-note">
            <span></span>
            <p id="preview-note">{activeFeature.note}</p>
          </div>
        </div>
      </aside>

      <div id="smooth-shell">
        <main id="main" ref={mainRef}>
          <section id="page1" className="page hero-page">
            <header className="site-header">
              <button className="brand-mark" onClick={() => scrollToTarget("#page1")} type="button">
                STILL
              </button>
              <nav className="header-nav" aria-label="Primary">
                <button className="nav-pill" onClick={() => scrollToTarget("#page2")} type="button">
                  Story
                </button>
                <button className="nav-pill" onClick={() => scrollToTarget("#page3")} type="button">
                  Features
                </button>
                <button className="nav-pill" onClick={() => scrollToTarget("#page4")} type="button">
                  Rituals
                </button>
                <button
                  className="nav-pill nav-pill-accent"
                  onClick={() => scrollToTarget("#page5")}
                  type="button"
                >
                  Join Waitlist
                </button>
              </nav>
              <button className="menu-pill" onClick={() => scrollToTarget("#page4")} type="button">
                Menu
              </button>
            </header>

            <div className="hero-grid">
              <div className="hero-copy">
                <p
                  className="section-lead pop-block"
                  ref={registerRevealItem}
                  style={{ "--pop-delay": "0.08s" }}
                >
                  Still is a private journal app for thoughts that deserve room, rhythm, and a little
                  less noise.
                </p>
                <div
                  className="hero-title pop-heading"
                  ref={registerRevealItem}
                  style={{ "--pop-delay": "0.16s" }}
                >
                  <h1 className="immersive-heading hero-heading">
                    <span className="line-shell">
                      <span className="line-pop">A QUIETER</span>
                    </span>
                    <span className="line-shell">
                      <span className="line-pop">HOME FOR</span>
                    </span>
                    <span className="line-shell">
                      <span className="line-pop">
                        YOUR <span className="text-hot">MIND.</span>
                      </span>
                    </span>
                  </h1>
                </div>
              </div>

              <div className="hero-visual">
                <div className="hero-badge">
                  <span></span>
                  Private by default
                </div>
                <div className="phone-shell">
                  <div className="phone-top"></div>
                  <div className="phone-screen">
                    <div className="screen-header">
                      <p>Tuesday, 9:12 PM</p>
                      <p>Moon phase journal</p>
                    </div>
                    <article className="entry-card">
                      <span className="entry-chip">Tonight&apos;s entry</span>
                      <h3>I finally wrote without editing myself.</h3>
                      <p>
                        No streak panic. No feed. Just one quiet paragraph that stayed honest all the
                        way through.
                      </p>
                    </article>
                    <div className="mood-strip">
                      <div className="mood-item">
                        <strong>Calm</strong>
                        <span>68%</span>
                      </div>
                      <div className="mood-item">
                        <strong>Focused</strong>
                        <span>24%</span>
                      </div>
                      <div className="mood-item">
                        <strong>Tired</strong>
                        <span>8%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="floating-card floating-card-right">
                  <p className="floating-label">Night Reset</p>
                  <h4>3 prompts, 6 minutes, done.</h4>
                </div>
                <div className="floating-card floating-card-left">
                  <p className="floating-label">Weekly rewind</p>
                  <h4>Your best lines return every Sunday.</h4>
                </div>
              </div>
            </div>

            <div
              className="hero-actions pop-block"
              ref={registerRevealItem}
              style={{ "--pop-delay": "0.28s" }}
            >
              <button className="cta-primary" onClick={() => scrollToTarget("#page3")} type="button">
                Explore the experience
              </button>
              <button className="cta-secondary" onClick={() => scrollToTarget("#page4")} type="button">
                See the ritual system
              </button>
            </div>

            <div className="hero-shape hero-shape-a"></div>
            <div className="hero-shape hero-shape-b"></div>
            <div className="hero-shape hero-shape-c"></div>
          </section>

          <section id="page2" className="page story-page">
            <div className="marquee" aria-hidden="true">
              {[0, 1].map((track) => (
                <div className="marquee-track" key={track}>
                  <span>PRIVATE</span>
                  <i></i>
                  <span>DAILY</span>
                  <i></i>
                  <span>REFLECTIVE</span>
                  <i></i>
                  <span>GENTLE</span>
                  <i></i>
                  <span>SEARCHABLE</span>
                  <i></i>
                </div>
              ))}
            </div>

            <div className="story-grid">
              <div className="story-copy">
                <div
                  className="section-tag pop-block"
                  ref={registerRevealItem}
                  style={{ "--pop-delay": "0.04s" }}
                >
                  <span></span>
                  Product story
                </div>
                <h2
                  className="immersive-heading story-heading pop-heading"
                  ref={registerRevealItem}
                  style={{ "--pop-delay": "0.12s" }}
                >
                  <span className="line-shell">
                    <span className="line-pop">Your journal</span>
                  </span>
                  <span className="line-shell">
                    <span className="line-pop">should feel</span>
                  </span>
                  <span className="line-shell">
                    <span className="line-pop">
                      like a <span className="text-hot">room</span>,
                    </span>
                  </span>
                  <span className="line-shell">
                    <span className="line-pop">
                      not a <span className="text-mint">feed.</span>
                    </span>
                  </span>
                </h2>
              </div>

              <div className="story-side pop-block" ref={registerRevealItem} style={{ "--pop-delay": "0.2s" }}>
                <div className="paper-collage">
                  <div className="paper-card paper-card-main">
                    <p>April 21</p>
                    <h3>Today&apos;s thread</h3>
                    <ul>
                      <li>What stayed with you?</li>
                      <li>What softened?</li>
                      <li>What do you want to remember?</li>
                    </ul>
                  </div>
                  <div className="paper-card paper-card-note">
                    <p>Quiet metrics</p>
                    <strong>18 entries this month</strong>
                  </div>
                </div>
                <p className="story-text">
                  Still is designed for people who want reflection without productivity theater. The
                  interface feels tactile, the writing rituals stay short, and the archive becomes more
                  useful the more honestly you write.
                </p>
              </div>
            </div>

            <div className="story-orb">
              <div className="story-orb-core"></div>
              <div className="story-orb-glow"></div>
            </div>
          </section>

          <section id="page3" className="page feature-page" onMouseLeave={() => setPreviewVisible(false)}>
            <div className="section-tag">
              <span></span>
              Core features
            </div>

            <div className="feature-list">
              {features.map((feature) => (
                <button
                  className={`feature-row${activeFeature.title === feature.title ? " is-active" : ""}`}
                  key={feature.title}
                  onFocus={() => handleFeatureActivate(feature)}
                  onMouseEnter={() => handleFeatureActivate(feature)}
                  type="button"
                >
                  <div className="feature-row-fill"></div>
                  <div className="feature-row-content">
                    <h3>{feature.title}</h3>
                    <div>
                      <strong>{feature.eyebrow}</strong>
                      <p>{feature.summary}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section id="page4" className="page ritual-page">
            <div className="ritual-panel">
              <div className="ritual-copy">
                <div className="ritual-tabs" role="tablist" aria-label="Still modes">
                  {Object.keys(ritualContent).map((tab) => {
                    const isActive = ritualTab === tab;

                    return (
                      <button
                        aria-selected={isActive ? "true" : "false"}
                        className={`ritual-tab${isActive ? " is-active" : ""}`}
                        id={`tab-${tab}`}
                        key={tab}
                        onClick={() => setRitualTab(tab)}
                        role="tab"
                        type="button"
                      >
                        {tab === "write" ? "Write" : tab === "review" ? "Review" : "Rituals"}
                      </button>
                    );
                  })}
                </div>

                <div className="ritual-text">
                  <p className="ritual-kicker" id="ritual-kicker">
                    {activeRitual.kicker}
                  </p>
                  <p id="ritual-description">{activeRitual.description}</p>
                </div>
              </div>

              <div className="ritual-visual" id="ritual-visual" aria-live="polite">
                {renderRitualScreen(ritualTab)}
              </div>
            </div>

            <div className="section-tag section-tag-spacing">
              <span></span>
              Who it is for
            </div>

            <div className="audience-rail" aria-hidden="true">
              {[0, 1].map((track) => (
                <div className="audience-track" key={track}>
                  {audienceCards.map((card) => (
                    <article className="audience-card" key={`${track}-${card.title}`}>
                      <h3>{card.title}</h3>
                      <p>{card.copy}</p>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section id="page5" aria-hidden="true"></section>
        </main>
      </div>

      <footer id="footer">
        <div className="footer-shape footer-shape-left"></div>
        <div className="footer-shape footer-shape-right"></div>

        <div className="footer-upper">
          <div className="footer-links">
            <button className="footer-link" onClick={() => scrollToTarget("#page1")} type="button">
              Home
            </button>
            <button className="footer-link" onClick={() => scrollToTarget("#page3")} type="button">
              Features
            </button>
            <button className="footer-link" onClick={() => scrollToTarget("#page4")} type="button">
              Rituals
            </button>
          </div>

          <div className="footer-signup">
            <p>Start a quieter archive. Join the waitlist for the first release of Still.</p>
            <div className="signup-field">
              <span>Email address</span>
              <button type="button">Notify me</button>
            </div>
          </div>
        </div>

        <div className="footer-lower">
          <h2>STILL</h2>
          <div className="footer-meta">
            <p>Private journal app concept</p>
            <p>Designed for calm reflection</p>
            <p>Built as a frontend-only Next.js app</p>
          </div>
        </div>
      </footer>
    </>
  );
}
