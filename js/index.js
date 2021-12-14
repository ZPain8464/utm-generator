// https://ga-dev-tools.web.app/campaign-url-builder/
/**
 * TODO: Handle export data function
 *
 * TODO: Add 'Content' field --> (not required)
 * TODO: Confirm what fields we definitely need and don't need with Marketing
 */

// Removed secrets for now

 const authorizeButton = document.getElementById('authorize_button');
 const signoutButton = document.getElementById('signout_button');
 const formField = document.getElementById("form_container");
 const urlField = document.getElementById("generated_url-container");
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
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    }, function(error) {
      appendPre(JSON.stringify(error, null, 2));
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

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
    formField.style.display = "none";
    urlField.style.display = "none";
  }

  function listMajors() {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      range: 'Class Data!A2:E',
    }).then(function(response) {
      var range = response.result;
      if (range.values.length > 0) {
        appendPre('Name, Major:');
        for (i = 0; i < range.values.length; i++) {
          var row = range.values[i];
          // Print columns A and E, which correspond to indices 0 and 4.
          appendPre(row[0] + ', ' + row[4]);
        }
      } else {
        appendPre('No data found.');
      }
    }, function(response) {
      appendPre('Error: ' + response.result.error.message);
    });
  }

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
        const formattedUrl = urlString
        const sheetData = {url: formattedUrl, purpose: purpose}
        exportData(sheetData);
        return generateUrl(formattedUrl);
    }

    if(termParam === null) {
        let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam + '&' + promoParam;
        const formattedUrl = urlString
        const sheetData = {url: formattedUrl, purpose: purpose}
        exportData(sheetData);
        return generateUrl(formattedUrl); 
    }
    
    if(promoParam === null) {
        let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam + '&' + termParam;
        const formattedUrl = urlString
        const sheetData = {url: formattedUrl, purpose: purpose}
        exportData(sheetData);
        return generateUrl(formattedUrl); 
    }

    let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam + '&' + termParam + '&' + promoParam;
    const formattedUrl = urlString
    const sheetData = {url: formattedUrl, purpose: purpose}
    exportData(sheetData);
    generateUrl(formattedUrl);
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
const exportData = (data) => {
  //TODO: Handle Date();
  const currentUser = gapi.auth2.getAuthInstance().currentUser.get();
  const fullName = currentUser.getBasicProfile().getName();
  const email = currentUser.getBasicProfile().getEmail();

  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1qNGvs-V-EOgpuWprdABIGRaZASLihNc0GKX6kVZmBIU',
    range: 'UTM Link Tracking Sheet!A1:A2',
  }).then(function(response) {
    console.log(response.range);
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
