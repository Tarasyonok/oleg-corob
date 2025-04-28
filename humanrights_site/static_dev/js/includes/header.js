document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.main-nav ul');

    menuToggle.addEventListener('click', function() {
        navList.classList.toggle('show');
    });

    // Search toggle
    const searchToggle = document.querySelector('.search-toggle');
    const searchBar = document.querySelector('.search-bar');

    searchToggle.addEventListener('click', function() {
        searchBar.classList.toggle('show');
    });

    // Close menus when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.header-actions') && !event.target.closest('.main-nav ul') && !event.target.closest('.search-bar')) {
            navList.classList.remove('show');
            searchBar.classList.remove('show');
        }
    });

    // Prevent clicks inside the nav from closing it
    document.querySelector('.main-nav').addEventListener('click', function(event) {
        event.stopPropagation();
    });
});
