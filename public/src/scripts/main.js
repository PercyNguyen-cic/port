document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.getElementsByClassName('close-modal')[0];
    const artworks = document.getElementsByClassName('artwork');

    Array.from(artworks).forEach(artwork => {
        const img = artwork.getElementsByTagName('img')[0];
        img.onclick = function() {
            modal.style.display = "flex";
            modalImg.src = this.src;
        }
    });

    const zoomableImages = document.getElementsByClassName('zoomable');
    Array.from(zoomableImages).forEach(img => {
        img.onclick = function(e) {
            e.stopPropagation();
            modal.style.display = "flex";
            modalImg.src = this.src;
        }
    });

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === "flex") {
            modal.style.display = "none";
        }
    });

    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navOverlay = document.querySelector(".nav-overlay");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        navOverlay.classList.toggle("active");
    });

    document.querySelectorAll(".nav-menu li a").forEach(n => n.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
        navOverlay.classList.remove("active");
    }));

    navOverlay.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
        navOverlay.classList.remove("active");
    });

    let slideIndex = 1;

    function showSlides(n) {
        const slides = document.getElementsByClassName("slide");
        const dots = document.getElementsByClassName("dot");
        
        if (!slides.length) return;

        if (n > slides.length) slideIndex = 1;
        if (n < 1) slideIndex = slides.length;

        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
            dots[i].classList.remove("active");
        }

        slides[slideIndex-1].style.display = "block";
        dots[slideIndex-1].classList.add("active");
    }

    function changeSlide(n) {
        showSlides(slideIndex += n);
    }

    function currentSlide(n) {
        showSlides(slideIndex = n);
    }

    if (document.querySelector('.slideshow-container')) {
        showSlides(slideIndex);
        document.querySelector('.slide').style.display = 'block';
        document.querySelector('.dot').classList.add('active');
    }

    const initGallerySlider = () => {
        const slider = document.querySelector('.gallery-slider');
        if (!slider) return;

        const track = slider.querySelector('.slider-track');
        const items = slider.querySelectorAll('.slider-item');
        const dots = slider.querySelectorAll('.nav-dot');
        const prevBtn = slider.querySelector('.prev');
        const nextBtn = slider.querySelector('.next');
        let currentIndex = 0;

        const updateSlider = (index) => {
            const items = document.querySelectorAll('.slider-item');
            items.forEach(item => {
                item.classList.remove('active');
            });
            items[index].classList.add('active');
            
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
            currentIndex = index;
        }

        prevBtn.onclick = () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateSlider(currentIndex);
        };

        nextBtn.onclick = () => {
            currentIndex = (currentIndex + 1) % items.length;
            updateSlider(currentIndex);
        };

        dots.forEach((dot, index) => {
            dot.onclick = () => updateSlider(index);
        });

        updateSlider(0);
    }

    if (document.querySelector('.gallery-slider')) {
        initGallerySlider();
    }

    function initQuiz() {
        const draggables = document.querySelectorAll('.draggable');
        const dropZones = document.querySelectorAll('.drop-zone');

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', draggable.dataset.character);
                draggable.classList.add('dragging');
            });

            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('dragover');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('dragover');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                const characterType = e.dataTransfer.getData('text/plain');
                const isCorrect = characterType === zone.dataset.expects;
                
                zone.classList.remove('dragover');
                zone.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                setTimeout(() => {
                    zone.classList.remove('correct', 'incorrect');
                }, 1500);
            });
        });
    }

    if (document.querySelector('.character-quiz')) {
        initQuiz();
    }
});

let currentSlideIndex = 0;
const track = document.querySelector('.slider-track');
const items = document.querySelectorAll('.slider-item');
const dots = document.querySelectorAll('.nav-dot');

function updateSlider(index) {
    if (!track) return;
    const items = document.querySelectorAll('.slider-item');
    items.forEach(item => {
        item.classList.remove('active');
    });
    items[index].classList.add('active');
    
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');
    currentSlideIndex = index;
}

function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + items.length) % items.length;
    updateSlider(currentSlideIndex);
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % items.length;
    updateSlider(currentSlideIndex);
}

function goToSlide(index) {
    updateSlider(index);
}

if (document.querySelector('.gallery-slider')) {
    updateSlider(0);
}
