const Article = require('../Models/article');

const articleController = {
  saveArticle: async (articleData) => {
    try {
      const article = new Article(articleData);
      const savedArticle = await article.save();
      return savedArticle;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateArticle: async (id, articleData) => {
    try {
      const updatedArticle = await Article.findByIdAndUpdate(
        id,
        articleData,
        { new: true }
      );
      return updatedArticle;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteArticle: async (id) => {
    try {
      const deletedArticle = await Article.findByIdAndDelete(id);
      return deletedArticle;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAllArticles: async () => {
    try {
      const articles = await Article.find().sort({published_at: -1}).limit(100);
      return articles;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getArticlesAfterId: async (id) => {
    try {
      const query = { _id: { $lt: id } };
      const articles = await Article.find(query).sort({published_at: -1}).limit(100);
      return articles;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getArticleById: async (id) => {
    try {
      const article = await Article.findById(id);
      if (!article) {
        throw new Error('Article not found');
      }
      return article;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = articleController;
