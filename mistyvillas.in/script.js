// Carousel Functionality
document.querySelectorAll('.carousel-container').forEach(container => {
  const track = container.querySelector('.carousel-track');
  let slides = Array.from(track.children);
  const prevButton = container.querySelector('.carousel-button.prev');
  const nextButton = container.querySelector('.carousel-button.next');

  const visibleSlides = 3;
  let currentIndex = visibleSlides;

  // Clone slides for infinite scroll, retain video controls
  const cloneBefore = slides.slice(-visibleSlides).map(slide => {
    const clone = slide.cloneNode(true);
    const video = clone.querySelector('video');
    if (video) video.setAttribute('controls', 'true');
    return clone;
  });

  const cloneAfter = slides.slice(0, visibleSlides).map(slide => {
    const clone = slide.cloneNode(true);
    const video = clone.querySelector('video');
    if (video) video.setAttribute('controls', 'true');
    return clone;
  });

  cloneBefore.forEach(clone => track.prepend(clone));
  cloneAfter.forEach(clone => track.append(clone));

  slides = Array.from(track.children);

  function updateCarousel(instant = false) {
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transition = instant ? 'none' : 'transform 0.5s ease-in-out';
    track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
  }

  function nextSlide() {
    currentIndex++;
    updateCarousel();

    if (currentIndex >= slides.length - visibleSlides) {
      setTimeout(() => {
        currentIndex = visibleSlides;
        updateCarousel(true);
      }, 500);
    }
  }

  function prevSlide() {
    currentIndex--;
    updateCarousel();

    if (currentIndex < visibleSlides) {
      setTimeout(() => {
        currentIndex = slides.length - visibleSlides * 2;
        updateCarousel(true);
      }, 500);
    }
  }

  // Button events
  nextButton.addEventListener('click', nextSlide);
  prevButton.addEventListener('click', prevSlide);
  window.addEventListener('resize', () => updateCarousel(true));

  // Swipe support
  let startX = 0;
  let isSwiping = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
  });

  track.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    if (Math.abs(diff) > 50) {
      diff > 0 ? prevSlide() : nextSlide();
    }
    isSwiping = false;
  });

  updateCarousel(true); // Initial setup
});

// LIGHTBOX
// Lightbox functionality
const carouselImages = document.querySelectorAll('.carousel-slide img, .carousel-slide video'); // Assuming images are inside carousel-slide
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const closeBtn = document.querySelector('.lightbox-close');
const prevBtn = document.querySelector('.lightbox-nav.prev');
const nextBtn = document.querySelector('.lightbox-nav.next');

let currentLightboxIndex = 0;

function showLightbox(index) {
  const image = carouselImages[index];
  lightboxImg.src = image.src;
  lightboxImg.alt = image.alt;
  lightboxCaption.textContent = image.alt;
  lightboxModal.classList.remove('hidden');
  currentLightboxIndex = index;
}

// Event listeners for opening the lightbox when clicking on carousel images
carouselImages.forEach((img, index) => {
  img.addEventListener('click', () => showLightbox(index));
});

// Close button
closeBtn.addEventListener('click', () => {
  lightboxModal.classList.add('hidden');
});

// Arrow navigation for lightbox
prevBtn.addEventListener('click', () => {
  currentLightboxIndex = (currentLightboxIndex - 1 + carouselImages.length) % carouselImages.length;
  showLightbox(currentLightboxIndex);
});

nextBtn.addEventListener('click', () => {
  currentLightboxIndex = (currentLightboxIndex + 1) % carouselImages.length;
  showLightbox(currentLightboxIndex);
});

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
  if (lightboxModal.classList.contains('hidden')) return;
  if (e.key === 'Escape') lightboxModal.classList.add('hidden');
  if (e.key === 'ArrowRight') nextBtn.click();
  if (e.key === 'ArrowLeft') prevBtn.click();
});

// Swipe support for lightbox image
let lightboxStartX = 0;
let lightboxEndX = 0;

lightboxImg.addEventListener('touchstart', (e) => {
  lightboxStartX = e.touches[0].clientX;
});

lightboxImg.addEventListener('touchmove', (e) => {
  lightboxEndX = e.touches[0].clientX;
});

lightboxImg.addEventListener('touchend', () => {
  const swipeDiff = lightboxStartX - lightboxEndX;

  if (Math.abs(swipeDiff) > 50) { // 50px threshold
    if (swipeDiff > 0) {
      nextBtn.click(); // Swipe left → next image
    } else {
      prevBtn.click(); // Swipe right → previous image
    }
  }

  // Reset values
  lightboxStartX = 0;
  lightboxEndX = 0;
});

// Optional: stops vertical scroll during swipe
lightboxImg.addEventListener('touchmove', (e) => {
  lightboxEndX = e.touches[0].clientX;
  e.preventDefault(); 
}, { passive: false });

// Close lightbox when clicking on background (modal)
lightboxModal.addEventListener('click', (e) => {
  if (e.target === lightboxModal) {
    lightboxModal.classList.add('hidden');
  }
});