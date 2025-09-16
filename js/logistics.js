// Quote Calculator Functionality
document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');
    const quoteForm = document.getElementById('quoteForm');
    const quoteResult = document.getElementById('quoteResult');
    const estimatedCost = document.getElementById('estimatedCost');
    const deliveryTime = document.getElementById('deliveryTime');
    
    // Pricing matrix
    const pricingMatrix = {
        'lagos-abuja': { standard: 1500, express: 2800, 'same-day': 4500 },
        'lagos-port-harcourt': { standard: 1800, express: 3200, 'same-day': null },
        'lagos-kano': { standard: 2200, express: 3800, 'same-day': null },
        'lagos-lagos': { standard: 800, express: 1500, 'same-day': 2500 },
        'abuja-abuja': { standard: 900, express: 1600, 'same-day': 2800 },
        'abuja-lagos': { standard: 1500, express: 2800, 'same-day': 4500 },
        'port-harcourt-lagos': { standard: 1800, express: 3200, 'same-day': null },
        'kano-lagos': { standard: 2200, express: 3800, 'same-day': null }
    };
    
    // Delivery time matrix
    const deliveryTimes = {
        'standard': '3-5 business days',
        'express': '1-2 business days',
        'same-day': '2-4 hours'
    };
    
    calculateBtn.addEventListener('click', function() {
        const pickup = document.getElementById('pickup-location').value;
        const delivery = document.getElementById('delivery-location').value;
        const weight = parseFloat(document.getElementById('package-weight').value);
        const speed = document.getElementById('delivery-speed').value;
        
        if (!pickup || !delivery || !weight || !speed) {
            alert('Please fill in all required fields to calculate cost.');
            return;
        }
        
        const route = `${pickup}-${delivery}`;
        const reverseRoute = `${delivery}-${pickup}`;
        
        let basePrice = 0;
        
        // Check if route exists in pricing matrix
        if (pricingMatrix[route]) {
            basePrice = pricingMatrix[route][speed];
        } else if (pricingMatrix[reverseRoute]) {
            basePrice = pricingMatrix[reverseRoute][speed];
        } else {
            // Default pricing for unlisted routes
            const defaultPricing = {
                'standard': 2000,
                'express': 3500,
                'same-day': null
            };
            basePrice = defaultPricing[speed];
        }
        
        if (basePrice === null) {
            alert('Same-day delivery is not available for this route.');
            return;
        }
        
        // Calculate weight surcharge (for packages over 5kg)
        let finalPrice = basePrice;
        if (weight > 5) {
            const extraWeight = weight - 5;
            const surcharge = Math.ceil(extraWeight) * 200; // ₦200 per extra kg
            finalPrice += surcharge;
        }
        
        // Display results
        estimatedCost.textContent = `₦${finalPrice.toLocaleString()}`;
        deliveryTime.textContent = deliveryTimes[speed];
        quoteResult.style.display = 'block';
        
        // Smooth scroll to result
        quoteResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    
    // Form submission
    quoteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(quoteForm);
        const pickup = formData.get('pickup-location');
        const delivery = formData.get('delivery-location');
        const weight = formData.get('package-weight');
        const speed = formData.get('delivery-speed');
        const senderName = formData.get('sender-name');
        const senderPhone = formData.get('sender-phone');
        const recipientName = formData.get('recipient-name');
        const recipientPhone = formData.get('recipient-phone');
        const description = formData.get('package-description');
        const instructions = formData.get('special-instructions');
        
        // Create WhatsApp message
        const message = `🚚 PICKUP REQUEST\n\n` +
            `📦 PACKAGE DETAILS:\n` +
            `• From: ${pickup}\n` +
            `• To: ${delivery}\n` +
            `• Weight: ${weight}kg\n` +
            `• Speed: ${speed}\n` +
            `• Description: ${description}\n\n` +
            `👤 SENDER:\n` +
            `• Name: ${senderName}\n` +
            `• Phone: ${senderPhone}\n\n` +
            `👤 RECIPIENT:\n` +
            `• Name: ${recipientName}\n` +
            `• Phone: ${recipientPhone}\n\n` +
            `📝 SPECIAL INSTRUCTIONS:\n${instructions || 'None'}\n\n` +
            `Please confirm pickup details and provide final quote.`;
        
        const whatsappUrl = `https://wa.me/2348123456789?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Animate elements on scroll
function animateOnScroll() {
    const serviceCards = document.querySelectorAll('.service-card');
    const zoneCards = document.querySelectorAll('.zone-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    [...serviceCards, ...zoneCards].forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

// Initialize animations
document.addEventListener('DOMContentLoaded', animateOnScroll);

// Form validation enhancements
document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove non-numeric characters except + and spaces
            this.value = this.value.replace(/[^+\d\s]/g, '');
            
            // Add Nigerian country code if not present
            if (this.value.length > 0 && !this.value.startsWith('+234') && !this.value.startsWith('0')) {
                this.value = '+234' + this.value;
            }
        });
    });
    
    // Weight input validation
    const weightInput = document.getElementById('package-weight');
    weightInput.addEventListener('input', function() {
        if (this.value < 0.1) {
            this.value = 0.1;
        }
        if (this.value > 1000) {
            alert('For packages over 1000kg, please contact us directly for a custom quote.');
            this.value = 1000;
        }
    });
});

// Auto-update delivery options based on route
document.addEventListener('DOMContentLoaded', function() {
    const pickupSelect = document.getElementById('pickup-location');
    const deliverySelect = document.getElementById('delivery-location');
    const speedSelect = document.getElementById('delivery-speed');
    
    function updateDeliveryOptions() {
        const pickup = pickupSelect.value;
        const delivery = deliverySelect.value;
        
        if (pickup && delivery) {
            const sameDayOptions = speedSelect.querySelectorAll('option[value="same-day"]');
            
            // Enable/disable same-day delivery based on route
            if ((pickup === 'lagos' && delivery === 'lagos') || 
                (pickup === 'abuja' && delivery === 'abuja') ||
                (pickup === 'lagos' && delivery === 'abuja') ||
                (pickup === 'abuja' && delivery === 'lagos')) {
                sameDayOptions.forEach(option => {
                    option.disabled = false;
                    option.textContent = 'Same Day (2-4 hours)';
                });
            } else {
                sameDayOptions.forEach(option => {
                    option.disabled = true;
                    option.textContent = 'Same Day (Not Available)';
                });
                
                // Reset selection if same-day was selected
                if (speedSelect.value === 'same-day') {
                    speedSelect.value = '';
                }
            }
        }
    }
    
    pickupSelect.addEventListener('change', updateDeliveryOptions);
    deliverySelect.addEventListener('change', updateDeliveryOptions);
});