
document.addEventListener('DOMContentLoaded', function () {


    const cartButton = document.querySelector('.js-show-cart');
    cartButton.addEventListener('click', function () {
        populateCartModal();
    });

    async function populateCartModal() {
        console.log('Populating the modal');
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartModalContent = document.querySelector('.header-cart-wrapitem');
        cartModalContent.innerHTML = '';

        for (const productId of cart) {
            try {
                const response = await fetch(`/product/${productId}`);
                const product = await response.json();

                const li = document.createElement('li');
                li.className = 'header-cart-item flex-w flex-t m-b-12';
                li.innerHTML = `
                    <div class="header-cart-item-img">
                        <img src="${product.images[0]}" alt="${product.en_name}">
                    </div>
                    <div class="header-cart-item-txt p-t-8">
                        <a href="#" class="header-cart-item-name m-b-18 hov-cl1 trans-04">${product.en_name}</a>
                        <span class="header-cart-item-info">1 x $${product.price}</span>
                    </div>
                    <button class="js-remove-from-cart" data-product-id="${product.id}">X</button>
                `;

                const removeButton = li.querySelector('.js-remove-from-cart');
                removeButton.addEventListener('click', function () {
                    const productId = this.dataset.productId;
                    removeFromCart(productId);
                });

                cartModalContent.appendChild(li);
            } catch (error) {
                console.error(`Error fetching product details for ID ${productId}:`, error);
            }
        }
    }

    function removeFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(id => id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        populateCartModal();
        updateCartCount();
    }


    document.querySelector('.js-addcart-detail').addEventListener('click', function () {
        const productId = document.querySelector('.js-name-detail').dataset.productId;
        console.log('Add to cart button clicked for product ID:', productId);

        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        cart.push(productId);

        localStorage.setItem('cart', JSON.stringify(cart));

        updateCartCount()
    });

    document.querySelectorAll('.js-show-modal1').forEach(button => {
        button.addEventListener('click', async function (event) {
            event.preventDefault();

            const productId = button.getAttribute('href').split('/').pop();

            try {
                const response = await fetch(`/product/${productId}`);
                const product = await response.json();

                populateModal(product);

                document.querySelector('.js-modal1').classList.add('show-modal1');
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
        });
    });


    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('cart')) || []
        const cartCountElement = document.querySelector('.js-show-cart')
        cartCountElement.setAttribute('data-notify', cart.length)
    }

    updateCartCount()

    function populateModal(product) {
        if (!product) return;

        document.querySelector('.slick3-dots').innerHTML = ''; // Clear any existing thumbnails
        document.querySelector('.js-name-detail').innerText = ''; // Clear the product name
        document.querySelector('.mtext-106.cl2').innerText = ''; // Clear the price
        document.querySelector('.stext-102.cl3').innerText = ''; // Clear the description

        document.querySelector('.js-name-detail').innerText = product.en_name;

        document.querySelector('.mtext-106.cl2').innerText = `$${product.price}`;

        document.querySelector('.stext-102.cl3').innerText = product.description;

        document.querySelector('.js-name-detail').dataset.productId = product.id;

        const imageList = document.querySelector('.slick3-dots');
        imageList.innerHTML = ''; // Clear any existing images

        product.images.forEach((image, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${image}" alt="Product Image">
                <div class="slick3-dot-overlay"></div>
            `;
            imageList.appendChild(li);

            li.addEventListener('click', () => {
                console.log(`Thumbnail clicked: ${image}`);
                updateActiveThumbnail(index);
                updateMainImage(image);
            });

            if (index === 0) {
                li.classList.add('slick-active');
                updateMainImage(image);
            }
        });

        function updateActiveThumbnail(activeIndex) {
            document.querySelectorAll('.slick3-dots li').forEach((li, index) => {
                li.classList.toggle('slick-active', index === activeIndex);
            });
        }

        function updateMainImage(imageSrc) {
            const mainImage = document.querySelector('.slick3 .slick-slide img'); // Adjust the selector if needed
            mainImage.setAttribute('src', imageSrc);
        }

        reinitializeSlick();
    }

    function reinitializeSlick() {
        const slickContainer = document.querySelector('.slick3');

        if (slickContainer && typeof slickContainer.slick === 'function') {
            $(slickContainer).slick('unslick');
        }

        $(slickContainer).slick({
            arrows: true, // Enable arrows
            dots: true, // Enable dots
            infinite: true, // Infinite scrolling
            autoplay: false, // Disable autoplay (if needed)
            speed: 300, // Speed of transition
            slidesToShow: 1, // Show 1 image at a time
            slidesToScroll: 1, // Scroll 1 image at a time
        });
    }

    document.querySelector('.js-hide-modal1').addEventListener('click', function () {
        document.querySelector('.js-modal1').classList.remove('show-modal1');
    });
});



