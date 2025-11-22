// lib/rating/rate-ui.js

// =========================================
// KONFIGURASI DATABASE & ANTI SPAM
// =========================================
// ⚠️ GANTI DENGAN URL WEB APP KAMU:
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzP3qrMJfGGjJNqaFUvuWKB1VW2C5XXW5dydAuwfQGUo9okOO0tZ1zW0b-3aOTNTJDIVQ/exec'; 

// Kunci penyimpanan di Browser HP User
const STORAGE_KEY = 'luscy_store_has_rated'; 

// Data Admin (Pinned)
const adminReview = {
    name: "Admin Luscy",
    star: 5,
    comment: "Terima kasih sudah mampir! Jangan lupa kirim ulasan dan rating juga, Terimakasih !",
    date: "Pinned",
    profile: "https://cdn.discordapp.com/attachments/1440347537172201492/1441069517546717314/IMG_20251120_211532.png?ex=69226e52&is=69211cd2&hm=1d7825bc75264dc1904e159e0ef66eea362132a3491f7d0fc2fe09c9501774b8&"
};

let globalRatingData = []; 
const MAX_RATING_INITIAL = 6; 

// =========================================
// 1. AMBIL DATA DARI GOOGLE SHEET
// =========================================
async function fetchRatings(isExpanded) {
    const gameGrid = document.getElementById('gameGrid');
    
    // Loading
    gameGrid.innerHTML = '<div style="text-align:center; padding:40px; color:#f3cb51;"><i class="fas fa-circle-notch fa-spin"></i> Sedang memuat ulasan...</div>';

    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        
        globalRatingData = [adminReview, ...data];
        renderRatingList(globalRatingData, isExpanded);
        
    } catch (error) {
        console.error("Gagal ambil data:", error);
        globalRatingData = [adminReview];
        renderRatingList(globalRatingData, isExpanded);
    }
}

// =========================================
// 2. RENDER TAMPILAN (UI)
// =========================================
function renderRatingPage(isExpanded = false) {
    const gameGrid = document.getElementById('gameGrid');
    const gameGridAlt = document.getElementById('gameGridAlt');
    
    if(gameGridAlt) { gameGridAlt.innerHTML = ''; gameGridAlt.style.display = 'none'; }
    gameGrid.style.display = 'block';

    if (!document.getElementById('ratingModal')) {
        injectModalHTML();
    }

    if (globalRatingData.length > 0) {
        renderRatingList(globalRatingData, isExpanded);
    } else {
        fetchRatings(isExpanded);
    }
}

function renderRatingList(data, isExpanded) {
    const gameGrid = document.getElementById('gameGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn'); 
    
    // --- [LOGIKA BARU: CEK APAKAH USER SUDAH PERNAH RATING] ---
    const hasRated = localStorage.getItem(STORAGE_KEY);
    
    let btnAddHTML = '';
    
    if (hasRated === 'true') {
        // Jika SUDAH pernah rating: Tombol MATI / Ganti Teks
        btnAddHTML = `
            <div style="text-align: center; margin-bottom: 25px;">
                <button class="btn-add-rating" style="background: #333; color: #888; cursor: not-allowed; box-shadow:none;">
                    <i class="fas fa-check-circle"></i> Ulasan Terkirim
                </button>
                <div style="font-size:11px; color:#666; margin-top:5px;">Terima kasih atas ulasanmu!</div>
            </div>
        `;
    } else {
        // Jika BELUM pernah rating: Tombol NORMAL
        btnAddHTML = `
            <div style="text-align: center; margin-bottom: 25px;">
                <button onclick="openRatingModal()" class="btn-add-rating">
                    <i class="fas fa-plus"></i> Tulis Ulasan
                </button>
            </div>
        `;
    }
    // ---------------------------------------------------------

    const listContainer = document.createElement('div');
    listContainer.className = 'rating-list-container';

    // Logika Limit
    let displayData = [];
    if (isExpanded) {
        displayData = data; 
    } else {
        displayData = data.slice(0, MAX_RATING_INITIAL); 
    }

    // Looping Data
    if (displayData && displayData.length > 0) {
        displayData.forEach((rate, index) => {
            let starsHTML = '';
            for(let i=1; i<=5; i++) {
                starsHTML += (i <= rate.star) ? '<i class="fas fa-star"></i> ' : '<i class="far fa-star" style="color:#444;"></i> ';
            }
            
            let imgTag;
            if(rate.profile) {
                 imgTag = `<img src="${rate.profile}" class="rating-img" alt="User">`;
            } else {
                 const initial = rate.name ? rate.name.charAt(0).toUpperCase() : "U";
                 imgTag = `<div class="rating-img" style="background:#222; border:1px solid #333; display:flex; align-items:center; justify-content:center; color:#888; font-size:24px; font-weight:bold;">${initial}</div>`;
            }

            const cardHTML = `
                <div class="rating-card animate-show" style="animation-delay: ${index * 0.05}s">
                    ${imgTag}
                    <div class="rating-content">
                        <div class="rating-header">
                            <div class="rating-name">${rate.name}</div>
                            <div class="rating-date">${rate.date}</div>
                        </div>
                        <div class="rating-stars">${starsHTML}</div>
                        <div class="rating-comment">"${rate.comment}"</div>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    } else {
        listContainer.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">Belum ada ulasan. Jadilah yang pertama!</div>';
    }

    gameGrid.innerHTML = btnAddHTML;
    gameGrid.appendChild(listContainer);

    // Logika Load More
    if (loadMoreBtn) {
        if (data.length > MAX_RATING_INITIAL) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = isExpanded ? "Lebih Sedikit" : "Tampilkan Lebih Banyak";
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

// =========================================
// 3. KIRIM DATA (SUBMIT)
// =========================================
function submitRating(e) {
    e.preventDefault();
    
    const btnSubmit = document.querySelector('#ratingForm button[type="submit"]');
    const originalText = btnSubmit.innerText;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

    const nama = document.getElementById('ratingName').value;
    const bintang = document.getElementById('selectedStar').value;
    const komen = document.getElementById('ratingComment').value;

    const formData = new FormData();
    formData.append('name', nama);
    formData.append('star', bintang);
    formData.append('comment', komen);

    fetch(SCRIPT_URL, { method: 'POST', body: formData })
    .then(response => {
        alert("Terima kasih! Ulasan berhasil terkirim.");
        
        // --- [SIMPAN TANDA BAHWA USER SUDAH RATING] ---
        localStorage.setItem(STORAGE_KEY, 'true');
        // ----------------------------------------------

        const newReview = {
            name: nama,
            star: parseInt(bintang),
            comment: komen,
            date: "Baru Saja",
            profile: null
        };
        globalRatingData.splice(1, 0, newReview);
        
        renderRatingList(globalRatingData, false); 
        
        closeRatingModal();
        document.getElementById('ratingForm').reset();
    })
    .catch(error => {
        console.error('Error!', error.message);
        alert("Gagal mengirim ulasan. Cek koneksi internet.");
    })
    .finally(() => {
        btnSubmit.disabled = false;
        btnSubmit.innerText = originalText;
    });
}

// =========================================
// 4. HELPER FUNCTIONS
// =========================================
function injectModalHTML() {
    const modalHTML = `
    <div id="ratingModal" class="modal">
        <div class="modal-content">
            <span class="close-modal" onclick="closeRatingModal()">&times;</span>
            <h3 style="margin-top:0; border-bottom:1px solid #333; padding-bottom:10px;">
                <i class="fas fa-pen"></i> Tulis Ulasan
            </h3>
            <form id="ratingForm" onsubmit="submitRating(event)">
                <div class="form-group" style="margin-top:15px;">
                    <label>Nama Kamu</label>
                    <input type="text" id="ratingName" class="form-control" placeholder="Nama..." required autocomplete="off" style="background:#222; border:1px solid #444; color:white;">
                </div>
                <div class="form-group">
                    <label>Rating</label>
                    <div class="star-input" style="display:flex; gap:10px; font-size:24px; margin:5px 0;">
                        <i class="fas fa-star" data-value="1" onclick="pilihBintang(1)"></i>
                        <i class="fas fa-star" data-value="2" onclick="pilihBintang(2)"></i>
                        <i class="fas fa-star" data-value="3" onclick="pilihBintang(3)"></i>
                        <i class="fas fa-star" data-value="4" onclick="pilihBintang(4)"></i>
                        <i class="fas fa-star" data-value="5" onclick="pilihBintang(5)"></i>
                    </div>
                    <input type="hidden" id="selectedStar" value="5">
                </div>
                <div class="form-group">
                    <label>Komentar</label>
                    <textarea id="ratingComment" class="form-control" rows="3" placeholder="Tulis pengalamanmu..." required style="background:#222; border:1px solid #444; color:white;"></textarea>
                </div>
                <button type="submit" class="btn-process" style="width: 100%; margin-top: 15px;">Kirim</button>
            </form>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openRatingModal() {
    document.getElementById('ratingModal').style.display = 'flex';
    pilihBintang(5);
}
function closeRatingModal() {
    document.getElementById('ratingModal').style.display = 'none';
}
function pilihBintang(n) {
    document.getElementById('selectedStar').value = n;
    const stars = document.querySelectorAll('.star-input i');
    stars.forEach(star => {
        const val = parseInt(star.getAttribute('data-value'));
        if (val <= n) {
            star.classList.add('active');
            star.style.color = '#FFD700';
        } else {
            star.classList.remove('active');
            star.style.color = '#444';
        }
    });
}