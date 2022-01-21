/**
 * Onload login with Google OAuth2.0
 */

window.onload = function() {
  
  const authorizeButton = document.getElementById('authorize_button');
  const signoutButton = document.getElementById('signout_button');
  const formField = document.getElementById("form_container");
  const urlField = document.getElementById("generated_url-container");
  const exportButton = document.getElementById("export_utm_button");
  const editUTMButton = document.getElementById("edit_utm_button");
  const sourceError = document.getElementById('source_error');
  const promoError = document.getElementById("promotion_type_error");
  const urlError = document.getElementById("url_error");
  const profileInfo = document.getElementById("profile_container");
  document.getElementById("promotion_type").setAttribute("disabled", "disabled");

  document.getElementById('authorize_button').addEventListener('click', async function() {    
    chrome.identity.getAuthToken({interactive: true}, function(token) {
      localStorage.setItem("token", token);
      fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`)
      .then((res) => res.json())
      .then((profileData) => {
        document.getElementById('authorize_button').style.display = "none";
        document.getElementById("form_container").style.display = "block";
        document.getElementById("generated_url-container").style.display = "block";
        getUser(profileData);
      })
    });
  });

  const getUser = async (pd) => {
    const email = pd.email;
    const name = pd.name;
    const imageUrl = pd.picture
    document.getElementById("profile_image_container").style.backgroundImage =`url(${imageUrl})`;
    document.getElementById("profile_name").innerHTML = `${name}`;

    localStorage.setItem("email", email);
    localStorage.setItem("name", name);
  }

  function handlePromoType() {
    
    let promoType = document.getElementById("promotion_type").value;
    console.log(promoType);
    if (promoType.innerHTML === "choose_type") {
      
      document.getElementById("medium_input").setAttribute("disabled", "disabled");
      return promoType;
    }
    document.getElementById("medium_input").removeAttribute("disabled");
    promoError.style.display = "none";
    
    return promoType;
  }
  document.getElementById("promotion_type").addEventListener("change", handlePromoType);

  // AUTOCOMPLETE //
  async function autocomplete(inp) {
    const fields = await fetch(`http://localhost:3000/fields_data`).then((res) => res.json());
    let arr;

    // Based on input, filter source and medium selection from API call
    if (inp.id === "source_input") {
      const values =  Object.values(fields.source);
      let removeUnderscores = values.map(v => {
        return v.replace(/_/g, " ");
      });
      arr = removeUnderscores;
    }

    document.getElementById("promotion_type").removeAttribute("disabled");
    let promoType = document.getElementById("promotion_type").value;
    
    if (inp.id === "medium_input" && promoType != "choose_type") {
      const values =  Object.values(fields[promoType]);
      let removeUnderscores = values.map(v => {
        return v.replace(/_/g, " ");
      });
      arr = removeUnderscores;
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

    inp.addEventListener("keydown", function(e) {
      let x = document.getElementById("autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        currentFocus++;
        addActive(x);
      } else if (e.keyCode == 38) { 
        currentFocus--;
        addActive(x);
      } else if (e.keyCode == 13) {
        e.preventDefault();
        if (currentFocus > -1) {
          if (x) x[currentFocus].click();
        }
      }
  });

    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }

    function closeAllLists(elmnt) {
      let x = document.getElementsByClassName("autocomplete-items");
      for (let i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }

  // Retrieves source or medium input id
  document.getElementById("source_input").addEventListener("focus", () => {
    autocomplete(document.getElementById("source_input"));
  });
  document.getElementById("medium_input").addEventListener("focus", () => {
    autocomplete(document.getElementById("medium_input"));
  });

  /**
   * Form Field functions 
   */

const getFormData = (event) => {
  console.log("getformdata ran")
    event.preventDefault();
    const url = document.getElementById("base_url").value;
    const source = document.getElementById("source_input").value;
    const searchTerm = document.getElementById("search_term").value;
    const medium = document.getElementById("medium_input").value;
    const campaign = document.getElementById("campaign_name").value;
    const purpose = document.getElementById('purpose').value;

    /**
     * Check if base url is valid 
     */
    if (url.includes(" ") || url.includes(",")) {
      urlError.innerHTML = "URL can't contain spaces or commas.";
      urlError.style.display = "block";
      return false;
    }
  
    if(!url.includes("://")) {
      urlError.innerHTML = "URL must contain http:// or https://";
      urlError.style.display = "block";
      return false;
    }
    
    const formData = {
        url, 
        source, 
        searchTerm,
        medium, 
        campaign,  
        purpose
    }
    handleFormData(formData);
}

const form = document.getElementById("utm_form");
form.addEventListener("submit", getFormData);

const handleFormData = (f) => {
    const baseUrl = f.url;
    const purpose = f.purpose;
    const params = formatParams(f); 
   console.log(baseUrl);
    if(!params.hasOwnProperty("searchTerm")) {
        let urlString = baseUrl + '?' + 'utm_source=' + params.source + '&' + 'utm_campaign=' + params.campaign + '&' + 'utm_medium=' + params.medium;
        const sheetData = {url: urlString, purpose: purpose};
        exportData(sheetData);
        return generateUrl(urlString);
    }

    let urlString = baseUrl + '?' + 'utm_source=' + params.source + '&' + 'utm_campaign=' + params.campaign + '&' + 'utm_medium=' + params.medium + '&' + 'utm_term=' + params.searchTerm;
    const sheetData = {url: urlString, purpose: purpose};
    exportData(sheetData);
    return generateUrl(urlString);
} 

const resetForm = () => {
  document.getElementById('utm_form').reset();
}

/**
 * Form Field Data
 */

const formatParams = (f) => {
  console.log(f);
  let params = [];
  delete f.purpose;
  delete f.url;
  if (f.searchTerm === "") {
    delete f.searchTerm;
    let {source, medium, campaign} = f;
    params.push(source, medium, campaign);
    let paramKeys = Object.keys(f);

    // Capitalize parameters
    let capitalizedParams = params.map(p => {
    const words = p.split(' ');
    for (let i = 0; i < words.length; i++) {
       words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    let addCaps = words.join(" ");
    return addCaps;
  });
  
  // Replace spaces with underscores
  let reformattedParam = capitalizedParams.map(cp => {
    let addUnderscores = cp.replace(/ /g, "_");
    return addUnderscores
  });

  let reformattedParams = {};
  for (let i = 0; i < paramKeys.length; i++) {
    reformattedParams[paramKeys[i]] = reformattedParam[i]
  }
  
  return reformattedParams;
  };

  let {campaign, searchTerm, medium, source} = f;
  params.push(source, searchTerm, medium, campaign);
  let paramKeys = Object.keys(f);

  // Capitalize parameters
  let capitalizedParams = params.map(p => {
    const words = p.split(' ');
    for (let i = 0; i < words.length; i++) {
       words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    let addCaps = words.join(" ");
    return addCaps;
  });
  
  // Replace spaces with underscores
  let reformattedParam = capitalizedParams.map(cp => {
    let addUnderscores = cp.replace(/ /g, "_");
    return addUnderscores
  });

  let reformattedParams = {};
  for (let i = 0; i < paramKeys.length; i++) {
    reformattedParams[paramKeys[i]] = reformattedParam[i]
  }

  return reformattedParams;
}

/** 
 * Export to Google Sheets
*/

const exportData = async (data) => {
  const email = localStorage.getItem("email");
  const name = localStorage.getItem("name");
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
  const token = localStorage.getItem("token");
  
  let init = {
    method: 'PUT',
    async: true,
    body: JSON.stringify(params),
    headers: {
        "Authorization": 'Bearer ' + token,
        "Content-Type": 'application/json'
    },
    contentType: 'json',
};

  const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${params.spreadsheetId}/${values}/${params.range}:append?valueInputOption=${params.valueInputOption}&key=`

  let request = fetch(sheetsUrl, init);
  // let request = gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody);
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

}