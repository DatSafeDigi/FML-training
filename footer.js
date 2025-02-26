document.addEventListener('DOMContentLoaded', function() {
    const emailLink = document.querySelector('.footer a');
    emailLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'mailto:' + emailLink.textContent;
    });
});
