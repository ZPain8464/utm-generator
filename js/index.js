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
    const url = f.url;
    getTLS(url);
    const baseUrl = getTLS(url);

    // handle promotion type
    const promoType = f.promoType;
    const promoParam = promoType.replace(/ /g,"_")
    
    const generatedUrl = baseUrl + '?' + 'utm_promotion=' + promoParam;
    generateUrl(generatedUrl)
} 

const getTLS = (url) => {

    const tls = 'https://';
    if(!url.includes(tls)) {
        const tlsUrl = tls + url;
        // return generateUrl(tlsUrl);
        return tlsUrl;
        }
    // return generateUrl(url);
    return url;
}

// Button functions

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

function clearField(){
    const urlString = document.getElementById("url-string");
    if(urlString.hasChildNodes) {
        urlString.innerHTML = "";
    }
   
}