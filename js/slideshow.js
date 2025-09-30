// Slideshow functionality with auto-play and responsive controls
class ServiceSlideshow {
    constructor(serviceType) {
        this.serviceType = serviceType;
        this.currentSlide = 0;
        this.slides = document.querySelectorAll(`[data-service="${serviceType}"] .slide`) || 
                     document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll(`[data-service="${serviceType}"] .dot`) || 
                   document.querySelectorAll('.dot');
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 seconds
        
        this.init();
    }
    
    init() {
        this.startAutoPlay();
        this.addTouchSupport();
        this.addKeyboardSupport();
    }
    
    showSlide(n) {
        if (this.slides.length === 0) return;
        
        // Hide all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Remove active class from all dots
        this.dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Wrap around if necessary
        if (n >= this.slides.length) this.currentSlide = 0;
        if (n < 0) this.currentSlide = this.slides.length - 1;
        
        // Show current slide
        if (this.slides[this.currentSlide]) {
            this.slides[this.currentSlide].classList.add('active');
        }
        
        // Activate current dot
        if (this.dots[this.currentSlide]) {
            this.dots[this.currentSlide].classList.add('active');
        }
    }
    
    nextSlide() {
        this.currentSlide++;
        this.showSlide(this.currentSlide);
        this.resetAutoPlay();
    }
    
    prevSlide() {
        this.currentSlide--;
        this.showSlide(this.currentSlide);
        this.resetAutoPlay();
    }
    
    goToSlide(n) {
        this.currentSlide = n;
        this.showSlide(this.currentSlide);
        this.resetAutoPlay();
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
    
    addTouchSupport() {
        let startX = 0;
        let endX = 0;
        
        const container = document.querySelector('.slideshow-container');
        if (!container) return;
        
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe();
        });
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        };
        
        this.handleSwipe = handleSwipe;
    }
    
    addKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });
    }
}

// Global functions for HTML onclick events
const slideshows = {};

function changeSlide(serviceType, direction) {
    if (!slideshows[serviceType]) {
        slideshows[serviceType] = new ServiceSlideshow(serviceType);
    }
    
    if (direction === 1) {
        slideshows[serviceType].nextSlide();
    } else {
        slideshows[serviceType].prevSlide();
    }
}

function currentSlide(serviceType, slideNumber) {
    if (!slideshows[serviceType]) {
        slideshows[serviceType] = new ServiceSlideshow(serviceType);
    }
    
    slideshows[serviceType].goToSlide(slideNumber - 1);
}

// Initialize slideshows when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all service slideshows
    const serviceTypes = ['creative', 'lifestyle', 'agriculture', 'logistics'];
    
    serviceTypes.forEach(serviceType => {
        const slideContainer = document.querySelector(`[data-service="${serviceType}"]`);
        if (slideContainer || document.querySelector('.slideshow-container')) {
            slideshows[serviceType] = new ServiceSlideshow(serviceType);
        }
    });
    
    // Pause auto-play when user hovers over slideshow
    document.querySelectorAll('.service-slideshow').forEach(slideshow => {
        slideshow.addEventListener('mouseenter', () => {
            Object.values(slideshows).forEach(s => s.stopAutoPlay());
        });
        
        slideshow.addEventListener('mouseleave', () => {
            Object.values(slideshows).forEach(s => s.startAutoPlay());
        });
    });
    
    // Responsive behavior
    window.addEventListener('resize', () => {
        // Adjust slideshow heights on resize
        const containers = document.querySelectorAll('.slideshow-container');
        containers.forEach(container => {
            if (window.innerWidth <= 480) {
                container.style.height = '200px';
            } else if (window.innerWidth <= 768) {
                container.style.height = '250px';
            } else {
                container.style.height = '400px';
            }
        });
    });
});

// Intersection Observer for performance optimization
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Start auto-play when slideshow comes into view
                const serviceType = entry.target.dataset.service;
                if (slideshows[serviceType]) {
                    slideshows[serviceType].startAutoPlay();
                }
            } else {
                // Stop auto-play when slideshow is out of view
                const serviceType = entry.target.dataset.service;
                if (slideshows[serviceType]) {
                    slideshows[serviceType].stopAutoPlay();
                }
            }
        });
    });
    
    document.querySelectorAll('.service-slideshow').forEach(slideshow => {
        observer.observe(slideshow);
    });
}