// https://ga-dev-tools.web.app/campaign-url-builder/
/**
 * TODO: Package into Chrome extension 
 * 
 * TODO: Handle space after entry in Term field
 * TODO: get rid of modal, only enable 'copy' after the url is written to Sheet
 *  > Stretch goal: Add modal "buttons" to generated URL field before exporting;
 *  > Strech goal: Add URL state to see real-time updates to URL
 * TODO: Some kind of confirmation animation so they know url is generated 
 * 
 * TODO: Remove Modal and refactor handling submission
 * TODO: Handle submitting with "Choose Promo Type" or "Choose Medium"
 */

 const authorizeButton = document.getElementById('authorize_button');
 const signoutButton = document.getElementById('signout_button');
 const formField = document.getElementById("form_container");
 const urlField = document.getElementById("generated_url-container");
 const exportButton = document.getElementById("export_utm_button");
 const editUTMButton = document.getElementById("edit_utm_button");
 const modalContainer = document.getElementById('modal_container');
 const sourceError = document.getElementById('source_error');
 const promoError = document.getElementById("promotion_type_error");
 const urlError = document.getElementById("url_error");
 const profileInfo = document.getElementById("profile_container");

 /**
  * Google Sign-In
  */

 const handleClientLoad = () => {
    gapi.load('client:auth2', initClient);
  }

  const initClient = async () => {
    const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
    const credentials = await fetch(`/googleauth`).then((res) => res.json());

    gapi.client.init({
      apiKey: credentials.API_KEY,
      clientId: credentials.CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: credentials.SCOPES
    }).then(function () {
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    }, function(error) {
       console.log(error)
    });
  }

  function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      profileInfo.style.display = "inline-flex";
      authorizeButton.style.display = 'none';
      signoutButton.style.display = 'block';
      formField.style.display = "block";
      urlField.style.display = "block";
      getUser();
    } else {
      authorizeButton.style.display = 'block';
      signoutButton.style.display = 'none';
    }
  }

  function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
    resetForm();
    const urlString = document.getElementById("url-string");
    if(urlString.hasChildNodes) {
        urlString.innerHTML = "";
    }
    formField.style.display = "none";
    urlField.style.display = "none";
    profileInfo.style.display = "none";
  }

  const getUser = async () => {
    const currentUser = await gapi.auth2.getAuthInstance().currentUser.get();
    const name = currentUser.getBasicProfile().getName();
    const imageUrl = currentUser.getBasicProfile().getImageUrl();
    document.getElementById("profile_image_container").style.backgroundImage =`url(${imageUrl})`;
    document.getElementById("profile_name").innerHTML = `${name}`;
  }


  // DROPDOWN LIST FUNCTIONS // 
  
  const handlePromotionType = () => {
    const promoType = document.getElementById("promotion_type").value;

    if (promoType === "choose_type") {
      document.getElementById("medium_input").setAttribute("disabled", "disabled");
      return
    }
    document.getElementById("medium_input").removeAttribute("disabled");
    promoError.style.display = "none";
    return promoType;
    
  }

  // AUTOCOMPLETE //
  async function autocomplete(inp) {
    const fields = await fetch(`/fields_data`).then((res) => res.json());
    let arr;
    if (inp.id === "source_input") {
      arr = Object.values(fields.source);
    }

    const promoType = handlePromotionType();
    
    if (inp.id === "medium_input" && promoType != "Choose Type") {
      document.getElementById("medium_input").disabled = false;
      arr = Object.values(fields[promoType]);
    }

    let currentFocus;

    inp.addEventListener("input", function(e) {
      let a, b, i, val = this.value;

      closeAllLists()
      if (!val) { return false;}
      currentFocus = -1;
      
      a = document.createElement("div");
      a.setAttribute("id", "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(a);
      
      for (i = 0; i < arr.length; i++) {
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          b = document.createElement("div");
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          b.addEventListener("click", function(e) {
            inp.value = this.getElementsByTagName("input")[0].value;
            closeAllLists();
        });
        a.appendChild(b);
        }
      }
    });

    // Other autocomplete functions here // 
    inp.addEventListener("keydown", function(e) {
      let x = document.getElementById("autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });

    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }

    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      let x = document.getElementsByClassName("autocomplete-items");
      for (let i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }

  // Retrieves source or medium input id
  const getInput = (input) => {
    autocomplete(document.getElementById(input.id));
  }

  /**
   * Form Field functions 
   */

const getFormData = (event) => {
    event.preventDefault();
    const url = document.getElementById("base_url").value;
    const source = document.getElementById("source_input").value;
    const searchTerm = document.getElementById("search_term").value;
    const medium = document.getElementById("medium_input").value;
    const campaign = document.getElementById("campaign_name").value;
    const promoType = document.getElementById("promotion_type")
    .options[document.getElementById('promotion_type').selectedIndex].text;
    const purpose = document.getElementById('purpose').value;

    if (source === "Choose Source") {
      sourceError.style.display = "block";
      return;
    }

    sourceError.style.display = "none";

    // if (medium === "Choose Medium") {
    //   mediumError.style.display = "block";
    //   return;
    // }

    // mediumError.style.display = "none";

    if (url.includes(" ") || url.includes(",")) {
      urlError.style.display = "block";
      return;
    }

    const formData = {
        url, 
        source, 
        searchTerm,
        medium, 
        campaign, 
        promoType, 
        purpose
    }
    console.log(formData);
    // handleFormData(formData);
}

const form = document.getElementById("utm_form");
form.addEventListener("submit", getFormData);

const handleFormData = (f) => {
    const baseUrl = getTLS(f.url);
    const promoParam = handlePromo(f.promoType);
    const sourceParam = handleSource(f.source);
    const campaignParam = handleCampaign(f.campaign);
    const mediumParam = handleMedium(f.medium);
    const termParam = handleTerm(f.searchTerm);
    const purpose = f.purpose;

    if(termParam === null && promoParam === null) {
        let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam;
        const sheetData = {url: urlString, purpose: purpose};
        triggerModal(urlString, sheetData);
        return generateUrl(urlString);
    }

    if(termParam === null) {
        let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam + '&' + promoParam;
        const sheetData = {url: urlString, purpose: purpose};
        triggerModal(urlString, sheetData);
        return generateUrl(urlString); 
    }
    
    if(promoParam === null) {
        let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam + '&' + termParam;
        const sheetData = {url: urlString, purpose: purpose};
        triggerModal(urlString, sheetData);
        return generateUrl(urlString); 
    }

    let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam + '&' + termParam + '&' + promoParam;
    const sheetData = {url: urlString, purpose: purpose};
    triggerModal(urlString, sheetData)
    generateUrl(urlString);
} 

const triggerModal = (url, sheetData) => {
  modalContainer.style.display = "block";

  exportButton.onclick = () => {
    exportData(sheetData);
    modalContainer.style.display = "none";
    resetForm();
  }

  editUTMButton.onclick = () => {
    modalContainer.style.display = "none";
  }

  if (url === "https://") {
        return;
    }

    const p = document.getElementById("modal_content-textarea");

    if (p.childNodes.length > 0) {
        p.innerHTML = "";
        const text = document.createTextNode(url);
        p.appendChild(text);
        return;
    } 
    const text = document.createTextNode(url);
    p.appendChild(text);   
}

const resetForm = () => {
  document.getElementById('utm_form').reset();
}

/**
 * Form Field Data
 */

const getTLS = (url) => {
    const tls = 'https://';
    if(!url.includes(tls)) {
        const tlsUrl = tls + url;
        return tlsUrl;
        }
    return url;
}

const handlePromo = (promo) => {
    if(promo === "Choose Promotion Type") {
        return null;
    }
    const formatData = promo.replace(/ /g, "_");
    const parameter =  'utm_promotion=' + formatData
    return parameter;
}

const handleCampaign = (c) => {
  const words = c.split(' ');
  for (let i = 0; i < words.length; i++) {
     words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }
  const addCaps = words.join(" ");
    const formatData = addCaps.replace(/ /g, "_");
    const parameter =  'utm_campaign=' + formatData;
    return parameter;
}

const handleSource = (s) => { 
    const formatData = s.replace(/ /g, "_");
    const parameter =  'utm_source=' + formatData;
    return parameter;
}

const handleMedium = (m) => {
    const formatData = m.replace(/ /g, "_");
    const parameter =  'utm_medium=' + formatData;
    return parameter;
}

const handleTerm = (t) => {
    if(t === "") {
        return null;
    }
    const words = t.split(' ');
  for (let i = 0; i < words.length; i++) {
     words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }
  const addCaps = words.join(" ");
    const formatData = addCaps.replace(/ /g, "_");
    const parameter =  'utm_term=' + formatData
    return parameter;
}

/** 
 * Export to Google Sheets
*/

const exportData = async (data) => {
  const currentUser = gapi.auth2.getAuthInstance().currentUser.get();
  const name = currentUser.getBasicProfile().getName();
  const email = currentUser.getBasicProfile().getEmail();
  const purpose = data.purpose;
  const url = data.url;
  const getDate = new Date();
  const date = getDate.toLocaleDateString();

  let values = [
    [
      name,
      email,
      date,
      purpose,
      url
    ]
  ];

  const params = {
    spreadsheetId: '1qNGvs-V-EOgpuWprdABIGRaZASLihNc0GKX6kVZmBIU',
    range: `UTM Link Tracking Sheet!A2:E2`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
  };

  const valueRangeBody = {
    "majorDimension": "ROWS",
    'values': values
  }

  let request = gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody);
  request.then(function(res) {
      console.log(res.result);
    }, function(reason) {
      console.error('error: ', + reason.result.error.message);
  })
}

/**
 * Button Functions
 */

const generateUrl = (url) => {
    if (url === "https://") {
        return;
    }

    const p = document.getElementById("url-string");

    if (p.childNodes.length > 0) {
        p.innerHTML = "";
        const text = document.createTextNode(url);
        p.appendChild(text);
        return;
    } 
    const text = document.createTextNode(url);
    p.appendChild(text);   
}

const copyURL = () => {
    const copyText = document.getElementById("url-string");
    copyText.select();
    document.execCommand('copy');
    alert("Copied the text: " + copyText.value);
}

const clearField = () => {
    const urlString = document.getElementById("url-string");
    if(urlString.hasChildNodes) {
        urlString.innerHTML = "";
    }
}