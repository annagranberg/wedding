
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


const buttons = document.querySelectorAll('.text-button');
const container = document.getElementById('content-container');

// Funktion som laddar och visar sidan i container
async function loadPage(page) {
  try {
    const res = await fetch(page);
    if (!res.ok) throw new Error('Sidan kunde inte laddas');
    const html = await res.text();
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = '<p>Oj, något gick fel när sidan skulle laddas.</p>';
    console.error(error);
  }
}

// Lyssna på klick på knapparna
buttons.forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault(); // Hindra att sidan laddas om
    const page = btn.getAttribute('data-page');
    loadPage(page);
  });
});

// Ladda startsidan (information) direkt vid laddning
loadPage('information.html');
