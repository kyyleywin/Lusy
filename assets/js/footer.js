// assets/js/footer.js

const footerContent = `
<footer class="custom-footer">
    <div class="footer-container">
        
        <div class="footer-col">
            <p class="footer-desc">
                <strong>Stock Luscy</strong> adalah website Stock Ikan Fish It, tercepat dan terpercaya dengan beragam pilihan metode pembayaran gratis biaya admin.
            </p>
            <div class="footer-socials">
                <a href="https://www.tiktok.com/@kyyleywinn?_r=1&_t=ZS-91aIIjXDY49" class="social-icon"><i class="fab fa-tiktok"></i></a>
                <a href="https://www.instagram.com/kyyleywin?igsh=cmJuMXc0ZG4ycnA2" class="social-icon"><i class="fab fa-instagram"></i></a>
                <a href="https://www.facebook.com/kyyleywin" class="social-icon"><i class="fab fa-facebook-f"></i></a>
                <a href="https://wa.me/6285974488318" class="social-icon"><i class="fab fa-whatsapp"></i></a>
            </div>
        </div>

        <div class="footer-col">
            <h4 class="footer-title" style="margin-top: 20px;">Customer Service</h4>
            <ul class="footer-links">
                <li><a href="https://wa.me/6285974488318">WhatsApp Admin</a></li>
                <li><a href="https://www.instagram.com/kyyleywin?igsh=cmJuMXc0ZG4ycnA2">Instagram</a></li>
                <li><a href="https://www.tiktok.com/@kyyleywinn?_r=1&_t=ZS-91aIIjXDY49">Tiktok</a></li>
            </ul>
        </div>

    </div>
    
    <div class="footer-copyright">
        &copy; 2025 Stock Luscy. All Rights Reserved.
    </div>
</footer>
`;

// Masukkan footer ke dalam elemen dengan ID "main-footer"
document.addEventListener("DOMContentLoaded", function() {
    const footerElement = document.getElementById("main-footer");
    if(footerElement) {
        footerElement.innerHTML = footerContent;
    }
});