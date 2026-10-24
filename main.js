/* ===================== LOADING SCREEN ===================== */
(function () {
  const loader = document.getElementById("loader");
  const fill = document.getElementById("loader-fill");
  const count = document.getElementById("loader-count");
  const MIN_TIME = 2500; // minimum time the loader stays (ms)
  const start = performance.now();

  let shown = 0;
  let pageLoaded = false;
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    if (loader) loader.classList.add("hidden");
    document.body.classList.remove("loading");
    document.dispatchEvent(new Event("loaderDone")); // starts the text effect
    setTimeout(() => loader && loader.remove(), 1000);
  }

  // Smooth progress: creeps to 90%, completes when the page has loaded
  const timer = setInterval(() => {
    const cap = pageLoaded ? 100 : 90;
    shown = Math.min(cap, shown + Math.max(1, (cap - shown) * 0.035));
    const v = Math.round(shown);
    if (fill) fill.style.width = v + "%";
    if (count) count.textContent = v;

    if (pageLoaded && v >= 100 && performance.now() - start >= MIN_TIME) {
      clearInterval(timer);
      setTimeout(finish, 250);
    }
  }, 30);

  window.addEventListener("load", () => (pageLoaded = true));

  // Safety net: never trap the visitor behind the loader
  setTimeout(() => {
    clearInterval(timer);
    finish();
  }, 8000);
})();

// var typed = new Typed(".text", {
//   strings: ["Frontend Developer", "SQL Developer", "Java Developer"],
//   typeSpeed: 100,
//   backSpeed: 100,
//   backDelay: 1000,
//   loop: true,
// });


const phrases3 = ["Frontend Developer", "SQL Developer", "Java Developer"];
let chars = "!<>-_\\/[]{}—=+*^?#___*&^_____";
let part = "";
let scrambleEl = document.querySelector(".home-content .text");
let phraseIndex = 0;
let counter = 0;

function scrambleEffect() {
  let phrase = phrases3[phraseIndex];
  let scrambled = phrase.split("").map((char, i) => {
    if (counter > i) return phrase[i];
    return chars[Math.floor(Math.random() * chars.length)];
  }).join("");

  scrambleEl.textContent = scrambled;
  counter++;

  if (counter <= phrase.length) {
    requestAnimationFrame(scrambleEffect);
  } else {
    setTimeout(() => {
      counter = 0;
      phraseIndex = (phraseIndex + 1) % phrases3.length;
      scrambleEffect();
    }, 4000);
  }
}

// start the text effect once the loading screen has gone
document.addEventListener("loaderDone", scrambleEffect);

// Pull down at the top of the page to replay the loading animation.
const pullReload = document.getElementById("pull-reload");
const pullReloadMessage = document.getElementById("pull-reload-message");
const pullReloadContent = pullReload.querySelector(".pull-reload-content");
const pullReloadOrbit = pullReload.querySelector(".pull-reload-orbit");
const pullReloadProgress = pullReload.querySelector(".pull-reload-progress span");
const pullReloadThreshold = 130;
let pullStartY = null;
let wheelPullDistance = 0;
let wheelPullTimer = null;
let reloadStarted = false;

function updatePullReload(distance) {
  const progress = Math.min(distance / pullReloadThreshold, 1);
  pullReloadOrbit.style.transform = `rotate(${progress * 360}deg)`;
  pullReloadProgress.style.width = `${progress * 100}%`;
  pullReload.classList.toggle("visible", distance > 0);
  pullReload.setAttribute("aria-hidden", String(distance <= 0));
  pullReloadMessage.textContent =
    progress >= 1 ? "Release to refresh" : "Pull to refresh";
}

function startPullReload() {
  if (reloadStarted) return;
  reloadStarted = true;
  pullReload.classList.add("is-reloading");
  pullReloadMessage.textContent = "Refreshing portfolio…";
  pullReload.setAttribute("aria-hidden", "false");
  window.setTimeout(() => window.location.reload(), 2200);
}

function isAtPageTop() {
  return window.scrollY <= 0 && !document.body.classList.contains("loading");
}

window.addEventListener(
  "touchstart",
  (event) => {
    if (!isAtPageTop() || event.touches.length !== 1) return;
    pullStartY = event.touches[0].clientY;
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    if (pullStartY === null || !isAtPageTop() || event.touches.length !== 1) return;

    const distance = Math.max(0, event.touches[0].clientY - pullStartY);
    if (distance > 0) event.preventDefault();
    updatePullReload(distance);
    if (distance >= pullReloadThreshold) startPullReload();
  },
  { passive: false }
);

window.addEventListener("touchend", () => {
  pullStartY = null;
  if (!reloadStarted) updatePullReload(0);
});
window.addEventListener("touchcancel", () => {
  pullStartY = null;
  if (!reloadStarted) updatePullReload(0);
});

window.addEventListener(
  "wheel",
  (event) => {
    if (!isAtPageTop() || event.deltaY >= 0 || reloadStarted) return;

    wheelPullDistance += -event.deltaY;
    updatePullReload(wheelPullDistance);
    if (wheelPullDistance >= pullReloadThreshold) {
      startPullReload();
      return;
    }

    window.clearTimeout(wheelPullTimer);
    wheelPullTimer = window.setTimeout(() => {
      wheelPullDistance = 0;
      updatePullReload(0);
    }, 1000);
  },
  { passive: true }
);


//circle skills//////////////////////////////////////////////////////

const circles = document.querySelectorAll(".circle");

circles.forEach((elem) => {
  let dots = parseInt(elem.getAttribute("data-dots"));
  let marked = parseInt(elem.getAttribute("data-percent"));
  let percent = Math.floor((dots * marked) / 100);
  let points = "";
  let rotate = 360 / dots;

  for (let i = 0; i < dots; i++) {
    points += `<div class="points" style="--i:${i}; --rot:${rotate}deg"></div>`;
  }

  elem.innerHTML = points;

  const pointsMarked = elem.querySelectorAll(".points");
  for (let i = 0; i < percent; i++) {
    pointsMarked[i].classList.add("marked");
  }
});

// mix it up portfolio section////////////////////////////////////////////////
const mixer = mixitup(".portfolio-gallery", {
  controls: { enable: false },
});
const portfolioFilterGroup = document.querySelector(".filter-button");
const portfolioFilterButtons = portfolioFilterGroup.querySelectorAll("[data-filter]");
let pendingPortfolioFilter = null;
let isPortfolioFiltering = false;

function applyPortfolioFilter() {
  if (pendingPortfolioFilter === null) {
    isPortfolioFiltering = false;
    return;
  }

  const filter = pendingPortfolioFilter;
  pendingPortfolioFilter = null;
  isPortfolioFiltering = true;

  mixer.filter(filter).then(
    () => {
      isPortfolioFiltering = false;
      if (pendingPortfolioFilter !== null) applyPortfolioFilter();
    },
    (error) => {
      console.error("Portfolio filter failed:", error);
      isPortfolioFiltering = false;
      if (pendingPortfolioFilter !== null) applyPortfolioFilter();
    }
  );
}

portfolioFilterButtons.forEach((button) => {
  const isActive = button.dataset.filter === "all";
  button.classList.toggle("mixitup-control-active", isActive);
  button.setAttribute("aria-pressed", String(isActive));
});

portfolioFilterGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button || !portfolioFilterGroup.contains(button)) return;

  portfolioFilterButtons.forEach((filterButton) => {
    const isActive = filterButton === button;
    filterButton.classList.toggle("mixitup-control-active", isActive);
    filterButton.setAttribute("aria-pressed", String(isActive));
  });

  pendingPortfolioFilter = button.dataset.filter;
  if (!isPortfolioFiltering) applyPortfolioFilter();
});



// active menu + page dots + scroll reveal////////////////////////////////

const menuLi = document.querySelectorAll("header ul li a");
const sections = document.querySelectorAll("section[id]");

// dots on the right edge, one per page
const pageDots = document.createElement("nav");
pageDots.id = "page-dots";
pageDots.setAttribute("aria-label", "Page indicator");
sections.forEach((sec) => {
  const a = document.createElement("a");
  a.href = "#" + sec.id;
  a.title = sec.id.charAt(0).toUpperCase() + sec.id.slice(1);
  a.setAttribute("aria-label", "Go to " + a.title);
  pageDots.appendChild(a);
});
document.body.appendChild(pageDots);
const dotLinks = pageDots.querySelectorAll("a");

function setActive(id) {
  menuLi.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + id));
  dotLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + id));
}

const pageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        setActive(e.target.id);
        e.target.classList.add("in-view");
      }
    });
  },
  { threshold: 0.45 }
);
sections.forEach((sec) => pageObserver.observe(sec));

// content of each page fades in as it scrolls into view
const revealTargets = document.querySelectorAll(
  ".about-img, .about-text, .sub-title, .services-list > div, .container1, " +
    ".filter-button, .portfolio-gallery, .content form"
);
revealTargets.forEach((el, i) => {
  el.classList.add("reveal");
  el.style.transitionDelay = (i % 3) * 0.12 + "s";
});
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealTargets.forEach((el) => revealObserver.observe(el));

// sticky//////////////////////////////////////////////////////

const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  header.classList.toggle("sticky", window.scrollY > 50);
});

// Toggle menu icon////////////////////////////////////////////////////
const menuIcon = document.querySelector("#menu-icon");
const navbar = document.querySelector(".navbar");

menuIcon.addEventListener("click", () => {
  menuIcon.classList.toggle("bx-x");
  navbar.classList.toggle("open");
});

function closeMenu() {
  menuIcon.classList.remove("bx-x");
  navbar.classList.remove("open");
}
window.addEventListener("scroll", closeMenu);
navbar.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
menuIcon.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    menuIcon.click();
  }
});

// page active line//////////////////

const scrollLine = document.getElementById("scroll-line");
const scrollLineBottom = document.getElementById("scroll-line-bottom");
function updateScrollLine() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  scrollLine.style.width = scrollPercent + "%";
  scrollLineBottom.style.width = scrollPercent + "%";
}
window.addEventListener("scroll", updateScrollLine, { passive: true });
window.addEventListener("resize", updateScrollLine);
updateScrollLine();


// footer year////////////////////////////////////////////////////////////
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// contact form: validates, then opens the visitor's email app ready to send//
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = form.elements; // note: form.name would be the form's own name
    const name = f.name.value.trim();
    const email = f.email.value.trim();
    const phone = f.phone.value.trim();
    const message = f.message.value.trim();

    [f.name, f.email, f.message].forEach((x) => x.classList.remove("invalid"));
    statusEl.className = "";

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk || !message) {
      if (!name) f.name.classList.add("invalid");
      if (!emailOk) f.email.classList.add("invalid");
      if (!message) f.message.classList.add("invalid");
      statusEl.textContent = "Please fill in your name, a valid email and a message.";
      return;
    }

    const subject = encodeURIComponent("Portfolio enquiry from " + name);
    const body = encodeURIComponent(
      message + "\n\n— " + name + "\nEmail: " + email + (phone ? "\nPhone: " + phone : "")
    );
    window.location.href = "mailto:kutetarun20@gmail.com?subject=" + subject + "&body=" + body;

    statusEl.className = "ok";
    statusEl.textContent = "Thanks, " + name + "! Your email app should open with the message ready to send.";
    form.reset();
  });
}
