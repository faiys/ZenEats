const appName = "zeneats";
// Onload first run
window.onload = fetchData();
document.addEventListener("DOMContentLoaded", () => {
  getStaffId_CheckOrderCount().then((before_order_cnt) => {
    console.log("Order count:", before_order_cnt);
    let disabledCards = (before_order_cnt[0] === "0") ? "Store" : "disabled";
    let ItemID = (before_order_cnt[2] != "null") ? before_order_cnt[2] : "";
    let Order_ItemID = (before_order_cnt[3] != "null") ? before_order_cnt[3] : "";
    if(before_order_cnt[0] !== "0"){
      document.getElementById("headingID").innerHTML = "Thanks! Your order is confirmed."
    }
    console.log(disabledCards)
    fetchRecords(appName, "All_Menu_Items", disabledCards , ItemID, before_order_cnt[0], Order_ItemID);
  });
});

//Get Email ID
function getLoginUserID() {
  return ZOHO.CREATOR.init().then(() => {
    const initParams_login = ZOHO.CREATOR.UTIL.getInitParams();
    if (initParams_login && initParams_login.loginUser) {
      return initParams_login.loginUser;
    } else {
      return "loginuserid not passed in initParams";
    }
  });
}

async function fetchRecords(appname, reportname, type, ItemID, orderCnt, order_ID ) {
  try {
    await ZOHO.CREATOR.init();
    // Get Records API
    if(reportname == "All_Menu_Items" && type == "Store")
    {
     var filter_vars = "(Status==\"Active\")";
    }
    if(reportname == "Your_Picks_Report" && type == "BillingRecords")
    {
      var filter_vars = `(Date_Str == "${getCurrentDateDDMMYYYY()}")`;
    }
    const config = {
      appName: appname,
      reportName: reportname,
      criteria: filter_vars
    };
    try{
      const response = await ZOHO.CREATOR.API.getAllRecords(config);
      const data = response.data;
      if(reportname == "All_Menu_Items" && type == "Store")
      {
        orderlisted(data, type, ItemID, orderCnt, order_ID)
      }
      if(reportname == "All_Menu_Items" && type == "disabled")
      {
        orderlisted(data, type, ItemID, orderCnt, order_ID)
      }
      const loginuserID = await getLoginUserID();
      const billcontainer = document.getElementById("billingContainer");
      if(loginuserID === "nmg214@nmg.cpa" || loginuserID === "faiyas@zentegra.com" || loginuserID === "bhagyaraj@zentegra.com" || loginuserID === "sanket@zentegra.com"){
        if(reportname == "Your_Picks_Report" && type == "BillingRecords")
        {
           orders = data.map(item => ({
              id: item.Menu_Item.ID,
              name: item.Menu_Item.display_value,
              recordID : item.ID,
              stafName : item.Staff.display_value
            }));
            renderBillingPopup(orders);
            updateCartCount(orders);
        }
      }else{
        billcontainer.innerHTML = ""; 
        billcontainer.style.display = "block"; 
      }
      return data
    }
    catch (err) {
      console.log("Store - "+err)
    if (err && err.responseText) {
      try {
        const parsed = JSON.parse(err.responseText);
        
        if (parsed.code != 3000) {
          console.warn("No records in Store Report found for criteria");
        }
        } catch (e) {
          console.error("Error parsing responseText", e);
        }
      }
      console.error("Unexpected error in getAllRecords:", err);
    }
  } catch (error) {
    console.error("Error initializing or fetching:", error);
    return error
  }
}   
async function getStaffId_CheckOrderCount() {
  try {
    const loginuserID = await getLoginUserID();
    console.log("User ID from other function:", loginuserID);

    const Staffconfig = {
      appName: appName,
      reportName: "All_Staffs",
      criteria: `(Email == "${loginuserID}")`
    };
    console.log(Staffconfig);
    const Staff_response = await ZOHO.CREATOR.API.getAllRecords(Staffconfig);
    console.log(Staff_response);
    const Staffdata = Staff_response.data;
    if (Staffdata && Staffdata.length > 0) {
      const stafff_ID = Staffdata[0]["ID"];
      console.log("Staff ID:", stafff_ID);
      var orderReport = "";
        if(Staffdata[0]["Email"] === "nmg214@nmg.cpa"){
            orderReport = "Your_Picks_Report";
        }else{
            orderReport = "My_Orders";
        }
        const criteria = `(Staff.ID == ${stafff_ID} && Date_Str == "${getCurrentDateDDMMYYYY()}")`;
          const cnt_Fetchconfig = {
            appName: appName,
            reportName: orderReport,
            criteria: criteria
          };
          console.log("get pick - "+ cnt_Fetchconfig)
          try {
            const Order_cnt_response = await ZOHO.CREATOR.API.getAllRecords(cnt_Fetchconfig);
            console.log(Order_cnt_response)
            if (Order_cnt_response && Order_cnt_response.code === 3000) {
              console.log(Order_cnt_response)
              var order_count = Order_cnt_response.data.length;
              const item_ID = Order_cnt_response.data[0].Menu_Item.ID;
              const ord_id = Order_cnt_response.data[0].ID;
              return [order_count.toString(),stafff_ID, item_ID, ord_id]; 
            }
            else{
              return ["0",stafff_ID, "null","null"]; 
            }
          }
          catch (err) {
          if (err && err.responseText) {
            try {
              const parsed = JSON.parse(err.responseText);
              if (parsed.code != 3000) {
                console.warn("No records found for criteria");
                return ["0", stafff_ID, "null","null"];
              }
              } catch (e) {
                console.error("Error parsing responseText", e);
                return ["0", stafff_ID, "null","null"];
              }
            }
          console.error("Unexpected error in getAllRecords:", err);
          return ["0", stafff_ID, "null","null"];
        }
    }
    return ["0","null", "null","null"]; 
  } catch (err) {
    console.error("Error in getStaffId_CheckOrderCount:", err);
    return ["0","null", "null","null"]; 
  }
}

// POST API
async function Post_manuAPi(appName, ReportName, currentItemID, currentCatID){
    await ZOHO.CREATOR.init();
    const before_order_cnt = await getStaffId_CheckOrderCount();
    console.log("before_order_cnt =" + before_order_cnt)
    if(before_order_cnt[0] == "0"){
    try{
        // POST API
        var JsonFields ={
          "data" : {
              "Staff" : before_order_cnt[1],
              "Menu_Category" : currentCatID,
              "Menu_Item": currentItemID,
              "Date_Str" : getCurrentDateDDMMYYYY(),
              "Date_field" : getCurrentDateDDMMYYYY()
            }
          }
          const Postconfig = {
            appName : appName,
            formName : ReportName,
            data : JsonFields
          }
          ZOHO.CREATOR.API.addRecord(Postconfig).then(function(response){
            console.log(response)
          if(response.code == 3000){
            console.log("Record added successfully");
            var orders_id = response.data.ID;
            console.log("create orders_id = "+orders_id)
            document.getElementById("confirmed-popup").style.display = "flex";
            document.getElementById("headingID").innerHTML = "Thanks! Your order is confirmed."
            // Disable button
            getStaffId_CheckOrderCount().then((before_order_cnt) => {
              console.log("Order count:", before_order_cnt);
              let disabledCards = (before_order_cnt[0] === "0") ? "Store" : "disabled";
              console.log(disabledCards)
              fetchRecords(appName, "All_Menu_Items", disabledCards, currentItemID ,before_order_cnt[0], orders_id);
            });
          }
          else{
            // 
          }
        });
      }
      catch(err){
        console.log("Post Order = "+err)
      }  
    }  
    else{
      document.getElementById("headingID").innerHTML = "Thanks! Your order is confirmed."
      getStaffId_CheckOrderCount().then((before_order_cnt) => {
        console.log("Order count:", before_order_cnt);
        let disabledCards = (before_order_cnt[0] === "0") ? "Store" : "disabled";
        console.log(disabledCards)
        fetchRecords(appName, "All_Menu_Items", disabledCards,currentItemID ,before_order_cnt[0],"null");
      });
    }
}





// Page Js
let currentCatID = "";
let currentItemID = "";
// Show popup with item name and store IDs
function showPopup(itemName, catID, itemID) {
    currentCatID = catID;
    currentItemID = itemID;
    document.getElementById("item-name").innerText = itemName;
    document.getElementById("popup").style.display = "flex";
}

// Called when user confirms
function confirmOrder() {
    document.getElementById("popup").style.display = "none";
    console.log("cat_ID =", currentCatID);
    console.log("Item_ID =", currentItemID);
    // POST API
    Post_manuAPi(appName, "Your_Picks", currentItemID, currentCatID)
}

// Close popups
function closePopup() {
    document.getElementById("popup").style.display = "none";
}
function redirectToItem() {
    document.getElementById('confirmed-popup').style.display = 'none';
}

// Bind confirm button click (only once)
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("confirm-btn").addEventListener("click", confirmOrder);
});

// Initialize sliders when page loads
window.onload = function() {
    startRandomSlider();
};

//Date formate
function getCurrentDateDDMMYYYY() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  // const month = String(today.getMonth() + 1).padStart(2, '0'); // this showing 07
  const month = today.toLocaleString('default', { month: 'short' });
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
}
// Loader
function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}
function fetchData() {
  showLoader();

  // Simulate an async operation (e.g., API call)
  setTimeout(() => {
    console.log("Data loaded.");
    hideLoader();
  }, 2000);
}
