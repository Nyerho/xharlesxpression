(function () {
    const cartKey = 'artCart';
    let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');

    // Elements
    const cartCountEl = document.getElementById('cartCount');
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutForm = document.getElementById('checkoutForm');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    // Helpers
    function saveCart() {
        localStorage.setItem(cartKey, JSON.stringify(cart));
        updateCartBadge();
    }
    function currency(n) {
        return `$${Number(n).toFixed(2)}`;
    }
    function updateCartBadge() {
        if (cartCountEl) cartCountEl.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
    }
    function cartTotal() {
        return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    }
    function renderCart() {
        if (!cartItemsEl) return;
        cartItemsEl.innerHTML = '';
        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p class="text-muted mb-0">Your cart is empty.</p>';
        } else {
            cart.forEach((item, idx) => {
                const line = document.createElement('div');
                line.className = 'cart-line';
                line.innerHTML = `
                    <div>
                        <strong>${item.title}</strong>
                        <div class="text-muted small">Variant: ${item.variant_label}</div>
                    </div>
                    <div class="text-muted">${currency(item.price)}</div>
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary" data-action="dec" data-index="${idx}">-</button>
                        <span>${item.qty}</span>
                        <button class="btn btn-sm btn-outline-secondary" data-action="inc" data-index="${idx}">+</button>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" data-action="remove" data-index="${idx}">Remove</button>
                `;
                cartItemsEl.appendChild(line);
            });
        }
        if (cartTotalEl) cartTotalEl.textContent = currency(cartTotal());
    }

    // Event: Quantity/Remove within cart modal
    document.addEventListener('click', (e) => {
        const t = e.target;
        if (t.matches('button[data-action]')) {
            const action = t.getAttribute('data-action');
            const idx = Number(t.getAttribute('data-index'));
            if (action === 'inc') cart[idx].qty++;
            if (action === 'dec') cart[idx].qty = Math.max(1, cart[idx].qty - 1);
            if (action === 'remove') cart.splice(idx, 1);
            saveCart();
            renderCart();
        }
    });

    // Product events
    document.querySelectorAll('.product-card').forEach(card => {
        const addBtn = card.querySelector('.add-to-cart-btn');
        const buyBtn = card.querySelector('.buy-now-btn');
        const priceEl = card.querySelector('.price');
        const variantSelect = card.querySelector('.variant-select');
        const title = card.dataset.title;
        const productId = card.dataset.productId;

        function currentVariant() {
            const opt = variantSelect.options[variantSelect.selectedIndex];
            const variantId = opt.getAttribute('data-variant-id');
            return { variant_id: variantId, label: opt.textContent };
        }

        addBtn?.addEventListener('click', () => {
            const price = Number(priceEl?.dataset.price || 0);
            const v = currentVariant();
            const existingIdx = cart.findIndex(i => i.product_id === productId && i.variant_id === v.variant_id);
            if (existingIdx >= 0) {
                cart[existingIdx].qty++;
            } else {
                cart.push({
                    product_id: productId,
                    title,
                    variant_id: v.variant_id,
                    variant_label: v.label,
                    price,
                    qty: 1
                });
            }
            saveCart();
        });

        buyBtn?.addEventListener('click', () => {
            // Add then open cart modal
            addBtn.click();
            const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
            renderCart();
            cartModal.show();
        });

        variantSelect?.addEventListener('change', () => {
            // If price varies per variant, adjust here (optional)
        });
    });

    clearCartBtn?.addEventListener('click', () => {
        cart = [];
        saveCart();
        renderCart();
    });

    // Checkout: Send to backend (Printful integration endpoint)
    checkoutBtn?.addEventListener('click', async () => {
        try {
            const payload = buildPrintfulOrderPayload(cart);
            // Replace with your backend route that talks to Printful's API
            const res = await fetch('/api/printful/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Checkout failed');
            const data = await res.json();
            alert('Order placed successfully!');
            cart = [];
            saveCart();
            renderCart();
        } catch (err) {
            console.error(err);
            alert('Unable to complete checkout. Please try again or contact support.');
        }
    });

    // Build Printful-ready payload (example)
    function buildPrintfulOrderPayload(items) {
        return {
            // You will supply customer + shipping details on your checkout form
            recipient: {
                name: "Customer Name",
                address1: "Address Line",
                city: "City",
                state_code: "State",
                country_code: "US",
                zip: "00000"
            },
            items: items.map(i => ({
                // Printful expects variant_id that corresponds to a Printful catalog variant
                variant_id: Number(i.variant_id),
                quantity: i.qty,
                retail_price: i.price.toFixed(2),
                name: i.title
            })),
            // Optional: packing slip, shipping, etc. handled on backend
            external_id: `AURANEX-${Date.now()}`
        };
    }

    // Initialize UI
    updateCartBadge();
    renderCart();

    // Basic sorting/filtering demo
    const sortSelect = document.getElementById('sortSelect');
    const categorySelect = document.getElementById('categorySelect');
    sortSelect?.addEventListener('change', () => sortProducts(sortSelect.value));
    categorySelect?.addEventListener('change', () => filterProducts(categorySelect.value));

    function sortProducts(mode) {
        const grid = document.getElementById('productGrid');
        const cards = Array.from(grid.children);
        cards.sort((a, b) => {
            const pa = Number(a.querySelector('.price')?.dataset.price || 0);
            const pb = Number(b.querySelector('.price')?.dataset.price || 0);
            if (mode === 'price_low_high') return pa - pb;
            if (mode === 'price_high_low') return pb - pa;
            return 0;
        });
        cards.forEach(c => grid.appendChild(c));
    }

    function filterProducts(cat) {
        document.querySelectorAll('#productGrid .product-card').forEach(card => {
            const match = cat === 'all' || card.dataset.category === cat;
            card.parentElement.style.display = match ? '' : 'none';
        });
    }
})();