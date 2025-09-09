// get dom elements
let categoryContainer = document.getElementById("category-container");
let postContainer = document.getElementById("post-container");
let loaderDiv = document.getElementById("loader");
let myCart = [];

// show loader
function showLoader() {
  loaderDiv.classList.remove("hidden");
  loaderDiv.classList.add("flex");
}

// hide loader
function hideLoader() {
  loaderDiv.classList.add("hidden");
  loaderDiv.classList.remove("flex");
}

// load categories from api
async function loadAllCategories() {
  try {
    let url = "https://openapi.programming-hero.com/api/categories";
    let response = await fetch(url);
    let result = await response.json();

    categoryContainer.innerHTML = "";

    // add all trees option first
    let allTreesLi = document.createElement("li");
    allTreesLi.id = "all";
    allTreesLi.className =
      "hover:bg-green-700 hover:text-white rounded-lg cursor-pointer px-3 py-2 categoryItem";
    allTreesLi.innerText = "All Trees";
    categoryContainer.appendChild(allTreesLi);

    // add other categories
    for (let i = 0; i < result.categories.length; i++) {
      let categoryLi = document.createElement("li");
      categoryLi.id = result.categories[i].id;
      categoryLi.className =
        "hover:bg-green-700 hover:text-white rounded-lg cursor-pointer px-3 py-2 categoryItem";
      categoryLi.innerText = result.categories[i].category_name;
      categoryContainer.appendChild(categoryLi);
    }
  } catch (err) {
    console.log("Error loading categories:", err);
  }
}

// handle category clicks
categoryContainer.addEventListener("click", function (e) {
  let allCategoryItems = document.querySelectorAll(".categoryItem");

  // remove active class from all
  for (let item of allCategoryItems) {
    item.classList.remove("bg-green-700", "text-white");
  }

  if (e.target.tagName === "LI") {
    e.target.classList.add("bg-green-700", "text-white");
    let clickedId = e.target.id;

    if (clickedId === "all") {
      showLoader();
      loadAllPlants();
    } else {
      showLoader();
      loadPlantsByCategory(clickedId);
    }
  }
});

// load all plants
async function loadAllPlants() {
  showLoader();
  try {
    let plantsUrl = "https://openapi.programming-hero.com/api/plants";
    let plantsResponse = await fetch(plantsUrl);
    let plantsData = await plantsResponse.json();
    displayPlants(plantsData.plants);
  } catch (error) {
    console.log("Plants loading error:", error);
  }
  hideLoader();
}

// display plants on page
function displayPlants(plants) {
  postContainer.innerHTML = "";

  for (let plant of plants) {
    let plantCard = document.createElement("div");
    plantCard.className =
      "card bg-white border border-green-100 rounded-2xl shadow-sm hover:shadow-md transition p-3";

    plantCard.innerHTML = `
            <figure class="overflow-hidden rounded-xl">
                <img class="w-full h-48 object-cover" src="${plant.image}" alt="${plant.name}" />
            </figure>
            <div class="card-body px-2 py-4 space-y-3">
                <h2 class="text-lg font-semibold text-gray-800">${plant.name}</h2>
                <p class="text-sm text-gray-600 line-clamp-2">${plant.description}</p>
                <div class="flex justify-between items-center">
                    <span class="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        ${plant.category}
                    </span>
                    <span class="text-gray-900 font-bold">৳${plant.price}</span>
                </div>
                <div class="card-actions mt-2">
                    <button class="btn bg-green-600 hover:bg-green-700 text-white rounded-full w-full text-base font-medium py-2 cartBtn"
                        data-id="${plant.id}" data-name="${plant.name}" data-price="${plant.price}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

    postContainer.appendChild(plantCard);
  }
}

// load plants by category
async function loadPlantsByCategory(categoryId) {
  try {
    let categoryUrl = `https://openapi.programming-hero.com/api/category/${categoryId}`;
    let categoryResponse = await fetch(categoryUrl);
    let categoryData = await categoryResponse.json();
    displayPlants(categoryData.plants);
  } catch (err) {
    console.log("Category plants error:", err);
  } finally {
    hideLoader();
  }
}

// add to cart functionality
postContainer.addEventListener("click", function (event) {
  if (event.target.classList.contains("cartBtn")) {
    let plantId = event.target.getAttribute("data-id");
    let plantName = event.target.getAttribute("data-name");
    let plantPrice = parseInt(event.target.getAttribute("data-price"));

    // check if item exists in cart
    let existingItem = null;
    for (let i = 0; i < myCart.length; i++) {
      if (myCart[i].id === plantId) {
        existingItem = myCart[i];
        break;
      }
    }

    if (existingItem) {
      existingItem.quantity = existingItem.quantity + 1;
    } else {
      let newItem = {
        id: plantId,
        name: plantName,
        price: plantPrice,
        quantity: 1,
      };
      myCart.push(newItem);
    }

    alert(plantName + " added to cart!");
    updateCartUI();
  }
});

// update cart display
function updateCartUI() {
  let cartDiv = document.getElementById("cart-container");
  cartDiv.innerHTML = "";
  let totalAmount = 0;

  for (let item of myCart) {
    totalAmount += item.price * item.quantity;

    let cartItemDiv = document.createElement("div");
    cartItemDiv.className =
      "flex justify-between items-center bg-green-50 px-4 py-2 rounded-lg mb-2 mt-5";

    cartItemDiv.innerHTML = `
            <div>
                <p class="font-semibold text-gray-800">${item.name}</p>
                <p class="text-gray-600 text-sm">৳${item.price} × ${item.quantity}</p>
            </div>
            <button onclick="removeCartItem('${item.id}')"
                class="text-gray-500 hover:text-red-500 text-lg font-bold">
                ✖
            </button>
        `;

    cartDiv.appendChild(cartItemDiv);
  }

  if (myCart.length > 0) {
    let totalDiv = document.createElement("div");
    totalDiv.className =
      "flex justify-between font-bold text-gray-800 mt-4 border-t pt-3";
    totalDiv.innerHTML = `
            <span>Total:</span>
            <span>৳${totalAmount}</span>
        `;
    cartDiv.appendChild(totalDiv);
  } else {
    cartDiv.innerHTML = `<p class="text-gray-500 text-center">Your cart is empty 🛒</p>`;
  }
}

// remove item from cart
function removeCartItem(itemId) {
  let newCart = [];
  for (let item of myCart) {
    if (item.id !== itemId) {
      newCart.push(item);
    }
  }
  myCart = newCart;
  updateCartUI();
}

// show plant details in modal
postContainer.addEventListener("click", function (e) {
  if (e.target.tagName === "H2") {
    let plantCard = e.target.closest(".card");
    let plantImage = plantCard.querySelector("img").src;
    let plantTitle = e.target.textContent;
    let plantCategory = plantCard.querySelector("span").textContent;
    let plantPriceText = plantCard
      .querySelector(".text-gray-900")
      .textContent.replace("৳", "");
    let plantDesc = plantCard.querySelector("p").textContent;

    // fill modal with data
    document.getElementById("modal-title").textContent = plantTitle;
    document.getElementById("modal-image").src = plantImage;
    document.getElementById("modal-category").textContent = plantCategory;
    document.getElementById("modal-price").textContent = plantPriceText;
    document.getElementById("modal-description").textContent = plantDesc;

    // show modal
    document.getElementById("treeModal").checked = true;
  }
});

// initialize app
loadAllPlants();
loadAllCategories();
