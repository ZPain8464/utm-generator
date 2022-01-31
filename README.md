# DevRel UTM Link Generator
This is a simple Chrome Extension designed to quickly generate UTM links for tracking marketing campaigns. 

The workflow is simple: 
1. Sign in with your Gmail account.  
2. Fill in the required fields. 
3. Click the `Create UTM Link` button.

Assuming you entered valid data, the form will generate a UTM link in the `textarea` and write the following data to an external Google Sheet: 

- Name 
- Gmail Account
- Date Created 
- Purpose
- Formatted UTM link 

## How to Run Locally

To use this extension locally, you must use a Gmail account. To link to an external Google Sheet, create a Google Sheets spreadsheet and add an **Apps Script Extension** (select **Extensions** > **Apps Script**).

In your **Apps Script**, use the code snippet below to find your Google Sheet and write data to it: 

```javascript
function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSheet();
    
    //Parsing the request body
    var body = JSON.parse(e.postData.contents)
    sheet.appendRow([
      body.name, 
      body.email, 
      body.date, 
      body.purpose, 
      body.url
    ]);
}
```

> **Note:** the `Source` and `Medium` fields fetch dropdown menu items from an external `JSON` file. 





