// Slideshow functionality with auto-play and responsive controls
class ServiceSlideshow {
    constructor(serviceType) {
        this.serviceType = serviceType;
        this.currentSlide = 0;

        // Bind to the specific container for this service
        this.container = document.querySelector(`[data-service="${serviceType}"]`);

        // Collect slides/dots scoped to the specific container; fallback to global only if needed
        this.slides = this.container ? this.container.querySelectorAll('.slide') : document.querySelectorAll(`[data-service="${serviceType}"] .slide`);
        if (!this.slides || this.slides.length === 0) {
            this.slides = document.querySelectorAll('.slide');
        }

        this.dots = this.container ? this.container.parentElement.querySelectorAll('.dots-container .dot') : document.querySelectorAll(`[data-service="${serviceType}"] .dot`);
        if (!this.dots || this.dots.length === 0) {
            this.dots = document.querySelectorAll('.dot');
        }

        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 seconds
        
        this.init();
    }
    
    init() {
        // Ensure the first slide is visible immediately
        this.showSlide(this.currentSlide);

        // Set initial container height for mobile/desktop
        this.updateContainerHeight();

        // Start autoplay and add input support
        this.startAutoPlay();
        this.addTouchSupport();
        this.addKeyboardSupport();

        // Keep heights responsive
        window.addEventListener('resize', () => this.updateContainerHeight());
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
        else if (n < 0) this.currentSlide = this.slides.length - 1;
        else this.currentSlide = n;

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
        
        // Attach touch handlers to the specific container
        const container = this.container || document.querySelector('.slideshow-container');
        if (!container) return;
        
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe();
        }, { passive: true });
        
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
    
    updateContainerHeight() {
        // Adjust slideshow heights per container based on viewport
        const container = this.container;
        const width = window.innerWidth;
        if (container) {
            if (width <= 480) {
                container.style.height = '200px';
            } else if (width <= 768) {
                container.style.height = '250px';
            } else {
                container.style.height = '400px';
            }
        }
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
        if (slideContainer) {
            slideshows[serviceType] = new ServiceSlideshow(serviceType);
        }
    });
    
    // Pause auto-play when user hovers over slideshow (align with actual HTML class)
    document.querySelectorAll('.service-showcase').forEach(showcase => {
        showcase.addEventListener('mouseenter', () => {
            Object.values(slideshows).forEach(s => s.stopAutoPlay());
        });
        
        showcase.addEventListener('mouseleave', () => {
            Object.values(slideshows).forEach(s => s.startAutoPlay());
        });
    });
});
 
// Intersection Observer for performance optimization
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const serviceType = entry.target.querySelector('.slideshow-container')?.dataset.service;
            if (!serviceType) return;
            if (entry.isIntersecting) {
                if (slideshows[serviceType]) {
                    slideshows[serviceType].startAutoPlay();
                }
            } else {
                if (slideshows[serviceType]) {
                    slideshows[serviceType].stopAutoPlay();
                }
            }
        });
    });
    
    // Observe the actual showcase elements present in services.html
    document.querySelectorAll('.service-showcase').forEach(showcase => {
        observer.observe(showcase);
    });
}