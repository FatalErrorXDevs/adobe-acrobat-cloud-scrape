import fetch from 'node-fetch';
import fs from 'fs';
const fileUrlsToDownload = [
    
  ];

const auth = "Bearer sometoken"

async function fetchData(items, count) {
  const body = "{\"asset_uris\": "+ JSON.stringify(items)+ ",\"zip_file_name\":\"Document Cloud\",\"time_zone_offset_minutes\":-120,\"make_ticket\":true}"
  try {
    const response = await fetch("https://dc-api.adobe.io/1695388926/assets/zip/uri/download", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0",
            "Accept": "application/vnd.adobe.dc+json;profile=\"https://dc-api.adobe.io/schemas/zip_download_uri_v1.json\"",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/vnd.adobe.dc+json;profile=\"https://dc-api.adobe.io/schemas/zip_download_params_v1.json\"",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "cross-site",
            "X-Requested-With": "XMLHttpRequest",
            "x-request-id": "6193ac8e-dee0-4e22-b3d3-021eeb54601e",
            "x-api-app-info": "dc-web-app",
            "x-api-client-id": "api_browser",
            "Authorization": auth, 
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "referrer": "https://acrobat.adobe.com/",
        "body": body,
        "method": "POST",
        "mode": "cors"
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.uri;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the fetchData function to initiate the request
var toProcess = [];
var resultLinks = [];

for (var i = 0; i < fileUrlsToDownload.length; i++) {
  var item = fileUrlsToDownload[i];
  toProcess.push(item);
  
  if ((i + 1) % 10 === 0 || (i + 1) === fileUrlsToDownload.length) {
    const result = await fetchData(toProcess, i);
    resultLinks.push(result);
    toProcess = [];
  }
}

resultLinks.forEach(async (element, index) => {
  const fileUrl = element;

  const filename = `file_${index}.zip`;

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`HTTP error for ${fileUrl}! Status: ${response.status}`);
    }

    const fileStream = fs.createWriteStream(filename);

    response.body.pipe(fileStream);

    fileStream.on('finish', () => {
      console.log(`File ${filename} downloaded successfully.`);
      fileStream.close();
    });

    fileStream.on('error', err => {
      console.error(`File ${filename} download error:`, err);
    });
  } catch (error) {
    console.error(`Fetch error for ${fileUrl}:`, error);
  }
});
