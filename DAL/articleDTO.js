// Assuming you have an Article schema defined
const Article = require('../Models/article');
const Language = require('../Models/language');
const Category = require('../Models/category');



function transformJsonToArticle(jsonData) {
  const articleData = {
    news_id: jsonData.id!=null?jsonData.id:null, // Assuming your Article schema uses 'news_id' instead of 'id'
    title: jsonData.title,
    description: jsonData.description,
    url: jsonData.url,
    author: jsonData.author,
    image: jsonData.image,
    language_id: jsonData.language, // Assuming you have a function to get language_id based on language
    category_id: jsonData.category, // Assuming you have a function to get category_id(s) based on category
    published_at: new Date(jsonData.published_at),
  };

  return new Article(articleData);
}
module.exports={transformJsonToArticle};
// Example function to get language_id based on language
function getLanguageId(language) {
    getLanguageIdFromMapping(language)
    .then((languageId) => {
        return languageId;
      console.log(`Language ID for code ${languageCodeToCheck}: ${languageId}`);
    })
    .catch((error) => {
      console.error(error.message);
    });
}

// Example function to get category_id(s) based on category
function getCategoryIds(categories) {
  // Implement your logic to map categories to category_id(s)
  // This can be a lookup in your database or some predefined mapping
  // For simplicity, let's assume you have a mapping function
  getCategoryIdsFromMapping(categories)
  .then((categoryId) => {
        return categoryId;
    console.log(`Category ID for name ${categoryNameToCheck}: ${categoryId}`);
  })
  .catch((error) => {
    console.error(error.message);
  });
}

// Example function to get language_id from a predefined mapping
async function getLanguageIdFromMapping(language) {
    try{
   // Check if the language code already exists in the database
   const existingLanguage = Language.findOne({ language_code: language });

   if (existingLanguage) {
     // If the language code exists, return the corresponding language ID
     return existingLanguage._id;
   } else {
     // If the language code doesn't exist, insert it into the database
     const newLanguage = new Language({ language_code: language });
     const savedLanguage = await newLanguage.save();
     return savedLanguage._id;
   }
 } catch (error) {
   throw new Error(`Error getting or inserting language: ${error.message}`);
 }
}

// Example function to get category_id(s) from a predefined mapping
async function getCategoryIdsFromMapping(categories) {
    try {
        // Check if the category name already exists in the database
        const existingCategory = Category.findOne({ category_name: categories });
    
        if (existingCategory) {
          // If the category name exists, return the corresponding category ID
          return existingCategory._id;
        } else {
          // If the category name doesn't exist, insert it into the database
          const newCategory = new Category({ category_name: categories });
          const savedCategory = await newCategory.save();
          return savedCategory._id;
        }
      } catch (error) {
        throw new Error(`Error getting or inserting category: ${error.message}`);
      }
}



//const transformedArticle = transformJsonToArticle(jsonData);
//console.log(transformedArticle);
