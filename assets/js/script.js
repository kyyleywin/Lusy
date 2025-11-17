const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const themeToggle = document.getElementById("themeToggle");
const searchInput = document.querySelector(".search input");

// OPEN/CLOSE SIDEBAR WITH TOGGLE
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
});

// CLOSE WHEN CLICKING OVERLAY
overlay.addEventListener("click", () => {
    hamburger.classList.remove("active");
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
});

// DARK MODE SWITCH
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    themeToggle.textContent =
        document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// FOCUS SEARCH WHEN PRESSING "/"
window.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
});

// JUMBOTRON SLIDER
let slideIndex = 0;
const slides = document.querySelectorAll(".jumbotron-slider .slide");
const dots = document.querySelectorAll(".jumbotron-slider .dot");

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
        dots[i].classList.toggle("active", i === index);
    });
}

// Auto slide setiap 3 detik dan looping terus
setInterval(() => {
    slideIndex = (slideIndex + 1) % slides.length;
    showSlide(slideIndex);
}, 3000);

// Klik dot untuk pindah slide
dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
        slideIndex = i;
        showSlide(slideIndex);
    });
});
