const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const themeToggle = document.getElementById("themeToggle");
const searchInput = document.querySelector(".search input");

// OPEN/CLOSE SIDEBAR
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
});

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

// =========================
// CATEGORY SLIDER NAVIGASI
// =========================
const wrapper = document.querySelector(".category-wrapper");
const leftBtn = document.querySelector(".left-btn");
const rightBtn = document.querySelector(".right-btn");

if (wrapper && leftBtn && rightBtn) {

    rightBtn.addEventListener("click", () => {
        wrapper.scrollBy({ left: 200, behavior: "smooth" });
    });

    leftBtn.addEventListener("click", () => {
        wrapper.scrollBy({ left: -200, behavior: "smooth" });
    });

}

// === GAME ITEM ACTIVE STATE (Klik untuk border emas) ===
document.querySelectorAll(".game-item").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelectorAll(".game-item").forEach(i => i.classList.remove("active"));
        item.classList.add("active");
    });
});

// =========================
// JUMBOTRON SLIDER OTOMATIS
// =========================
let slideIndex = 0;
const slides = document.querySelectorAll('.jumbotron-slider .slide');
const slideInterval = 5000; // Ubah slide setiap 5 detik (5000ms)

function showSlides() {
    slides.forEach(slide => {
        slide.classList.remove('active');
    });

    slideIndex++;
    if (slideIndex >= slides.length) {
        slideIndex = 0;
    }

    slides[slideIndex].classList.add('active');
}

// Jalankan slider
if (slides.length > 1) {
    // Pastikan slide pertama aktif jika tidak ada yang aktif
    if (!document.querySelector('.jumbotron-slider .slide.active')) {
        slides[0].classList.add('active');
    }
    
    // Atur interval
    setInterval(showSlides, slideInterval);
}


// =========================
// GAME CARD CATEGORY FILTER & LOAD MORE SYSTEM
// =========================
const maxShow = 6; // tampilkan 6 item dulu
const gameGrid = document.getElementById("gameGrid");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const allGameItems = Array.from(gameGrid.children).filter(el => el.classList.contains('game-item')); 

let currentCategory = 'secret'; // Kategori default saat halaman dimuat
let isShowingAll = false; // Status apakah sedang menampilkan semua item

function filterAndDisplayGames(category) {
    currentCategory = category;
    isShowingAll = false; // Reset status saat filter berubah
    
    // 1. Saring item yang relevan dengan kategori
    const visibleItems = allGameItems.filter(item => {
        if (category === 'all') {
            return true;
        }
        return item.getAttribute('data-category') === category;
    });

    // 2. Sembunyikan semua item
    allGameItems.forEach(item => {
        item.style.display = 'none';
    });

    // 3. Tampilkan item yang difilter (hingga maxShow)
    visibleItems.forEach((item, i) => {
        if (i < maxShow) {
            item.style.display = 'grid'; // Tampilkan item
        }
    });

    // 4. Atur tombol Load More/Less
    if (visibleItems.length > maxShow) {
        // Tampilkan sebagai teks "Tampilkan Lebih Banyak"
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.classList.add('text-mode'); // Tambahkan kelas untuk styling teks
        loadMoreBtn.textContent = `Tampilkan Lebih Banyak (${visibleItems.length - maxShow} Item)`;
    } else {
        loadMoreBtn.style.display = 'none';
    }
}


// Aksi Klik Kategori
document.querySelectorAll(".category-item").forEach(item => {
    item.addEventListener("click", () => {
        // Hapus active dari semua item
        document.querySelectorAll(".category-item").forEach(el => {
            el.classList.remove("active");
        });

        // Tambahkan active ke item yang diklik
        item.classList.add("active");

        const selectedCategory = item.getAttribute('data-category');
        filterAndDisplayGames(selectedCategory);
    });
});


// Aksi Tombol Load More/Less
loadMoreBtn.addEventListener("click", () => {
    
    // 1. Saring item yang relevan (hanya item kategori aktif)
    const itemsOfCurrentCategory = allGameItems.filter(item => {
        return (currentCategory === 'all' || item.getAttribute('data-category') === currentCategory);
    });

    if (isShowingAll) {
        // >>> MODE TAMPILKAN LEBIH SEDIKIT (Kembali ke maxShow)
        
        itemsOfCurrentCategory.forEach((item, i) => {
            if (i >= maxShow) {
                item.style.display = 'none';
            }
        });
        
        loadMoreBtn.textContent = `Tampilkan Lebih Banyak (${itemsOfCurrentCategory.length - maxShow} Item)`;
        isShowingAll = false;

    } else {
        // >>> MODE TAMPILKAN LEBIH BANYAK (Tampilkan semua)
        
        itemsOfCurrentCategory.forEach(item => {
            item.style.display = 'grid';
        });

        loadMoreBtn.textContent = 'Tampilkan Lebih Sedikit';
        isShowingAll = true;
    }
});

// Jalankan filter saat halaman pertama kali dimuat (default 'secret')
filterAndDisplayGames(currentCategory);
