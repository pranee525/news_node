const axios = require('axios');
const moment = require('moment'); // for working with dates and times
const ApiRequestManager = require('../Models/apiRequestManager');
const articleDTO = require('../DAL/articleDTO');
const Article = require('../Models/article');


async function makeApiCall(apiRequestManager) {
  try {
    // Check if it's time to make the API call
    const currentTime = moment();
    const lastRequestedTime = moment(apiRequestManager.lastRequestedOn);
    const requestIntervalInMinutes = apiRequestManager.requestIntervalInMins;

    if (
      currentTime.diff(lastRequestedTime, 'minutes') >= requestIntervalInMinutes &&
      apiRequestManager.currentRequestCount < apiRequestManager.requestsPerDay
    ) {


      if (apiRequestManager.apiName === "Media Stack") {
        fetchDataFromMediaStackEndpoint()
          .then((data) => {
            console.log("Data from the news endpoint:", data);
            for (const datavalue of data.data) {
              const transformedArticle = articleDTO.transformJsonToArticle(datavalue);
              console.log(transformedArticle, "transformedArticle1");
              doesArticleExistByTitle(transformedArticle.title)
                .then((articleExists) => {
                  if (!articleExists) {
                  
                    transformedArticle.save();
                  }
                  else{
                    console.log("Article already exists");
                  }
                })
                .catch((error) => {
                  console.error(error.message);
                });
            }

          })
          .catch((error) => {
            console.error(error.message);
          });
      } else {
        fetchDataFromCurrentsApi()
          .then((data) => {
            console.log("Data from the Currents API:", data);
            // articleDTO.transformJsonToArticle(data);
          })
          .catch((error) => {
            console.error(error.message);
          });
      }


      // Update currentRequestCount, lastRequestedOn, and save the changes
      apiRequestManager.currentRequestCount += 1;
      apiRequestManager.lastRequestedOn = currentTime.toDate();
      await apiRequestManager.save();

      // Log success or handle the API response as needed
      console.log(`API call made for ${apiRequestManager.apiName}`);
    } else {
      // Log or handle the case where API call conditions are not met
      console.log(`Skipping API call for ${apiRequestManager.apiName}`);
    }
  } catch (error) {
    // Handle errors or log them
    console.error(`Error making API call for ${apiRequestManager.apiName}: ${error.message}`);
  }
}

// Method to check and make API calls for all ApiRequestManager documents
async function checkAndMakeApiCalls() {
  try {
    const allApiRequestManagers = await ApiRequestManager.find();

    for (const apiRequestManager of allApiRequestManagers) {
      await makeApiCall(apiRequestManager);
    }
  } catch (error) {
    console.error(`Error checking and making API calls: ${error.message}`);
  }
}
function start() {
  // Run the checkAndMakeApiCalls method every 20 minutes
  setInterval(checkAndMakeApiCalls, 20 * 60 * 1000);
  //checkAndMakeApiCalls();
}


async function fetchDataFromMediaStackEndpoint() {
  try {
    const apiUrl = "http://api.mediastack.com/v1/news";
    const accessKey = "3553763b18f672f5efcb48d15b8293f0";
    const countries = "in";
    const languages = "en";
    const sort = "published_desc";
    const offset = 0;
    const limit = 100;

    const response = await axios.get(apiUrl, {
      params: {
        access_key: accessKey,
        countries: countries,
        languages: languages,
        sort: sort,
        offset: offset,
        limit: limit,
      },
    });

    const data = response.data;
    return data;
  } catch (error) {
    throw new Error(`Error fetching data from the news endpoint: ${error.message}`);
  }
}
async function fetchDataFromCurrentsApi() {
  try {
    const apiUrl = "https://api.currentsapi.services/v1/latest-news";
    const apiKey = "ZtpV5bCkrT8E3zveWPeeuR1lpudUrhew4ivBqe0KDygjc-c_";
    const region = "IN";

    const response = await axios.get(apiUrl, {
      params: {
        apiKey: apiKey,
        region: region,
      },
    });

    const data = response.data;
    return data;
  } catch (error) {
    throw new Error(`Error fetching data from the Currents API: ${error.message}`);
  }
}

async function doesArticleExistByTitle(title) {
  try {
    // Check if the article with the given title already exists in the database
    const existingArticle = await Article.findOne({ title: title });

    return Boolean(existingArticle);
  } catch (error) {
    throw new Error(`Error checking article existence: ${error.message}`);
  }
}

module.exports = { start };