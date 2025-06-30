
// Gör så att bildbandet dupliceras för sömlös loop
const slider = document.querySelector('.mySlides');
slider.innerHTML += slider.innerHTML;

let slideshow = document.querySelector('.mySlides');
let lastScroll = sessionStorage.getItem('scrollX');

if (lastScroll) {
    slideshow.style.transform = `translateX(${lastScroll}px)`;
}

setInterval(() => {
    let style = window.getComputedStyle(slideshow);
    let matrix = new WebKitCSSMatrix(style.transform);
    sessionStorage.setItem('scrollX', matrix.m41);
}, 1000);