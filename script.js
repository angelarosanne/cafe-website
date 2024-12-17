const root = document.getElementById("root");

// Variáveis globais
const API_URL = "http://localhost:3000/coffee";
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Função para atualizar o ícone do carrinho
function updateCartIcon() {
    const cartIcon = document.querySelector("#cart-icon");
    if (cartIcon) {
        cartIcon.textContent = `🛒 (${cart.reduce((acc, item) => acc + item.quantity, 0)})`;
    }
}

// Página Inicial
function renderIndexPage() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            root.innerHTML = `
                <header class="bg-dark text-white text-center py-3">
                    <h1>Café Shop</h1>
                    <button id="cart-icon" class="btn btn-success" onclick="renderCartPage()">🛒 (0)</button>
                </header>
                <main id="coffee-list" class="container my-4"></main>
            `;
            
            const coffeeList = document.getElementById("coffee-list");

            data.forEach(coffee => {
                const coffeeItem = document.createElement("div");
                coffeeItem.className = "coffee-item card mb-3";
                coffeeItem.innerHTML = `
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${coffee.image}" class="img-fluid rounded-start" alt="${coffee.title}"/>
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h2 class="card-title">${coffee.title}</h2>
                                <p class="card-text">${coffee.description}</p>
                                <p class="card-text"><small class="text-muted">Ingredientes: ${coffee.ingredients.join(", ")}</small></p>
                                <p class="card-text"><strong>Preço: R$${coffee.price.toFixed(2)}</strong></p>
                                <button class="btn btn-primary" onclick="addToCart(${coffee.id}, '${coffee.title}', ${coffee.price})">Adicionar ao Carrinho</button>
                            </div>
                        </div>
                    </div>
                `;
                coffeeList.appendChild(coffeeItem);
            });

            updateCartIcon();
        });
}

// Função para adicionar item ao carrinho
function addToCart(id, title, price) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, title, price, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartIcon();
}

// Página de Carrinho
function renderCartPage() {
    root.innerHTML = `
        <header class="bg-dark text-white text-center py-3">
            <h1>Carrinho de Compras</h1>
            <button class="btn btn-light" onclick="renderIndexPage()">Voltar</button>
        </header>
        <main id="cart-list" class="container my-4"></main>
        <footer class="bg-dark text-white text-center py-3">
            <h2>Total: R$<span id="total-price"></span></h2>
            <button class="btn btn-success" onclick="checkout()">Finalizar Compra</button>
        </footer>
    `;

    const cartList = document.getElementById("cart-list");
    cartList.innerHTML = "";

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item card mb-3";
        cartItem.innerHTML = `
            <div class="row g-0">
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text">Preço: R$${item.price.toFixed(2)}</p>
                        <p class="card-text">Quantidade: ${item.quantity}</p>
                        <button class="btn btn-warning" onclick="changeItemQuantity(${item.id}, -1)">-</button>
                        <button class="btn btn-warning" onclick="changeItemQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
            </div>
        `;

        cartList.appendChild(cartItem);
    });

    document.getElementById("total-price").textContent = total.toFixed(2);
}

// Função para alterar quantidade de itens no carrinho
function changeItemQuantity(id, delta) {
    const item = cart.find(item => item.id === id);

    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        renderCartPage();
    }
}

// Página de Finalização
function checkout() {
    root.innerHTML = `
        <header class="bg-dark text-white text-center py-3">
            <h1>Finalizar Compra</h1>
            <button class="btn btn-light" onclick="renderCartPage()">Voltar</button>
        </header>
        <main class="container my-4">
            <div id="checkout-items"></div>
            <form id="checkout-form">
                <div class="mb-3">
                    <label for="address" class="form-label">Endereço de entrega:</label>
                    <input type="text" class="form-control" id="address" required>
                </div>
                <div class="mb-3">
                    <label for="payment-method" class="form-label">Método de pagamento:</label>
                    <select class="form-select" id="payment-method">
                        <option value="cartao">Cartão de Crédito</option>
                        <option value="boleto">Boleto</option>
                        <option value="pix">PIX</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Finalizar</button>
            </form>
        </main>
    `;

    const checkoutItems = document.getElementById("checkout-items");
    cart.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.innerHTML = `<p>${item.title} - R$${item.price.toFixed(2)} x ${item.quantity}</p>`;
        checkoutItems.appendChild(itemDiv);
    });

    document.getElementById("checkout-form").addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Compra finalizada com sucesso!");
        localStorage.removeItem("cart");
        cart = [];
        renderIndexPage();
    });
}

renderIndexPage();
