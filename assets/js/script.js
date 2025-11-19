// =========================================
// 1. NAVIGATION LOGIC (TIDAK BERUBAH)
// =========================================
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const overlay = document.getElementById("overlay");
const searchContainer = document.getElementById("searchContainer");
const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");

function toggleMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active"); 
    overlay.classList.toggle("active");
}

if(hamburger) { hamburger.addEventListener("click", toggleMenu); }
if(overlay) { overlay.addEventListener("click", toggleMenu); }

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
        overlay.classList.remove("active");
    });
});

// 1B. SEARCH TOGGLE LOGIC
if (searchIcon && searchContainer && searchInput) {
    searchIcon.addEventListener('click', function() {
        searchContainer.classList.toggle('active');
        if (searchContainer.classList.contains('active')) {
            searchInput.focus();
        } else {
            searchInput.blur();
        }
    });

    document.addEventListener('click', function(e) {
        if (!searchContainer.contains(e.target) && searchContainer.classList.contains('active')) {
            searchContainer.classList.remove('active');
        }
    });
}


// =========================================
// 2. SLIDER JUMBOTRON (TIDAK BERUBAH)
// =========================================
let slideIndex = 0;
const slidesContainer = document.querySelector('.jumbotron-slider .slides');
const slides = document.querySelectorAll('.jumbotron-slider .slide');

if (slides.length > 0) {
    const totalSlides = slides.length;
    const originalSlidesCount = totalSlides - 1; 

    function showSlides() {
        slideIndex++;
        slidesContainer.style.transition = 'transform 0.5s ease-in-out';
        slidesContainer.style.transform = `translateX(-${slideIndex * 100}%)`;

        if (slideIndex >= originalSlidesCount) {
            setTimeout(() => {
                slidesContainer.style.transition = 'none';
                slideIndex = 0;
                slidesContainer.style.transform = `translateX(0)`;
            }, 500);
        }
    }
    setInterval(showSlides, 3000); 
}

// =========================================
// 3. GAME FILTER & SEARCH (LOGIKA DUA GRID BARU)
// =========================================
const gameGrid = document.getElementById("gameGrid"); // Grid lama (pay, testi)
const gameGridAlt = document.getElementById("gameGridAlt"); // Grid baru (ikan, akun)
const loadMoreBtn = document.getElementById("loadMoreBtn");
const maxShowInitial = 6; 

// Tambahkan kategori yang menggunakan GAYA BARU di sini
const altCategories = ['ikan', 'akun', 'pay']; 

// Ambil semua item dari KEDUA grid
const allGameItems = Array.from(document.querySelectorAll('.game-item, .game-item-alt'));

// Sort A-Z 
allGameItems.sort((a, b) => {
    const tA = a.querySelector('.game-title').textContent.trim().toLowerCase();
    const tB = b.querySelector('.game-title').textContent.trim().toLowerCase();
    return tA.localeCompare(tB);
});

// Kosongkan kedua grid dan isi ulang setelah sorting
gameGrid.innerHTML = '';
gameGridAlt.innerHTML = '';
allGameItems.forEach(item => {
    if (altCategories.includes(item.getAttribute('data-category'))) {
        gameGridAlt.appendChild(item); // Pindahkan Ikan & Akun ke grid Alt
    } else {
        gameGrid.appendChild(item); // Pindahkan sisanya ke grid Lama
    }
});

let currentCategory = 'ikan'; 
let isShowingAll = false;

function filterGames(category) {
    currentCategory = category;
    isShowingAll = false;
    if(searchInput) searchInput.value = "";

    let targetGrid;
    let targetItems;
    let displayStyle;
    
    // 1. Tentukan grid mana yang aktif
    if (altCategories.includes(category)) { // Jika kategori adalah Ikan atau Akun
        gameGrid.style.display = 'none';
        gameGridAlt.style.display = 'grid';
        targetGrid = gameGridAlt;
        targetItems = Array.from(gameGridAlt.children);
        displayStyle = 'flex'; // Item Ikan & Akun menggunakan display: flex
    } else { // Kategori lain (Payment, Testimoni)
        gameGridAlt.style.display = 'none';
        gameGrid.style.display = 'grid';
        targetGrid = gameGrid;
        targetItems = Array.from(gameGrid.children);
        displayStyle = 'block'; // Item lain menggunakan display: block
    }

    const visibleItems = targetItems.filter(item => item.getAttribute('data-category') === category);
    
    // 2. Sembunyikan semua item di grid yang aktif
    targetItems.forEach(item => item.style.display = 'none');

    // 3. Tampilkan item yang sesuai
    visibleItems.forEach((item, index) => {
        item.classList.remove('animate-show');
        if (index < maxShowInitial) {
            item.style.display = displayStyle; 
            void item.offsetWidth; 
            item.classList.add('animate-show');
            item.style.animationDelay = `${index * 0.05}s`;
        }
        item.classList.remove("active");
    });

    if (visibleItems.length > maxShowInitial) {
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.textContent = 'Tampilkan Lebih Banyak';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Category Click
document.querySelectorAll(".category-item").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".category-item").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        filterGames(btn.getAttribute('data-category'));
    });
});

// Load More Click (Ditargetkan ke grid yang aktif)
loadMoreBtn.addEventListener("click", () => {
    // Tentukan grid yang aktif
    const activeGrid = altCategories.includes(currentCategory) ? gameGridAlt : gameGrid;
    const items = Array.from(activeGrid.children).filter(item => item.getAttribute('data-category') === currentCategory);
    // Tentukan display style yang benar
    const displayStyle = altCategories.includes(currentCategory) ? 'flex' : 'block';

    if (!isShowingAll) {
        items.forEach(item => { 
            item.style.display = displayStyle; 
            item.classList.add('animate-show'); 
        });
        loadMoreBtn.textContent = 'Lebih Sedikit';
        isShowingAll = true;
    } else {
        items.forEach((item, i) => { 
            if (i >= maxShowInitial) item.style.display = 'none'; 
        });
        loadMoreBtn.textContent = 'Tampilkan Lebih Banyak';
        activeGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        isShowingAll = false;
    }
});

// Search Logic (Ditargetkan ke grid yang aktif)
if(searchInput) {
    searchInput.addEventListener("keyup", (e) => {
        const term = e.target.value.toLowerCase();
        
        if (searchContainer.classList.contains('active')) {
            const targetItems = altCategories.includes(currentCategory) ? Array.from(gameGridAlt.children) : Array.from(gameGrid.children);
            const displayStyle = altCategories.includes(currentCategory) ? 'flex' : 'block';

            if (term === "") { filterGames(currentCategory); return; }

            targetItems.forEach(item => {
                const title = item.querySelector('.game-title').innerText.toLowerCase();
                const isInCat = item.getAttribute('data-category') === currentCategory;

                if (isInCat && title.includes(term)) {
                    item.style.display = displayStyle;
                    item.classList.remove('animate-show');
                } else {
                    item.style.display = 'none';
                }
            });
            loadMoreBtn.style.display = 'none';
        }
    });
}

// Category Scroll Logic
const catWrapper = document.querySelector(".category-wrapper");
const leftBtn = document.querySelector(".left-btn");
const rightBtn = document.querySelector(".right-btn");
if (catWrapper && leftBtn && rightBtn) {
    rightBtn.addEventListener("click", () => catWrapper.scrollBy({ left: 150, behavior: "smooth" }));
    leftBtn.addEventListener("click", () => catWrapper.scrollBy({ left: -150, behavior: "smooth" }));
}

// Init
filterGames('ikan');