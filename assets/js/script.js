// =========================================
// 1. NAVIGASI & UI INTERACTION
// =========================================
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const overlay = document.getElementById("overlay");
const searchContainer = document.getElementById("searchContainer");
const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");

// Toggle Hamburger Menu
function toggleMenu() {
    if (hamburger && navMenu && overlay) {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        overlay.classList.toggle("active");
    }
}

if (hamburger) hamburger.addEventListener("click", toggleMenu);
if (overlay) overlay.addEventListener("click", toggleMenu);

// Toggle Search Box
if (searchIcon) {
    searchIcon.addEventListener('click', () => {
        searchContainer.classList.toggle('active');
        if (searchContainer.classList.contains('active')) {
            searchInput.focus();
        } else {
            searchInput.value = ""; // Reset saat ditutup
            searchInput.blur();
        }
    });
}

// =========================================
// 2. JUMBOTRON SLIDER
// =========================================
let slideIndex = 0;
const slidesContainer = document.querySelector('.slides');
const slides = document.querySelectorAll('.slide');

if (slides.length > 0) {
    const totalSlides = slides.length;
    function showSlides() {
        slideIndex++;
        if (slideIndex >= totalSlides) slideIndex = 0;
        if(slidesContainer) slidesContainer.style.transform = `translateX(-${slideIndex * 100}%)`;
    }
    setInterval(showSlides, 3000);
}

// Fungsi tambahan: Klik slide untuk pindah kategori (Sesuai HTML index.html Anda)
function selectCategoryFromSlide(categoryName) {
    const targetBtn = document.querySelector(`.category-item[data-category="${categoryName}"]`);
    if (targetBtn) {
        // Trigger klik pada tombol kategori
        targetBtn.click();
    }
}

// =========================================
// 3. LIGHTBOX / PREVIEW VARIABLES
// =========================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const closeLightbox = document.querySelector('.close-lightbox');
const prevBtnLb = document.querySelector('.prev-btn-lb');
const nextBtnLb = document.querySelector('.next-btn-lb');

let currentTestiIndex = 0; 
let currentTestiList = []; 

// =========================================
// 4. LOGIKA RENDER DATA (INTI APLIKASI)
// =========================================
const maxShowInitial = 6; 
let currentCategory = 'ikan'; 
let isShowingAll = false;

// Mapping Data (Pastikan file data.js sudah diload di HTML)
const database = {
    ikan: typeof dataIkan !== 'undefined' ? dataIkan : [],
    akun: typeof dataAkun !== 'undefined' ? dataAkun : [],
    pay: typeof dataPay !== 'undefined' ? dataPay : [],
    testimoni: typeof dataTestimoni !== 'undefined' ? dataTestimoni : []
};

// Konfigurasi Layout
const altLayoutCategories = ['ikan', 'akun', 'pay']; // Tampilan List
const gridStandard = document.getElementById('gameGrid'); // Tampilan Kotak
const gridAlt = document.getElementById('gameGridAlt'); // Tampilan List
const loadMoreBtn = document.getElementById('loadMoreBtn');
const categoryItems = document.querySelectorAll('.category-item');

/**
 * Fungsi Utama Render
 */
function renderGames(category, searchTerm = "") {
    currentCategory = category;
    
    // 1. AMBIL DATA
    let items = [...(database[category] || [])];

    // 2. SORTING ABJAD (Khusus Ikan & Akun)
    if (['ikan', 'akun'].includes(category)) {
        items.sort((a, b) => a.title.localeCompare(b.title));
    }

    // 3. FILTER PENCARIAN
    const filteredItems = items.filter(item => {
        return item.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Simpan list untuk Lightbox (Next/Prev)
    if(category === 'testimoni') {
        currentTestiList = filteredItems;
    }

    // 4. PERSIAPAN GRID
    gridStandard.innerHTML = '';
    gridAlt.innerHTML = '';
    gridStandard.style.display = 'none';
    gridAlt.style.display = 'none';

    const isAltLayout = altLayoutCategories.includes(category);
    const targetGrid = isAltLayout ? gridAlt : gridStandard;

    if (isAltLayout) {
        gridAlt.style.display = 'grid'; 
    } else {
        gridStandard.style.display = 'grid';
    }

    // Tentukan item yang muncul
    const itemsToShow = (isShowingAll || searchTerm !== "") 
                        ? filteredItems 
                        : filteredItems.slice(0, maxShowInitial);

    if (itemsToShow.length === 0) {
        targetGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">Item tidak ditemukan</div>`;
        loadMoreBtn.style.display = 'none';
        return;
    }

    // 5. GENERATE HTML
    itemsToShow.forEach((item, index) => {
        const animDelay = index * 0.05; 
        const card = document.createElement('div');

        if (isAltLayout) {
            // --- TAMPILAN LIST (Ikan, Akun, Pay) ---
            card.className = 'game-item-alt animate-show';
            card.style.animationDelay = `${animDelay}s`;
            card.innerHTML = `
                <img src="${item.img}" alt="${item.title}" loading="lazy">
                <div class="game-info">
                    <div class="game-title">${item.title}</div>
                    <div class="game-description">${item.desc}</div>
                </div>`;
            
            // === [UPDATE PENTING] ===
            // LOGIKA KLIK: HANYA IKAN & AKUN YANG BUKA TAB BARU
            if (['ikan', 'akun'].includes(category)) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    // Membuka detail.html dengan parameter kategori & produk
                    const targetUrl = `detail.html?category=${category}&product=${encodeURIComponent(item.title)}`;
                    window.open(targetUrl, '_blank');
                });
            }
            
        } else {
            // --- TAMPILAN KOTAK (Testimoni) ---
            card.className = 'game-item animate-show';
            card.style.animationDelay = `${animDelay}s`;
            card.innerHTML = `
                <img src="${item.img}" alt="${item.title}" loading="lazy">
                <div class="game-title">${item.title}</div>
                <div class="game-description">${item.desc}</div>`;
            
            // FITUR: KLIK PREVIEW (Hanya Testimoni)
            if (category === 'testimoni') {
                card.style.cursor = 'zoom-in';
                card.title = "Klik untuk memperbesar";
                card.addEventListener('click', () => {
                    openLightbox(index);
                });
            }
        }
        targetGrid.appendChild(card);
    });

    // 6. ATUR TOMBOL LOAD MORE
    if (filteredItems.length > maxShowInitial && searchTerm === "") {
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.textContent = isShowingAll ? 'Lebih Sedikit' : 'Tampilkan Lebih Banyak';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// =========================================
// 5. FUNGSI LIGHTBOX (PREVIEW FOTO)
// =========================================
function openLightbox(index) {
    currentTestiIndex = index; 
    updateLightboxContent();
    if(lightbox) {
        lightbox.style.display = "flex";
        document.body.style.overflow = "hidden"; // Matikan scroll body
    }
}

function closeLightboxFunc() {
    if(lightbox) {
        lightbox.style.display = "none";
        document.body.style.overflow = "auto"; // Hidupkan scroll body
    }
}

function updateLightboxContent() {
    const data = currentTestiList[currentTestiIndex];
    if(data && lightboxImg) {
        lightboxImg.src = data.img;
        if(lightboxCaption) lightboxCaption.textContent = `${data.title} - ${data.desc}`;
    }
}

function nextImage() {
    currentTestiIndex++;
    if (currentTestiIndex >= currentTestiList.length) currentTestiIndex = 0; // Loop ke awal
    updateLightboxContent();
}

function prevImage() {
    currentTestiIndex--;
    if (currentTestiIndex < 0) currentTestiIndex = currentTestiList.length - 1; // Loop ke akhir
    updateLightboxContent();
}

// Event Listener Lightbox
if(closeLightbox) closeLightbox.addEventListener('click', closeLightboxFunc);
if(nextBtnLb) nextBtnLb.addEventListener('click', nextImage);
if(prevBtnLb) prevBtnLb.addEventListener('click', prevImage);
if(lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightboxFunc(); // Tutup jika klik area gelap
    });
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.style.display === "flex") {
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "Escape") closeLightboxFunc();
    }
});

// =========================================
// 6. EVENT LISTENERS & SINKRONISASI NAVBAR
// =========================================

// A. Sinkronisasi Navbar Atas dengan Kategori
const navLinks = document.querySelectorAll('.nav-link[data-nav-cat]');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetCategory = link.getAttribute('data-nav-cat');

        // 1. Render ulang
        renderGames(targetCategory);
        
        // 2. Reset state
        isShowingAll = false;
        if(searchInput) searchInput.value = '';

        // 3. Sinkronisasi Tombol Slider Kategori di bawah
        categoryItems.forEach(btn => {
            if (btn.getAttribute('data-category') === targetCategory) {
                btn.classList.add('active');
                btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                btn.classList.remove('active');
            }
        });

        // 4. Scroll ke konten
        const gameSection = document.querySelector('.game-section');
        if(gameSection) gameSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 5. Tutup menu mobile
        if (hamburger && navMenu && overlay) {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
            overlay.classList.remove("active");
        }
    });
});

// B. Klik Tombol Slider Kategori
categoryItems.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryItems.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        isShowingAll = false;
        if(searchInput) searchInput.value = '';
        renderGames(btn.getAttribute('data-category'));
    });
});

// C. Klik Tombol Load More
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        isShowingAll = !isShowingAll;
        renderGames(currentCategory);
        if(!isShowingAll) {
            const targetGrid = altLayoutCategories.includes(currentCategory) ? gridAlt : gridStandard;
            targetGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

// D. Search Input
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        renderGames(currentCategory, e.target.value);
    });
}

// E. Scroll Horizontal Kategori
const catWrapper = document.querySelector(".category-wrapper");
const leftBtn = document.querySelector(".left-btn");
const rightBtn = document.querySelector(".right-btn");

if (catWrapper && leftBtn && rightBtn) {
    rightBtn.addEventListener("click", () => catWrapper.scrollBy({ left: 150, behavior: "smooth" }));
    leftBtn.addEventListener("click", () => catWrapper.scrollBy({ left: -150, behavior: "smooth" }));
}

// =========================================
// 7. INISIALISASI
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    renderGames('ikan'); 
});