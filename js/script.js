document.addEventListener('DOMContentLoaded', () => {
    const btnCart = document.querySelector('.container-cart-icon');
    const containerCartProducts = document.querySelector('.container-cart-products');
    const purchaseButton = document.createElement('button');
    purchaseButton.textContent = 'Comprar';
    purchaseButton.classList.add('purchase-button');
    containerCartProducts.appendChild(purchaseButton);
    const CCexpInput = document.getElementById('CCexp');
    const expValue = CCexpInput.value;
    const currentYear = new Date().getFullYear() % 100; // ultimos dos digitos del año en curso
    const currentMonth = new Date().getMonth() + 1; // mes en curso(0-based)
    const [expMonth, expYear] = expValue.split('/').map(num => parseInt(num, 10));
    btnCart.addEventListener('click', () => {
        containerCartProducts.classList.toggle('hidden-cart');
    });
    const rowProduct = document.querySelector('.row-product');
    const productsList = document.querySelector('.container-items');
    let allProducts = JSON.parse(localStorage.getItem("AddedToCart")) || [];
    const valorTotal = document.querySelector('.total-pagar');
    const countProducts = document.querySelector('#contador-productos');
    const cartEmpty = document.querySelector('.cart-empty');
    const cartTotal = document.querySelector('.cart-total');
    // Cargar productos desde JSON
    fetch('productos.json')
        .then(response => response.json())
        .then(data => {
            displayProducts(data);
        })
        .catch(error => console.error('Error al cargar los productos:', error));
    const displayProducts = (productos) => {
        productsList.innerHTML = ''; // Limpia lista de productos antes de agregar nuevos
        productos.forEach(producto => {
            const item = document.createElement('div');
            item.classList.add('item');
            item.innerHTML = `
                <figure>
                    <img src="${producto.image}" alt="${producto.title}" />
                </figure>
                <div class="info-product">
                    <h2>${producto.title}</h2>
                    <h3>Talla</h3>
                    <select class="tallas">
                        ${producto.tallas.map(talla => `<option value="${talla}">${talla}</option>`).join('')}
                    </select>
                    <p class="price">$${producto.price.toFixed(2)}</p>
                    <button class="btn-add-cart">Añadir al carrito</button>
                </div>
            `;
            productsList.appendChild(item);
        });
        const addCartButtons = document.querySelectorAll('.btn-add-cart');
        addCartButtons.forEach(button => {
            button.addEventListener('click', addToCart); 
        });
    };
    const addToCart = (e) => {
        const product = e.target.parentElement;
        const infoProduct = {
            quantity: 1,
            title: product.querySelector('h2').textContent,
            price: product.querySelector('p').textContent,
        };
        const exists = allProducts.some(
            product => product.title === infoProduct.title
        );
        if (exists) {
            swal('Este artículo ya está en el carrito.');
        } else {
            allProducts = [...allProducts, infoProduct];
            saveLocal();
            showHTML();
            const productAdded = true;  // Simula que el producto se ha añadido correctamente
        if (productAdded) {
            toastr.success("Para finalizar tu compra ingresa al carrito", "Producto agregado!");
            toastr.options = {
                "closeButton": false,
                "debug": false,
                "newestOnTop": false,
                "progressBar": false,
                "positionClass": "toast-top-right",
                "preventDuplicates": false,
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": "5000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };
        }
        }
    };
    rowProduct.addEventListener('click', e => {
        if (e.target.closest('.icon-close')) {
            const product = e.target.closest('.cart-product');
            const title = product.querySelector('.titulo-producto-carrito').textContent;
            allProducts = allProducts.filter(
                product => product.title !== title
            );
            saveLocal();
            showHTML();
        } else if (e.target.closest('.icon-add')) {
            const product = e.target.closest('.cart-product');
            const title = product.querySelector('.titulo-producto-carrito').textContent;
            allProducts = allProducts.map(product => {
                if (product.title === title) {
                    product.quantity++;
                }
                return product;
            });
            saveLocal();
            showHTML();
        } else if (e.target.closest('.icon-remove')) {
            const product = e.target.closest('.cart-product');
            const title = product.querySelector('.titulo-producto-carrito').textContent;

            allProducts = allProducts.map(product => {
                if (product.title === title && product.quantity > 1) {
                    product.quantity--;
                }
                return product;
            }).filter(product => product.quantity > 0);
            saveLocal();
            showHTML();
        }
    });
    // Modal
    const modal = document.getElementById("purchaseModal");
    const closeModalBtn = document.querySelector(".close");
    const finalizarCompraBtn = document.getElementById("finalizarCompra");
    // Abrir modal al hacer click en comprar
    purchaseButton.addEventListener('click', () => {
        if (allProducts.length === 0) {
            swal('El carrito está vacío!');
        } else {
            modal.style.display = "block";
        }
    });
    // Cerrar modal
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = "none";
    });
    // Cerrar modal cuando hay click afuera
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
    // Validar fecha de vencimiento
    function validateExpirationDate() {
        const CCexpInput = document.getElementById('CCexp');
        const expValue = CCexpInput.value;
        const currentYear = new Date().getFullYear() % 100; // ultimos dos digitos del año en curso
        const currentMonth = new Date().getMonth() + 1; // mes en curo (0-based)
        const [expMonth, expYear] = expValue.split('/').map(num => parseInt(num, 10));
        if (!expMonth || !expYear || expMonth < 1 || expMonth > 12 || expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            swal('Tu tarjeta parece estar vencida, checkea su fecha de vencimiento');
            CCexpInput.focus();
            return false;
        }
        return true;
    }
    // Validar fecha de nacimiento
    function validateBirthDate() {
        const birthDateInput = document.getElementById('fechaNacimiento').value;
        const birthDateParts = birthDateInput.split('/');
        const birthDate = new Date(`${birthDateParts[2]}-${birthDateParts[1]}-${birthDateParts[0]}`);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))) {
            return true;
        } else {
            swal('Debes tener al menos 18 años para poder comprar en DEPORTIVA STORE.');
            return false;
        }
    }
    // Restringir la entrada al formato DD/MM/YYYY y permitir solo números.
    document.getElementById('fechaNacimiento').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, '');
        if (input.length <= 8) {
            if (input.length > 4) {
                input = input.slice(0, 2) + '/' + input.slice(2, 4) + '/' + input.slice(4);
            } else if (input.length > 2) {
                input = input.slice(0, 2) + '/' + input.slice(2);
            }
            e.target.value = input;
        } else {
            e.target.value = input.slice(0, 10);
        }
    });
    // Restringir la entrada al formato DD/MM/YYYY y permitir solo números.
    document.getElementById('CCexp').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, ''); // Remueve caracteres non-numeric
        if (input.length <= 4) {
            if (input.length >= 2) {
                input = input.slice(0, 2) + '/' + input.slice(2);
            }
            e.target.value = input;
        } else {
            e.target.value = input.slice(0, 5);
        }
    });
    // Finalizar compra
    finalizarCompraBtn.addEventListener('click', () => {
        const form = document.getElementById('purchaseForm');
        if (form.checkValidity()) {
            if (validateBirthDate() && validateExpirationDate()) {
                modal.style.display = "none";
                allProducts = [];
                localStorage.removeItem("AddedToCart");
                showHTML();
                swal("¡Gracias por tu compra!", "Nuestro equipo de venta se contactará contigo en 24hs", "success");
            }
        } else {
            form.reportValidity();
        }
    });
    const showHTML = () => {
        if (!allProducts.length) {
            cartEmpty.classList.remove('hidden');
            rowProduct.classList.add('hidden');
            cartTotal.classList.add('hidden');
        } else {
            cartEmpty.classList.add('hidden');
            rowProduct.classList.remove('hidden');
            cartTotal.classList.remove('hidden');
        }
        rowProduct.innerHTML = '';
        let total = 0;
        let totalOfProducts = 0;
        allProducts.forEach(product => {
            const containerProduct = document.createElement('div');
            containerProduct.classList.add('cart-product');
            containerProduct.innerHTML = `
                <div class="info-cart-product">
                    <span class="cantidad-producto-carrito">${product.quantity}</span>
                    <p class="titulo-producto-carrito">${product.title}</p>
                    <span class="precio-producto-carrito">${product.price}</span>
                </div>
                <div class="icon-circle icon-close">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="icon-close"
                        width="16" height="16"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </div>
                <div class="icon-circle icon-add">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="icon-add"
                        width="16" height="16"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                        />
                    </svg>
                </div>
                <div class="icon-circle icon-remove">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="icon-remove"
                        width="16" height="16"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15 12H9"
                        />
                    </svg>
                </div>
            `;
            rowProduct.append(containerProduct);
            total = total + parseInt(product.quantity * product.price.slice(1));
            totalOfProducts = totalOfProducts + product.quantity;
        });
        valorTotal.innerText = `$${total}`;
        countProducts.innerText = totalOfProducts;
    };
    const saveLocal = () => {
        localStorage.setItem("AddedToCart", JSON.stringify(allProducts));
    };
    // Llama a showHTML al cargar la página para mostrar los productos guardados en localStorage
    showHTML();
});