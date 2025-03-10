document.addEventListener("DOMContentLoaded", function() {
   const tabButtons = document.querySelectorAll('.tab-button');
   if (tabButtons.length > 0) {
     tabButtons[0].classList.add('active');
     var firstTabId = tabButtons[0].getAttribute('data-tab');
     document.querySelectorAll('.swiper-container.slider').forEach(function(slider) {
       slider.style.display = 'none';
     });
     var firstSlider = document.getElementById('tab-' + firstTabId);
     if (firstSlider) {
       firstSlider.style.display = 'block';
     }
   }
   tabButtons.forEach(function(button) {
     button.addEventListener('click', function() {
       tabButtons.forEach(function(btn) {
         btn.classList.remove('active');
       });
       button.classList.add('active');
       var tabId = button.getAttribute('data-tab');
       document.querySelectorAll('.swiper-container.slider').forEach(function(slider) {
         slider.style.display = 'none';
       });
       var activeSlider = document.getElementById('tab-' + tabId);
       if (activeSlider) {
         activeSlider.style.display = 'block';
       }
     });
   });
  let desktopSwipers = [];
  function initDesktopSwipers() {
    const sliders = document.querySelectorAll('.swiper-container.slider');
    sliders.forEach(function(slider) {
      if (!slider.classList.contains('swiper-initialized')) {
        const swiperInstance = new Swiper(slider, {
          slidesPerView: 4,
          spaceBetween: 16,
          navigation: {
            nextEl: slider.querySelector('.swiper-button-next'),
            prevEl: slider.querySelector('.swiper-button-prev')
          },
          loop: true
        });
        desktopSwipers.push(swiperInstance);
      }
    });
  }
  function destroyDesktopSwipers() {
    desktopSwipers.forEach(function(swiper) {
      swiper.destroy(true, true);
    });
    desktopSwipers = [];
  }

  function updateSliders() {
    if (window.innerWidth >= 1024) {
      document.querySelectorAll('.swiper-container.slider').forEach(function(slider) {
        slider.classList.remove('mobile-slider');
      });
      initDesktopSwipers();
    } else {
      destroyDesktopSwipers();
      document.querySelectorAll('.swiper-container.slider').forEach(function(slider) {
        slider.classList.add('mobile-slider');
      });
    }
  }
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  updateSliders();

  window.addEventListener('resize', debounce(updateSliders, 250));

 document.querySelectorAll('.variant-selector').forEach(function(selector) {
  selector.addEventListener('change', function() {
    let selectedOption = selector.options[selector.selectedIndex];
    let productId = selector.getAttribute('data-product-id');
    let productCard = document.querySelector('.product-card[data-product-id="' + productId + '"]');
    if (!productCard) return;
    
    let priceElement = productCard.querySelector('.price');
    if (priceElement) {
      priceElement.innerText = selectedOption.getAttribute('data-price');
    }

    let newImageUrl = selectedOption.getAttribute('data-image');
    let imageElement = productCard.querySelector('img');
    if (newImageUrl && newImageUrl.trim() !== "" && imageElement) {
      imageElement.src = newImageUrl;
    } else {
      let defaultImageUrl = productCard.getAttribute('data-default-image');
      if (defaultImageUrl && imageElement) {
        imageElement.src = defaultImageUrl;
      }
    }
    let addToCartButton = productCard.querySelector('.add-to-cart');
    if (addToCartButton) {
      if (selectedOption.getAttribute('data-available') === 'false') {
        addToCartButton.disabled = true;
        addToCartButton.innerHTML = '<span>Sold out</span>';
        addToCartButton.classList.add('disabled');
      } else {
        addToCartButton.disabled = false;
        addToCartButton.innerHTML = '<span>Add to cart</span>';
        addToCartButton.classList.remove('disabled');
      }
    }
  });
});

    document.querySelectorAll('.add-to-cart').forEach(function(button) {
      button.addEventListener('click', function() {
        var productCard = button.closest('.product-card');
        var variantSelector = productCard.querySelector('.variant-selector');
        var variantId;
        
        if (variantSelector) {
          variantId = variantSelector.value;
        } else {
          variantId = productCard.getAttribute('data-product-id');
        }
        
        if (!variantId) return;
        
        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{ id: variantId, quantity: 1 }]
          })
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          console.log('Item added:', data);
          updateCartCounter();
        })
        .catch(function(error) {
          console.error('Error adding to cart:', error);
        });
      });
    });
    
    function updateCartCounter() {
      fetch('/cart.js?t=' + new Date().getTime())
        .then(function(response) {
          return response.json();
        })
        .then(function(cart) {
          const cartIcon = document.getElementById('cart-icon-bubble');
          if (cart.item_count > 0) {
            let counter = cartIcon.querySelector('.cart-count-bubble');
            if (!counter) {
              counter = document.createElement('div');
              counter.className = 'cart-count-bubble';
              
              const counterText = document.createElement('span');
              counterText.setAttribute('aria-hidden', 'true');
              counterText.textContent = cart.item_count;
              counter.appendChild(counterText);
              
              const visuallyHiddenText = document.createElement('span');
              visuallyHiddenText.className = 'visually-hidden';
              visuallyHiddenText.textContent = cart.item_count + (cart.item_count === 1 ? ' item' : ' items');
              counter.appendChild(visuallyHiddenText);
              
              cartIcon.appendChild(counter);
            } else {
              const counterText = counter.querySelector('span[aria-hidden="true"]');
              if (counterText) {
                counterText.textContent = cart.item_count;
              }
              const visuallyHiddenText = counter.querySelector('.visually-hidden');
              if (visuallyHiddenText) {
                visuallyHiddenText.textContent = cart.item_count + (cart.item_count === 1 ? ' item' : ' items');
              }
            }
          } else {
            const counter = cartIcon.querySelector('.cart-count-bubble');
            if (counter) {
              counter.remove();
            }
          }
          
          console.log('Cart updated:', cart);
        })
        .catch(function(error) {
          console.error('Error updating cart counter:', error);
        });
    }
  });