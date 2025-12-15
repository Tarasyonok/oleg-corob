// Global variables for PDF.js
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let currentScale = 1.0;
let currentAttachmentId = null;
let currentAttachmentName = null;

// Function to get share link with current filter
function getShareLink(attachmentId) {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    params.set('file', attachmentId);
    return `${baseUrl}?${params.toString()}`;
}

// Function to copy share link to clipboard
function copyShareLink(attachmentId, fileName) {
    const shareLink = getShareLink(attachmentId);
    navigator.clipboard.writeText(shareLink).then(function() {
        showToast(`Share link for "${fileName}" copied to clipboard!`);
    }).catch(function(err) {
        console.error('Could not copy text: ', err);
        showToast('Failed to copy share link', 'error');
    });
}

// Function to copy current modal file share link
function copyCurrentShareLink() {
    if (currentAttachmentId) {
        copyShareLink(currentAttachmentId, currentAttachmentName);
    }
}

// Toast notification function
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('shareToast');
    const toastHeader = toastEl.querySelector('.toast-header');
    const toastBody = toastEl.querySelector('.toast-body');

    // Update toast content
    toastBody.textContent = message;

    // Update toast style based on type
    if (type === 'error') {
        toastHeader.className = 'toast-header bg-danger text-white';
        toastHeader.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i><strong class="me-auto">Error</strong><button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>';
    } else {
        toastHeader.className = 'toast-header bg-success text-white';
        toastHeader.innerHTML = '<i class="fas fa-check-circle me-2"></i><strong class="me-auto">Success</strong><button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>';
    }

    // Show toast
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function openAttachmentModal(attachmentId, fileUrl, fileName, fileExtension) {
    currentAttachmentId = attachmentId;
    currentAttachmentName = fileName;

    // Update modal title and info
    document.getElementById('modalFileName').textContent = fileName;
    document.getElementById('modalFileInfo').textContent = 'Loading file information...';

    // Update URL without reloading the page
    const newUrl = getShareLink(attachmentId);
    window.history.replaceState({}, '', newUrl);

    // Show appropriate section based on file type
    const isPdf = fileExtension === '.pdf';
    const pdfViewerSection = document.getElementById('pdfViewerSection');
    const nonPdfSection = document.getElementById('nonPdfSection');

    if (isPdf) {
        pdfViewerSection.classList.remove('d-none');
        nonPdfSection.classList.add('d-none');
        loadPdf(fileUrl, fileName);
    } else {
        pdfViewerSection.classList.add('d-none');
        nonPdfSection.classList.remove('d-none');
        document.getElementById('modalFileInfo').textContent = 'This file type requires download to view.';
    }

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('attachmentModal'));
    modal.show();
}

function loadPdf(pdfUrl, fileName) {
    // Check if pdfjsLib is available
    if (typeof pdfjsLib === 'undefined') {
        console.error('PDF.js library is not loaded');
        showToast('PDF viewer library is not loaded', 'error');
        return;
    }

    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');
    const pageNumEl = document.getElementById('pageNum');
    const pageCountEl = document.getElementById('pageCount');
    const zoomLevelEl = document.getElementById('zoomLevel');
    const pdfViewerContainer = document.getElementById('pdfViewerContainer');
    const pdfLoading = document.getElementById('pdfLoading');
    const pdfError = document.getElementById('pdfError');
    const errorText = document.getElementById('errorText');

    // Reset state
    pdfDoc = null;
    pageNum = 1;
    pageRendering = false;
    pageNumPending = null;
    currentScale = 1.0;

    // Show loading, hide error and canvas
    pdfLoading.classList.remove('d-none');
    pdfError.classList.add('d-none');
    canvas.style.visibility = 'hidden';

    // Load the PDF
    pdfjsLib.getDocument(pdfUrl).promise.then(
        function(pdf) {
            pdfDoc = pdf;
            pageCountEl.textContent = pdfDoc.numPages;
            pdfLoading.classList.add('d-none');
            canvas.style.visibility = 'visible';
            document.getElementById('modalFileInfo').textContent =
                `PDF Document - ${pdfDoc.numPages} page${pdfDoc.numPages !== 1 ? 's' : ''}`;
            renderPage(pageNum);
        },
        function(error) {
            console.error("PDF load error:", error);
            pdfLoading.classList.add('d-none');
            errorText.textContent = error.message || "Failed to load PDF document.";
            pdfError.classList.remove('d-none');
            document.getElementById('modalFileInfo').textContent = 'Error loading PDF document';
        }
    );

    // Render page function
    function renderPage(num) {
        pageRendering = true;
        pdfDoc.getPage(num).then(
            function(page) {
                const viewport = page.getViewport({ scale: currentScale });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };

                page.render(renderContext).promise.then(function() {
                    pageRendering = false;
                    pageNumEl.textContent = num;
                    zoomLevelEl.textContent = `${Math.round(currentScale * 100)}%`;

                    if (pageNumPending !== null) {
                        renderPage(pageNumPending);
                        pageNumPending = null;
                    }
                });
            },
            function(error) {
                console.error("Page render error:", error);
                pdfError.classList.remove('d-none');
                errorText.textContent = "Error rendering this page.";
            }
        );
    }

    // Navigation controls
    document.getElementById('prevPage').onclick = function() {
        if (pageNum <= 1 || pageRendering) return;
        pageNum--;
        queueRenderPage(pageNum);
    };

    document.getElementById('nextPage').onclick = function() {
        if (pageNum >= pdfDoc.numPages || pageRendering) return;
        pageNum++;
        queueRenderPage(pageNum);
    };

    // Zoom controls
    document.getElementById('zoomIn').onclick = function() {
        if (currentScale >= 3.0 || pageRendering) return;
        currentScale += 0.25;
        queueRenderPage(pageNum);
    };

    document.getElementById('zoomOut').onclick = function() {
        if (currentScale <= 0.5 || pageRendering) return;
        currentScale -= 0.25;
        queueRenderPage(pageNum);
    };

    // Fit width function
    document.getElementById('fitWidth').onclick = function() {
        if (!pdfDoc || pageRendering) return;

        pdfDoc.getPage(pageNum).then(function(page) {
            const containerWidth = pdfViewerContainer.clientWidth - 40;
            const pageWidth = page.getViewport({ scale: 1.0 }).width;
            currentScale = containerWidth / pageWidth;
            queueRenderPage(pageNum);
        });
    };

    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }
}

// Clean up when modal is closed
document.getElementById('attachmentModal').addEventListener('hidden.bs.modal', function() {
    // Reset PDF.js state
    pdfDoc = null;
    pageNum = 1;
    pageRendering = false;
    pageNumPending = null;
    currentScale = 1.0;

    // Clear only the file parameter, keep other filters
    const params = new URLSearchParams(window.location.search);
    params.delete('file');

    if (params.toString()) {
        const baseUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, '', `${baseUrl}?${params.toString()}`);
    } else {
        const baseUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, '', baseUrl);
    }
});

// Auto-open modal if file parameter is present in URL
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get('file');

    // Check if there's a file ID in the template context
    const openFileIdElement = document.querySelector('[data-open-file-id]');
    if (openFileIdElement) {
        const attachmentId = openFileIdElement.dataset.openFileId;
        const fileUrl = openFileIdElement.dataset.openFileUrl;
        const fileName = openFileIdElement.dataset.openFileName;
        const fileExtension = openFileIdElement.dataset.openFileExtension;

        if (attachmentId && fileUrl && fileName) {
            // Small delay to ensure everything is loaded
            setTimeout(() => {
                openAttachmentModal(attachmentId, fileUrl, fileName, fileExtension || '.pdf');
            }, 500);
        }
    }
});

// ACCESS RESTRICTION MODAL - Show every time on documents page
document.addEventListener('DOMContentLoaded', function() {
    const accessModal = new bootstrap.Modal(document.getElementById('accessModal'));
    const contentOverlay = document.getElementById('contentOverlay');
    const mainContent = document.getElementById('mainContent');

    // ALWAYS show the modal on documents page (no localStorage check)
    // Remove any localStorage check to show it every time

    // Show modal with a small delay
    setTimeout(() => {
        accessModal.show();
        contentOverlay.style.display = 'block';
        mainContent.style.pointerEvents = 'none';

        // Also add the modal-open class to body for proper Bootstrap styling
        document.body.classList.add('modal-open');
        document.body.style.paddingRight = '0px'; // Reset any padding
    }, 500);

    // Handle Yes button click
    document.getElementById('confirmAccess').addEventListener('click', function() {
        // Don't store anything in localStorage
        accessModal.hide();
        contentOverlay.style.display = 'none';
        mainContent.style.pointerEvents = 'auto';

        // Remove backdrop
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        modalBackdrops.forEach(backdrop => backdrop.remove());

        // Re-enable body scrolling
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0';
    });

    // Handle No button click
    document.getElementById('denyAccess').addEventListener('click', function() {
        // Redirect to home page
        window.location.href = '/';
    });
});

// Enhanced filter functionality with compact design
document.addEventListener('DOMContentLoaded', function() {
    const publicationSelect = document.getElementById('publication-select');
    const filterForm = document.getElementById('publicationFilterForm');
    const filterBlock = document.querySelector('.filter-alert-block');

    if (publicationSelect && filterForm && filterBlock) {
        // Auto-submit with visual feedback
        publicationSelect.addEventListener('change', function() {
            if (filterForm.classList.contains('submitting')) return;

            // Add loading state
            filterForm.classList.add('submitting');
            filterBlock.classList.add('filter-loading');
            publicationSelect.disabled = true;

            // Add highlight animation
            filterBlock.classList.add('filter-changed');

            // Submit form
            setTimeout(() => {
                filterForm.submit();
            }, 300);
        });

        // Remove animation class after animation completes
        filterBlock.addEventListener('animationend', function() {
            this.classList.remove('filter-changed');
        });
    }

    // Focus management
    if (publicationSelect && filterBlock) {
        publicationSelect.addEventListener('focus', function() {
            filterBlock.style.boxShadow = '0 8px 25px rgba(203, 208, 84, 0.15)';
            filterBlock.style.borderColor = '#9FA83A';
        });

        publicationSelect.addEventListener('blur', function() {
            filterBlock.style.boxShadow = '0 6px 20px rgba(203, 208, 84, 0.1)';
            filterBlock.style.borderColor = '#CBD054';
        });
    }

    // Show filter stats only when there are results
    const attachmentsCountElement = document.querySelector('[data-attachments-count]');
    const selectedPublicationElement = document.querySelector('[data-selected-publication]');

    if (attachmentsCountElement && selectedPublicationElement) {
        const attachmentsCount = parseInt(attachmentsCountElement.dataset.attachmentsCount);
        const selectedPublication = selectedPublicationElement.dataset.selectedPublication !== '';

        if (attachmentsCount === 0 && selectedPublication) {
            const filterFooter = document.querySelector('.filter-footer');
            if (filterFooter) {
                filterFooter.style.display = 'none';
            }
        }
    }
});