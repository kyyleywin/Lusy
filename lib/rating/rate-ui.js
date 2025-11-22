// lib/rating/rate-ui.js

// =========================================
// KONFIGURASI DATABASE & ANTI SPAM
// =========================================
// ⚠️ GANTI DENGAN URL WEB APP KAMU:
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzP3qrMJfGGjJNqaFUvuWKB1VW2C5XXW5dydAuwfQGUo9okOO0tZ1zW0b-3aOTNTJDIVQ/exec'; 

// Key LocalStorage
const STORAGE_KEY = 'luscy_store_has_rated'; 

// Data Admin (Pinned)
const adminReview = {
    name: "Admin Luscy",
    star: 5,
    comment: "Terima kasih sudah mampir! Jangan lupa tinggalkan ulasan dan juga ratingnya",
    date: "Pinned",
    profile: "https://files.catbox.moe/lonk96.png"
};

let globalRatingData = []; 
const MAX_RATING_INITIAL = 6; 

// =========================================
// 1. AMBIL DATA DARI GOOGLE SHEET
// =========================================
async function fetchRatings(isExpanded) {
    const gameGrid = document.getElementById('gameGrid');
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

    if (!document.getElementById('ratingModal')) injectModalHTML();

    if (globalRatingData.length > 0) {
        renderRatingList(globalRatingData, isExpanded);
    } else {
        fetchRatings(isExpanded);
    }
}

function renderRatingList(data, isExpanded) {
    const gameGrid = document.getElementById('gameGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn'); 
    
    // --- [1. HITUNG STATISTIK BINTANG] ---
    let stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalScore = 0;
    let totalReview = data.length;

    data.forEach(item => {
        let s = item.star || 5; // Default 5 jika error
        if(stats[s] !== undefined) stats[s]++;
        totalScore += s;
    });

    let average = totalReview > 0 ? (totalScore / totalReview).toFixed(1) : "0.0";
    
    // HTML Ringkasan (Summary Box)
    let summaryHTML = `
    <div class="rating-summary-box">
        <div class="summary-left">
            <div class="summary-score">${average}</div>
            <div style="text-align:left;">
                <div class="summary-stars">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </div>
                <div class="summary-total">${totalReview} Ulasan</div>
            </div>
        </div>
        <div class="summary-right">
            ${generateProgressBar(5, stats[5], totalReview)}
            ${generateProgressBar(4, stats[4], totalReview)}
            ${generateProgressBar(3, stats[3], totalReview)}
            ${generateProgressBar(2, stats[2], totalReview)}
            ${generateProgressBar(1, stats[1], totalReview)}
        </div>
    </div>
    `;

    // --- [2. TOMBOL TULIS ULASAN (Anti-Spam)] ---
    const hasRated = localStorage.getItem(STORAGE_KEY);
    let btnAddHTML = '';
    
    if (hasRated === 'true') {
        btnAddHTML = `
            <div style="text-align: center; margin-bottom: 25px;">
                <button class="btn-add-rating" style="background: #333; color: #888; cursor: not-allowed; box-shadow:none;">
                    <i class="fas fa-check-circle"></i> Ulasan Terkirim
                </button>
            </div>
        `;
    } else {
        btnAddHTML = `
            <div style="text-align: center; margin-bottom: 25px;">
                <button onclick="openRatingModal()" class="btn-add-rating">
                    <i class="fas fa-plus"></i> Tulis Ulasan
                </button>
            </div>
        `;
    }

    // --- [3. LIST DATA ULASAN] ---
    const listContainer = document.createElement('div');
    listContainer.className = 'rating-list-container';

    let displayData = isExpanded ? data : data.slice(0, MAX_RATING_INITIAL);

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
        listContainer.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">Belum ada ulasan.</div>';
    }

    // GABUNGKAN SEMUA KE GRID
    gameGrid.innerHTML = summaryHTML + btnAddHTML; // Summary ditaruh paling atas
    gameGrid.appendChild(listContainer);

    // Tombol Load More
    if (loadMoreBtn) {
        if (data.length > MAX_RATING_INITIAL) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = isExpanded ? "Lebih Sedikit" : "Tampilkan Lebih Banyak";
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

// Helper untuk membuat bar grafik
function generateProgressBar(star, count, total) {
    let percent = total > 0 ? (count / total) * 100 : 0;
    return `
    <div class="rate-row">
        <div class="star-label"><i class="fas fa-star"></i> ${star}</div>
        <div class="progress-bg">
            <div class="progress-fill" style="width: ${percent}%;"></div>
        </div>
        <div class="count-label">${count}</div>
    </div>
    `;
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
        localStorage.setItem(STORAGE_KEY, 'true');

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
function openRatingModal() { document.getElementById('ratingModal').style.display = 'flex'; pilihBintang(5); }
function closeRatingModal() { document.getElementById('ratingModal').style.display = 'none'; }
function pilihBintang(n) {
    document.getElementById('selectedStar').value = n;
    const stars = document.querySelectorAll('.star-input i');
    stars.forEach(star => {
        const val = parseInt(star.getAttribute('data-value'));
        if (val <= n) {
            star.classList.add('active'); star.style.color = '#FFD700';
        } else {
            star.classList.remove('active'); star.style.color = '#444';
        }
    });
}