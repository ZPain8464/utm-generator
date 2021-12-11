// https://ga-dev-tools.web.app/campaign-url-builder/
/**
 * TODO: Handle export data function
 */
const getFormData = (event) => {
    event.preventDefault();
    const fullName = document.getElementById("full_name").value;
    const email = document.getElementById("email").value;
    const url = document.getElementById("base_url").value;
    const source = document.getElementById("source").value;
    const searchTerm = document.getElementById("search_term").value;
    const medium = document.getElementById("medium").value;
    const campaign = document.getElementById("campaign_name").value;
    const promoType = document.getElementById("promotion_type")
    .options[document.getElementById('promotion_type').selectedIndex].text;
    
    const formData = {
        fullName,
        email,
        url, 
        source, 
        searchTerm,
        medium, 
        campaign, 
        promoType
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
    
    if(termParam === null && promoParam === null) {
        let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam;
        const formattedUrl = urlString.toLowerCase();
        const sheetData = {name: f.fullName, email: f.email, url: formattedUrl}
        exportData(sheetData);
        return generateUrl(formattedUrl);
    }

    if(termParam === null) {
        console.log("term null");
        let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam + '&' + promoParam;
        const formattedUrl = urlString.toLowerCase();
        const sheetData = {name: f.fullName, email: f.email, url: formattedUrl}
        exportData(sheetData);
        return generateUrl(formattedUrl); 
    }
    
    if(promoParam === null) {
        console.log("promo null");
        let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam + '&' + termParam;
        const formattedUrl = urlString.toLowerCase();
        const sheetData = {name: f.fullName, email: f.email, url: formattedUrl}
        exportData(sheetData);
        return generateUrl(formattedUrl); 
    }

    let urlString = baseUrl + '?' + sourceParam + '&' + campaignParam + '&' + mediumParam + '&' + termParam + '&' + promoParam;
    const formattedUrl = urlString.toLowerCase();
    const sheetData = {name: f.fullName, email: f.email, url: formattedUrl}
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
    const formatData = c.replace(/ /g, "_");
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
    const formatData = t.replace(/ /g, "_");
    const parameter =  'utm_term=' + formatData
    return parameter;
}

///// Export to Google Sheets /////
const exportData = (data) => {
    // TODO: Get Date(), export to GoogleSheets
    console.log(data)
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