// https://ga-dev-tools.web.app/campaign-url-builder/
// TODO: Handle adding '?' or '&' to url string once all data is submitted
const getFormData = (event) => {
    event.preventDefault();
    const url = document.getElementById("base_url").value;
    const source = document.getElementById("source").value;
    const medium = document.getElementById("medium").value;
    const content = document.getElementById("content").value;
    const campaign = document.getElementById("campaign_name").value;
    const promoType = document.getElementById("promotion_type")
    .options[document.getElementById('promotion_type').selectedIndex].text;
    
    const formData = {
        url, 
        source, 
        medium, 
        content, 
        campaign, 
        promoType
    }

    handleFormData(formData);
}

const form = document.getElementById("utm_form");
form.addEventListener("submit", getFormData);

const handleFormData = (f) => {

    // create base url
    const baseUrl = getTLS(f.url);

    // handle promotion type
    const promoParam = handlePromo(f.promoType);

    // handle campaign name
    const campaignParam = handleCampaign(f.campaign)

    // generate final url 
    if(promoParam === null && campaignParam === null) {
        // If promo field is default value, don't include in url string
        generateUrl(baseUrl);
        return;
    }
    const generatedUrl = baseUrl + promoParam + campaignParam;
    generateUrl(generatedUrl)
} 

///// Form Field Data /////

// Adds TLS to base url if not included in form
const getTLS = (url) => {
    const tls = 'https://';
    if(!url.includes(tls)) {
        const tlsUrl = tls + url;
        return tlsUrl;
        }
    return url;
}

// Formats promo type to url parameter 
const handlePromo = (promo) => {
    if(promo === "Choose Promotion Type") {
        return null;
    }

    const formatData = promo.replace(/ /g, "_");
    const parameter = '?' + 'utm_promotion=' + formatData
    return parameter;
}

const handleCampaign = (c) => {
    if(c === "") {
        return null;
    }
    // TODO: Capitalize first letter of each word
    const formatData = c.replace(/ /g, "_");
    const parameter = '&' + 'utm_campaign=' + formatData;
    return parameter;
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