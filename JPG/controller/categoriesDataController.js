const { MongoClient, ObjectId } = require('mongodb');
//mongodb://stevenlatest:313233343536@europe-west1.gcp.realm.mongodb.com:27020/?authMechanism=PLAIN&authSource=%24external&ssl=true&appName=application-0-nuwsw:mongodb-atlas:local-userpass
const uri = 'mongodb+srv://stevenlatest:313233343536@cluster0.fdrrlcd.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'JPG';
const categoryCollection = 'Category';
const dynamicFieldsCollection = 'DynamicFields';

async function getCategoriesData() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const categoryColl = db.collection(categoryCollection);
    const dynamicFieldsColl = db.collection(dynamicFieldsCollection);

    const categories = await categoryColl.find().toArray();

    const categoriesData = [];

    for (const category of categories) {
      const dynamicFields = await dynamicFieldsColl
        .find({ categoryId: category._id })
        .toArray();

      const categoryData = {
        _id: category._id,
        name: category.name,
        dynamicFields: dynamicFields
      };

      categoriesData.push(categoryData);
    }

    return categoriesData;
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
}

module.exports = {
  getCategoriesData
};
