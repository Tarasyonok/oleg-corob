// static/js/latest_articles.js
document.addEventListener('DOMContentLoaded', function () {
    // Desktop code remains the same

    // Enhanced mobile carousel
    const mobileCarousel = document.querySelector('.latest-articles-mobile .latest-articles-carousel');
    const mobileLeftArrow = document.querySelector('.latest-articles-mobile .left-arrow');
    const mobileRightArrow = document.querySelector('.latest-articles-mobile .right-arrow');

    if (mobileCarousel && mobileLeftArrow && mobileRightArrow) {
        const cardWidth = mobileCarousel.offsetWidth;

        mobileLeftArrow.addEventListener('click', function () {
            mobileCarousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });

        mobileRightArrow.addEventListener('click', function () {
            mobileCarousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        mobileCarousel.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        mobileCarousel.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                // Swipe left
                mobileCarousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
            } else if (touchEndX > touchStartX + 50) {
                // Swipe right
                mobileCarousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            }
        }
    }
});
