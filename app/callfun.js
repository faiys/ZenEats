function orderlisted(orderData, ButtonAction, ItemID, orderCnt, order_ID) {
    console.log(ItemID+ " ItemID");
    const food_list_card = document.getElementById("food-container");
    if (orderData.length === 0) {
        food_list_card.innerHTML = "<p>No data available.</p>";
        return;
    }

    let food_cardHtml = "";

    orderData.forEach((orderObj, idx) => {
        const images = orderObj['Item_Image'];
        if (images && Array.isArray(images)) {
            const sliderId = `image-slider-${idx}`;
            const isOrderZero = (orderCnt === "0");
            const isEnabled = isOrderZero || (ItemID === orderObj['ID']);
            const cardClass = `food-card${isEnabled ? "" : " disabled-card"}`;

            let editIconHTML = "";
            if (!isOrderZero && isEnabled) {
                buttonText = "Edit";
                const editURL = `https://creatorapp.zohopublic.com/32demo1zentegra/zeneats/Your_Picks/record-edit/Your_Picks_Report/${order_ID}/DGRmu7Osk9usPKxUOHXhy4CmOHeyGZ2VMrCn0sWzGupQOxeM7U4CrD90WOp6PvCj8pJz8Adue2vxDWpqn4wuqHdvC430CX9ACzJ4`
                editIconHTML = `<a href="javascript:void(0);" class="edit-icon" title="Edit" onclick="openEditModal('${editURL}')"><i class="bi bi-pencil-square"></i></a>`;
            }
            let cardHTML = `<div class="${cardClass}"><div class="image-slider" id="${sliderId}">`;


            images.forEach(() => {
                cardHTML += `<img class="slider-image" src="" alt="Food Image">`;
            });

            cardHTML += `</div><div class="food-info">
            <h3 class="item-name-with-icon">${orderObj["Item_Name"]}  ${editIconHTML}</h3>
            <p>${orderObj["Menu_Category"]["display_value"]}</p>`;
            cardHTML += `<button class="btn btn-outline-danger order-btn" onclick="showPopup('${orderObj["Item_Name"]}', '${orderObj["Menu_Category"]["ID"]}', '${orderObj["ID"]}')" ${ButtonAction === "disabled" ? "disabled" : ""}>Order Now</button>`;
            cardHTML +=`</div></div>`;
            food_cardHtml += cardHTML;

            // Call individual slider setup after DOM is created
            setTimeout(() => {
                startSliderForCard(sliderId, images);
            }, 0);
        }
    });

    food_list_card.innerHTML = food_cardHtml;
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

    function setImage(index) {
        const imageData = imageList[index];
        const imageTag = images[index];

        if (typeof imageData === 'object' && imageData.filename && imageData.url) {
            ZOHO.CREATOR.UTIL.setImageData(imageTag, "https://creatorapp.zoho.com" + imageData);
        } else if (typeof imageData === 'string') {
            imageTag.src = "https://creatorapp.zoho.com" + imageData;
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

