document.addEventListener('DOMContentLoaded', function() {
  const filterToggle = document.querySelector('.filter-toggle-btn');
  const filterForm = document.querySelector('.newspaper-filter-form');

  // Check localStorage for saved state
  const filtersVisible = localStorage.getItem('filtersVisible') === 'true';

  // Set initial state
  if (filtersVisible) {
    filterForm.classList.remove('hidden');
    filterForm.classList.add('visible');
    filterToggle.classList.add('expanded');
    filterToggle.querySelector('.filter-toggle-text').textContent = 'Hide Filters';
  }

  filterToggle.addEventListener('click', function() {
    const isHidden = filterForm.classList.contains('hidden');

    filterForm.classList.toggle('hidden');
    filterForm.classList.toggle('visible');
    this.classList.toggle('expanded');

    const toggleText = this.querySelector('.filter-toggle-text');
    toggleText.textContent = isHidden ? 'Hide Filters' : 'Show Filters';

    // Save state to localStorage
    localStorage.setItem('filtersVisible', isHidden);
  });

  // Enhance multi-select functionality
  const multiSelects = document.querySelectorAll('select[multiple]');

  multiSelects.forEach(select => {
    // Add visual indicator for selected options
    select.addEventListener('change', function() {
      const selectedCount = Array.from(this.selectedOptions).length;
      const label = this.previousElementSibling;

      if (selectedCount > 0) {
        label.textContent = `${label.dataset.originalText} (${selectedCount} selected)`;
      } else {
        label.textContent = label.dataset.originalText;
      }
    });

    // Store original label text
    const label = select.previousElementSibling;
    label.dataset.originalText = label.textContent;
  });

  // Date input placeholders for browsers that don't support type="date"
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => {
    if (input.type === 'text') {
      input.placeholder = input.getAttribute('placeholder') || 'yyyy-mm-dd';
    }
  });

  document.querySelectorAll('.filter-input').forEach(input => {
      // Prevent Enter key
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') e.preventDefault();
      });

      // Smart horizontal scrolling
      input.addEventListener('input', function() {
        if (this === document.activeElement) {
          this.scrollLeft = this.scrollWidth;
        }
      });
    });
  document.documentElement.style.setProperty('--transition-duration', '0s');

  setTimeout(() => {
    document.documentElement.style.setProperty('--transition-duration', '0.3s');
  }, 50);
});
