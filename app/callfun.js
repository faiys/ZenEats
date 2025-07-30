function orderlisted(orderData, ButtonAction, ItemID, orderCnt, order_ID) {
    const foodListContainer = document.getElementById("food-container");
    const categoryButtonsContainer = document.getElementById("category-buttons");
    const itemSearchSelect = document.getElementById("item-search");

    if (orderData.length === 0) {
        foodListContainer.innerHTML = "<p>No data available.</p>";
        return;
    }

    // categories and item names
    const categoriesSet = new Set();
    const itemNamesSet = new Set();
    orderData.forEach(orderObj => {
        const category = orderObj["Menu_Category"]["display_value"];
        const itemName = orderObj["Item_Name"];
        if (category) categoriesSet.add(category);
        if (itemName) itemNamesSet.add(itemName);
    });

    // Populate category buttons
    let categoryButtonsHTML = `<button class="category-btn active" data-category="All">All</button>`;
    categoriesSet.forEach(cat => {
        categoryButtonsHTML += `<button class="category-btn" data-category="${cat}">${cat}</button>`;
    });
    categoryButtonsContainer.innerHTML = categoryButtonsHTML;

    // Populate item search dropdown
    let itemOptionsHTML = `<option value="All">🔍 Search by item</option>`;
    [...itemNamesSet].sort().forEach(name => {
        itemOptionsHTML += `<option value="${name}">${name}</option>`;
    });
    itemSearchSelect.innerHTML = itemOptionsHTML;

    // Filter by category button click
    categoryButtonsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("category-btn")) {
            const selectedCategory = e.target.dataset.category;

            // Reset search dropdown
            itemSearchSelect.value = "All";

            document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");

            document.querySelectorAll(".food-card").forEach(card => {
                const cardCategory = card.dataset.category;
                card.style.display = (selectedCategory === "All" || cardCategory === selectedCategory) ? "block" : "none";
            });
        }
    });

    // Filter by item name selection
    itemSearchSelect.addEventListener("change", () => {
        const selectedItem = itemSearchSelect.value;

        // Reset category highlight
        document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
        document.querySelector(".category-btn[data-category='All']")?.classList.add("active");

        document.querySelectorAll(".food-card").forEach(card => {
            const itemName = card.querySelector("h3").textContent.trim();
            card.style.display = (selectedItem === "All" || itemName.includes(selectedItem)) ? "block" : "none";
        });
    });

    // Render cards
    let food_cardHtml = "";

    orderData.forEach((orderObj, idx) => {
        const images = orderObj['Item_Image'];
        if (images && Array.isArray(images)) {
            const sliderId = `image-slider-${idx}`;
            const isOrderZero = (orderCnt === "0");
            const isEnabled = isOrderZero || (ItemID === orderObj['ID']);
            const category = orderObj["Menu_Category"]["display_value"];
            const cardClass = `food-card${isEnabled ? "" : " disabled-card"}`;

            let editIconHTML = "";
            if (!isOrderZero && isEnabled) {
                const editURL = `https://creatorapp.zohopublic.com/zentegra/zeneats/Your_Picks/record-edit/Your_Picks_Report/${order_ID}/5yzBJmSVtNJWN0wbsRpDMVtEMr10mXsEAMW3uuFwg9zmbY48BwgP2QX9YXuAqaMW6JQ2NFDvxPqqMdb6MyHAh23jPhKE0g8GmFHk`;
                editIconHTML = `<a href="javascript:void(0);" class="edit-icon" title="Edit" onclick="openEditModal('${editURL}')"><i class="bi bi-pencil-square"></i></a>`;
            }

            let cardHTML = `<div class="${cardClass}" data-category="${category}">
                <div class="image-slider" id="${sliderId}">`;

            images.forEach(() => {
                cardHTML += `<img class="slider-image" src="" alt="Food Image">`;
            });

            cardHTML += `</div>
                <div class="food-info">
                    <h3 class="item-name-with-icon">${orderObj["Item_Name"]} ${editIconHTML}</h3>
                    <p>${category}</p>
                    <button class="btn btn-outline-danger order-btn" onclick="showPopup('${orderObj["Item_Name"]}', '${orderObj["Menu_Category"]["ID"]}', '${orderObj["ID"]}')"  ${ButtonAction === "disabled" ? "disabled" : ""}>Order Now</button>
                </div>
            </div>`;

            food_cardHtml += cardHTML;

            setTimeout(() => {
                startSliderForCard(sliderId, images);
            }, 0);
        }
    });

    foodListContainer.innerHTML = food_cardHtml;
}

// Modal logic
function openEditModal(url) {
    document.getElementById("editIframe").src = url;
    document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
    document.getElementById("editIframe").src = "";
    document.getElementById("editModal").style.display = "none";
}

// Placeholder: your slider init function
function startSliderForCard(sliderId, images) {
    const slider = document.getElementById(sliderId);
    if (slider) {
        const imgs = slider.getElementsByTagName("img");
        for (let i = 0; i < images.length && i < imgs.length; i++) {
            imgs[i].src = images[i];
        }
    }
}
function startSliderForCard(sliderId, imageList) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;

    const images = slider.querySelectorAll(".slider-image");
    if (images.length === 0) return;

    let currentIndex = 0;

    async function setImage(index) {
        const imageData = imageList[index];
        const imageTag = images[index];
        var creator_URL = "";
        const loginuserIEmail = await getLoginUserID();
        if(loginuserIEmail === "nmg214@nmg.cpa"){
            creator_URL = "https://creatorapp.zoho.com";
        }else{
            creator_URL = "https://zeneats.zohocreatorportal.com";
        }
        if (typeof imageData === 'object' && imageData.filename && imageData.url) {
            ZOHO.CREATOR.UTIL.setImageData(imageTag, creator_URL + imageData);
        } else if (typeof imageData === 'string') {
            imageTag.src = creator_URL + imageData;
        }
    }

    function showNextImage() {
        images.forEach(img => img.classList.remove("active"));

        setImage(currentIndex);
        images[currentIndex].classList.add("active");

        currentIndex = (currentIndex + 1) % imageList.length;
    }
    showNextImage(); // show immediately
    setInterval(showNextImage, 3000); // rotate every 3s
}

// Billing Module
// DOM elements
const billingBtn = document.getElementById("billingBtn");
const billingPopup = document.getElementById("billingPopup");
const cartCount = document.getElementById("cartCount");
const summaryItems = document.getElementById("summaryItems");
const billingTableBody = document.getElementById("billingTableBody");
// const grandTotal = document.getElementById("grandTotal");
const billcontainer = document.getElementById("billingContainer");

let orders = []; // dynamically fetched from Creator

// Initialize billing
function billing() {
  fetchRecords(appName, "Your_Picks_Report", "BillingRecords", "null", "null", "null");
}

// Event listeners
billingBtn.addEventListener('click', openBillingPopup);

// Billing popup handlers
function openBillingPopup() {
    billingPopup.style.display = "flex";
    renderBillingPopup();
}

function closeBillingPopup() {
  billingPopup.style.display = "none";
}

function updateCartCount(ordercnt_obj) {
    cartCount.textContent = ordercnt_obj.length;
}

function renderBillingPopup(ordersObj) {
  const itemMap = new Map();
  const countMap = {};

  ordersObj.forEach(item => {
    // Count items
    countMap[item.id] = (countMap[item.id] || 0) + 1;

    // Store unique items by ID
    if (!itemMap.has(item.id)) {
      itemMap.set(item.id, { ...item });
    }
  });

  // Convert Map to array of unique items
  const uniqueItems = Array.from(itemMap.values());

  // Render summary items with counts
  summaryItems.innerHTML = uniqueItems.map(item =>
    `<div class="summary-item">
      <span>${item.name}</span>
      <span class="item-count">${countMap[item.id]}</span>
    </div>`
  ).join("");

  // Render billing table
  billingTableBody.innerHTML = ordersObj.map(item => `
    <tr>
        <td>${item.stafName}</td>
        <td colspan="2">${item.name}</td>
    </tr>
  `).join("");
}




// function billing(){
//     fetchRecords(appName, "Your_Picks_Report", "BillingRecords" , "null", "null", "null");
// }



// // Order data
// let orders = [];

// // DOM elements
// const billingBtn = document.getElementById('billingBtn');
// const billingPopup = document.getElementById('billingPopup');
// const cartCount = document.getElementById('cartCount');
// const summaryItems = document.getElementById('summaryItems');
// const billingTableBody = document.getElementById('billingTableBody');
// const grandTotal = document.getElementById('grandTotal');

// // Sample data - in a real app this would come from user actions
// const sampleOrders = [
//     { id: 1, name: "Chilli Burger", price: 9.99, quantity: 2 },
//     { id: 2, name: "Egg Sandwich", price: 7.99, quantity: 1 },
//     { id: 4, name: "Pepperoni Pizza", price: 14.99, quantity: 1 },
//     { id: 1, name: "Chilli Burger", price: 9.99, quantity: 1 } // Duplicate to test grouping
// ];

// // Initialize with sample data
// orders = [...sampleOrders];
// updateCartCount();

// // Event listeners
// billingBtn.addEventListener('click', openBillingPopup);

// // Functions
// function openBillingPopup() {
//     renderBillingPopup();
//     billingPopup.style.display = 'flex';
// }

// function closeBillingPopup() {
//     billingPopup.style.display = 'none';
// }

// function updateCartCount() {
//     const totalItems = orders.reduce((sum, item) => sum + item.quantity, 0);
//     cartCount.textContent = totalItems;
// }

// function renderBillingPopup() {
//     // Group items by ID to get unique items with total quantities
//     const itemMap = new Map();
    
//     orders.forEach(item => {
//         if (itemMap.has(item.id)) {
//             const existing = itemMap.get(item.id);
//             existing.quantity += item.quantity;
//             existing.total = existing.price * existing.quantity;
//         } else {
//             itemMap.set(item.id, {
//                 ...item,
//                 total: item.price * item.quantity
//             });
//         }
//     });
    
//     const uniqueItems = Array.from(itemMap.values());
    
//     // Render summary items
//     summaryItems.innerHTML = uniqueItems.map(item => `
//         <div class="summary-item">
//             <span>${item.name}</span>
//             <span class="item-count">${item.quantity}</span>
//         </div>
//     `).join('');
    
//     // Render billing table
//     billingTableBody.innerHTML = uniqueItems.map(item => `
//         <tr>
//             <td>${item.name}</td>
//             <td>$${item.price.toFixed(2)}</td>
//             <td>${item.quantity}</td>
//             <td>$${item.total.toFixed(2)}</td>
//         </tr>
//     `).join('');
    
//     // Calculate and render grand total
//     const total = uniqueItems.reduce((sum, item) => sum + item.total, 0);
//     grandTotal.textContent = `$${total.toFixed(2)}`;
// }

// function generatePDF() {
//     // In a real app, this would generate and download a PDF
//     alert("PDF generation would happen here in a real implementation");
//     // You would typically use a library like jsPDF or a server-side solution
// }