const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://stevenlatest:313233343536@cluster0.fdrrlcd.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'JPG';
const collectionName = 'Category';

async function getAllCategories() {
  const client = new MongoClient(uri);

  try { 
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const categories = await collection.find().toArray();
  
    return categories;
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
} 

async function createCategory(category) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);


    const maxCategory = await collection.findOne({}, { sort: { categoryId: -1 } });
    const maxCategoryId = maxCategory ? maxCategory.categoryId : 0;

    console.log('Received category:', category);

    const newCategory = {
      categoryId: maxCategoryId + 1,
      name: category && category.name ? category.name : '',
      image: category && category.image ? category.image : '',
      dynamicFields: category && category.dynamicFields ? category.dynamicFields : []
    };

    console.log('New category:', newCategory);

    const result = await collection.insertOne(newCategory);

    return result.insertedId;
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
}

async function getCategoryById(id) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const category = await collection.findOne({ _id: new ObjectId(id) });

    // Convert the ObjectId to a regular string
    if (category) {
      category._id = category._id.toString();
    }

    return category;
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
}


async function updateCategory(id, updatedCategory) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    console.log('Updating category with id:', id);
    console.log('Updated category:', updatedCategory);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedCategory }
    );

    console.log('Update result:', result);

    return result.modifiedCount;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  } finally {
    client.close();
  }
}


async function deleteCategory(id) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount;
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
}
async function getReviewsByCategoryId(categoryId) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const category = await collection.findOne({ _id: new ObjectId(categoryId) });

    // Convert the ObjectId to a regular string
    if (category) {
      category._id = category._id.toString();
    }

    return category ? category.reviews : [];
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
}

async function addReviewToCategory(categoryId, review) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Add rating to the review object
    const reviewWithRating = {
      ...review,
      rating: review && review.rating ? review.rating : 0
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(categoryId) },
      { $push: { reviews: reviewWithRating } }
    );

    return result.modifiedCount;
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
}

module.exports = {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getReviewsByCategoryId,
  addReviewToCategory,
};