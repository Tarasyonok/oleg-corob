// static/js/includes/header.js
document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (toggleButton && mobileNav) {
        toggleButton.addEventListener('click', function () {
            this.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        // Close when clicking on links
        const navLinks = mobileNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                toggleButton.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close when clicking outside
        document.addEventListener('click', function (e) {
            if (!mobileNav.contains(e.target) &&
                !toggleButton.contains(e.target) &&
                mobileNav.classList.contains('active')) {
                toggleButton.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});