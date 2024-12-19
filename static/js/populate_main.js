
document.addEventListener('DOMContentLoaded', function () {


    document.querySelector('.js-addcart-detail').addEventListener('click', function () {
        const productId = document.querySelector('.js-name-detail').dataset.productId;
        console.log('Add to cart button clicked for product ID:', productId);
    
        // First, check if there's already a cart in local storage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Add the new product ID to the cart array
        cart.push(productId);

        // Save the updated cart back to local storage
        localStorage.setItem('cart', JSON.stringify(cart));
    });

    // Add click event listeners to all "Quick View" buttons
    document.querySelectorAll('.js-show-modal1').forEach(button => {
        button.addEventListener('click', async function (event) {
            event.preventDefault();

            // Extract product ID from the button's href attribute
            const productId = button.getAttribute('href').split('/').pop();

            try {
                // Fetch product details from the API
                const response = await fetch(`/product/${productId}`);
                const product = await response.json();

                // Populate the modal with product details
                populateModal(product);

                // Show the modal
                document.querySelector('.js-modal1').classList.add('show-modal1');
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
        });
    });

    // Function to populate the modal with product details
    function populateModal(product) {
        if (!product) return;

        // Clear the previous product's details and images from the modal
        document.querySelector('.slick3-dots').innerHTML = ''; // Clear any existing thumbnails
        document.querySelector('.js-name-detail').innerText = ''; // Clear the product name
        document.querySelector('.mtext-106.cl2').innerText = ''; // Clear the price
        document.querySelector('.stext-102.cl3').innerText = ''; // Clear the description

        // Populate product name
        document.querySelector('.js-name-detail').innerText = product.en_name;

        // Populate product price
        document.querySelector('.mtext-106.cl2').innerText = `$${product.price}`;

        // Populate product description
        document.querySelector('.stext-102.cl3').innerText = product.description;

        // Save the product ID
        document.querySelector('.js-name-detail').dataset.productId = product.id;


        // Populate product images dynamically
        const imageList = document.querySelector('.slick3-dots');
        imageList.innerHTML = ''; // Clear any existing images

        // Loop through the product images and add them to the gallery
        product.images.forEach((image, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${image}" alt="Product Image">
                <div class="slick3-dot-overlay"></div>
            `;
            imageList.appendChild(li);

            // Add event listener for thumbnails
            li.addEventListener('click', () => {
                console.log(`Thumbnail clicked: ${image}`);
                updateActiveThumbnail(index);
                updateMainImage(image);
            });

            // Set first image as active by default
            if (index === 0) {
                li.classList.add('slick-active');
                updateMainImage(image);
            }
        });

        // Function to update the active thumbnail
        function updateActiveThumbnail(activeIndex) {
            document.querySelectorAll('.slick3-dots li').forEach((li, index) => {
                li.classList.toggle('slick-active', index === activeIndex);
            });
        }

        // Function to update the main image
        function updateMainImage(imageSrc) {
            const mainImage = document.querySelector('.slick3 .slick-slide img'); // Adjust the selector if needed
            mainImage.setAttribute('src', imageSrc);
        }

        // Reinitialize the slick slider if it exists
        reinitializeSlick();
    }

    // Function to reinitialize the slick slider to avoid issues with image changes
    function reinitializeSlick() {
        const slickContainer = document.querySelector('.slick3');

        // Check if slick is already initialized, if so, destroy it
        if (slickContainer && typeof slickContainer.slick === 'function') {
            $(slickContainer).slick('unslick'); // Destroy existing slick instance
        }

        // Initialize slick slider again
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

    // Close the modal when the close button is clicked
    document.querySelector('.js-hide-modal1').addEventListener('click', function () {
        document.querySelector('.js-modal1').classList.remove('show-modal1');
    });
});



