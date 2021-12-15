// https://ga-dev-tools.web.app/campaign-url-builder/
/**
 * TODO: Add 'Content' field --> (not required)
 * TODO: Confirm what fields we definitely need and don't need with Marketing
 * TODO: If generated link isn't changed, don't add to GoogleSheet
 * TODO: Package into Chrome extension 
 * TODO: Sign out --> resets form 
 * TODO: Add modal to confirm url is correct before writing to Google Sheet
 * TODO: Handle Date();
 */

 // removed secrets

 const authorizeButton = document.getElementById('authorize_button');
 const signoutButton = document.getElementById('signout_button');
 const formField = document.getElementById("form_container");
 const urlField = document.getElementById("generated_url-container");

 // Google Sign-In

 function handleClientLoad() {
    gapi.load('client:auth2', initClient);
    
  }

  function initClient() {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
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
      authorizeButton.style.display = 'none';
      signoutButton.style.display = 'block';
      formField.style.display = "block";
      urlField.style.display = "block";
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
    formField.style.display = "none";
    urlField.style.display = "none";
  }


  //Form Field functions

const getFormData = (event) => {
    event.preventDefault();
    const url = document.getElementById("base_url").value;
    const source = document.getElementById("source").value;
    const searchTerm = document.getElementById("search_term").value;
    const medium = document.getElementById("medium").value;
    const campaign = document.getElementById("campaign_name").value;
    const promoType = document.getElementById("promotion_type")
    .options[document.getElementById('promotion_type').selectedIndex].text;
    const purpose = document.getElementById('purpose').value;
    
    const formData = {
        url, 
        source, 
        searchTerm,
        medium, 
        campaign, 
        promoType, 
        purpose
    }

    handleFormData(formData);
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
    const purpose = f.purpose

    if(termParam === null && promoParam === null) {
        let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam;
        const sheetData = {url: urlString, purpose: purpose}
        exportData(sheetData);
        return generateUrl(urlString);
    }

    if(termParam === null) {
        let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam + '&' + promoParam;
        const sheetData = {url: urlString, purpose: purpose}
        exportData(sheetData);
        return generateUrl(urlString); 
    }
    
    if(promoParam === null) {
        let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam + '&' + termParam;
        const sheetData = {url: urlString, purpose: purpose}
        exportData(sheetData);
        return generateUrl(urlString); 
    }

    let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam + '&' + termParam + '&' + promoParam;
    const sheetData = {url: urlString, purpose: purpose}
    exportData(sheetData);
    generateUrl(urlString);
} 

///// Form Field Data /////

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
  const words = s.split(' ');
  for (let i = 0; i < words.length; i++) {
     words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }
  const addCaps = words.join(" ");
    const formatData = addCaps.replace(/ /g, "_");
    const parameter =  'utm_source=' + formatData;
    return parameter;
}

const handleMedium = (m) => {
  const words = m.split(' ');
  for (let i = 0; i < words.length; i++) {
     words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }
  const addCaps = words.join(" ");
    const formatData = addCaps.replace(/ /g, "_");
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

///// Export to Google Sheets /////

const exportData = async (data) => {
  // TODO: Handle Date() to locale time
  const currentUser = gapi.auth2.getAuthInstance().currentUser.get();
  const name = currentUser.getBasicProfile().getName();
  const email = currentUser.getBasicProfile().getEmail();
  const purpose = data.purpose;
  const url = data.url;
  const date = "123";


  const rows = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1qNGvs-V-EOgpuWprdABIGRaZASLihNc0GKX6kVZmBIU',
    range: 'UTM Link Tracking Sheet!A1:E50',
  }).then(function(response) {
    return response.result;
  });
  
  const rowArray = rows.values.filter(row => row.length === 5);
  const currentIndex = rowArray.length;
  const range = currentIndex + 1;
  console.log(range);
  
  let values = [
    [
      name,
      email,
      date,
      purpose,
      url
    ]
  ];
  const body = {values: values};

  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: '1qNGvs-V-EOgpuWprdABIGRaZASLihNc0GKX6kVZmBIU',
    range: `UTM Link Tracking Sheet!A${range}:E${range}`,
    valueInputOption: 'RAW',
    resource: body
  }).then(function(response) {
    console.log(response)
  })
}

///// Button Functions /////

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
