const client = contentful.createClient({
	// This is the space ID. A space is like a project folder in Contentful terms
	space: "69zmk43v6ege",
	// This is the access token for this space. Normally you get both ID and the token in the Contentful web app
	accessToken: "I6fhcXp5FM9WoNmysJAVDFS7n8s95Tn0OBL878kdmk0",
});

// variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const likeOverlay = document.querySelector(".like-overlay");
const closeUserBtn = document.querySelector(".closeUser-Btn");
console.log(closeUserBtn);

// cart
let cart = [];
// let buttons
let buttonsDOM = [];

// getting the products
class Products {
	async getProducts() {
		try {
			const response = await client.getEntries({
				content_type: "shoppingCart",
			});
			// let result = await fetch("./products.json");
			// let data = await result.json();
			let products = response.items;
			products = products.map((item) => {
				const { title, price } = item.fields;
				const { id } = item.sys;
				const image = item.fields.image.fields.file.url;
				return { title, price, id, image };
			});
			return products;
		} catch (error) {
			console.log(error);
		}
	}
}
// display products
class UI {
	displayProducts(products) {
		let result = "";
		products.forEach((product) => {
			result += `
                <article class="product">
				<div class="img-container">
				<span class="like-icon"><i class="far fa-heart"></i></span>
						<img
							src=${product.image}
							alt="product"
							class="product-img"
						/>
						<button class="bag-btn" data-id=${product.id}>
							<i class="fas fa-shopping-cart"></i>
							add to cart 
						</button>
					</div>
					<h3>${product.title}</h3>
					<h4>$${product.price}</h4>
				</article>
            `;
		});

		productsDOM.innerHTML = result;
		const articles = productsDOM.querySelectorAll("article");
		articles.forEach((article) => {
			const likeBtn = article.querySelector(".like-icon");
			likeBtn.addEventListener("click", (e) => {
				document.body.classList.add("modal-open");
				likeOverlay.classList.add("show");
			});
		});
	}

	// get buttons methos
	getBagButtons() {
		const buttons = [...document.querySelectorAll(".bag-btn")];
		buttonsDOM = buttons;
		buttons.forEach((button) => {
			let id = button.dataset.id;
			let inCart = cart.find((item) => item.id === id);
			if (inCart) {
				button.innerText = "In Cart";
				button.disabled = true;
			}
			button.addEventListener("click", (e) => {
				e.target.innerText = "In Cart";
				e.target.disabled = true;
				// get product from products
				let cartItem = { ...Storage.getProduct(id), amount: 1 };
				// add product to the cart
				cart = [...cart, cartItem];
				// save cart in local storage
				Storage.saveCart(cart);
				// set cart values
				this.setCartValues(cart);

				// display cart Item
				this.addCartItem(cartItem);
				// show the cart
				this.showCart();
			});
		});
	}

	setCartValues(cart) {
		let tempTotal = 0;
		let itemsTotal = 0;
		cart.map((item) => {
			tempTotal += item.price * item.amount;
			itemsTotal += item.amount;
		});

		cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
		cartItems.innerText = itemsTotal;
	}

	addCartItem(item) {
		const div = document.createElement("div");
		div.classList.add("cart-item");
		div.innerHTML = `
        
						<img src=${item.image} alt="product" />
						<div>
							<h4>${item.title}</h4>
							<h5>$${item.price}</h5>
							<span class="remove-item" data-id="${item.id}">remove</span>
						</div>
						<div>
							<i class="fas fa-chevron-up" data-id="${item.id}"></i>
							<p class="item-amount">${item.amount}</p>
							<i class="fas fa-chevron-down" data-id="${item.id}"></i>
						</div>
					
        `;
		cartContent.appendChild(div);
	}

	showCart() {
		cartOverlay.classList.add("transparentBcg");
		cartDOM.classList.add("showCart");
	}

	setupAPP() {
		cart = Storage.getCart();
		this.setCartValues(cart);
		this.populateCart(cart);

		cartBtn.addEventListener("click", this.showCart);
		closeCartBtn.addEventListener("click", this.hideCart);
	}

	populateCart(cart) {
		cart.forEach((item) => this.addCartItem(item));
	}

	hideCart() {
		cartOverlay.classList.remove("transparentBcg");
		cartDOM.classList.remove("showCart");
	}

	// CART LOGIC

	cartLogic() {
		// clear cart button
		clearCartBtn.addEventListener("click", () => {
			this.clearCart();
		});
		// cart functionality
		cartContent.addEventListener("click", (e) => {
			if (e.target.classList.contains("remove-item")) {
				let removeItem = e.target;
				let id = removeItem.dataset.id;
				cartContent.removeChild(removeItem.parentElement.parentElement);
				this.removeItem(id);
			} else if (e.target.classList.contains("fa-chevron-up")) {
				let addAmount = e.target;
				let id = addAmount.dataset.id;
				let tempItem = cart.find((item) => item.id === id);

				tempItem.amount = tempItem.amount + 1;
				Storage.saveCart(cart);
				this.setCartValues(cart);
				addAmount.nextElementSibling.innerText = tempItem.amount;
			} else if (e.target.classList.contains("fa-chevron-down")) {
				let lowerAmount = e.target;
				let id = lowerAmount.dataset.id;
				let tempItem = cart.find((item) => item.id === id);
				tempItem.amount = tempItem.amount - 1;

				if (tempItem.amount > 0) {
					Storage.saveCart(cart);
					this.setCartValues(cart);
					lowerAmount.previousElementSibling.innerText = tempItem.amount;
				} else {
					cartContent.removeChild(lowerAmount.parentElement.parentElement);
					this.removeItem(id);
				}
			}
		});
	}

	clearCart() {
		let cartItems = cart.map((item) => item.id);
		cartItems.forEach((id) => this.removeItem(id));

		while (cartContent.children.length > 0) {
			cartContent.removeChild(cartContent.children[0]);
		}

		console.log(cartContent.children);

		this.hideCart();
	}

	removeItem(id) {
		cart = cart.filter((item) => item.id !== id);
		this.setCartValues(cart);
		Storage.saveCart(cart);
		let button = this.getSingleButton(id);
		button.disabled = false;
		button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
	}

	getSingleButton(id) {
		return buttonsDOM.find((button) => button.dataset.id === id);
	}
}
// local storagecart
class Storage {
	static saveProducts(products) {
		localStorage.setItem("products", JSON.stringify(products));
	}

	static getProduct(id) {
		let products = JSON.parse(localStorage.getItem("products"));
		return products.find((item) => item.id === id);
	}

	static saveCart(cart) {
		localStorage.setItem("cart", JSON.stringify(cart));
	}

	static getCart() {
		return localStorage.getItem("cart")
			? JSON.parse(localStorage.getItem("cart"))
			: [];
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const ui = new UI();
	const products = new Products();
	// setup APP
	ui.setupAPP();
	// get products
	products
		.getProducts()
		.then((products) => {
			ui.displayProducts(products);
			Storage.saveProducts(products);
		})
		.then(() => {
			ui.getBagButtons();
			ui.cartLogic();
		});
});

// copyright
const copyright = document.querySelector(".copyright-yr");

const year = new Date().getFullYear();
copyright.innerHTML = `${"&copy;"} copyright ${year}`;
closeUserBtn.addEventListener("click", () => {
	likeOverlay.classList.remove("show");
	document.body.classList.remove("modal-open");
});
