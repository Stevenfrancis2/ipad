const { MongoClient, ObjectId , ServerApiVersion} = require('mongodb');
const bcrypt = require('bcrypt');
const uri = 'mongodb+srv://stevenlatest:313233343536@cluster0.fdrrlcd.mongodb.net/?retryWrites=true&w=majority';
//mongodb+srv://stevenlatest:313233343536@cluster0.fdrrlcd.mongodb.net/
const dbName = 'JPG';
const collectionName = 'Admin';

async function login(email, password) {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const admin = await collection.findOne({ email });

    if (!admin) {
      throw new Error('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (passwordMatch) {
      return true;
    } else {
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  } finally {
    client.close();
  }
}

async function addAdmin(email, password) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const existingAdmin = await collection.findOne({ email });

    if (existingAdmin) {
      throw new Error('Admin with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = {
      email,
      password: hashedPassword
    };

    await collection.insertOne(newAdmin);
    return true;
  } catch (error) {
    console.error('Error adding admin:', error);
    throw error;
  } finally {
    client.close();
  }
}

async function editAdmin(adminId, email, password) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const admin = await collection.findOne({ _id: new ObjectId(adminId) });

    if (!admin) {
      throw new Error('Admin not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await collection.updateOne(
      { _id: new ObjectId(adminId) },
      { $set: { email, password: hashedPassword } }
    );

    return true;
  } catch (error) {
    console.error('Error editing admin:', error);
    throw error;
  } finally {
    client.close();
  }
}

async function deleteAdmin(adminId) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const admin = await collection.findOne({ _id: new ObjectId(adminId) });

    if (!admin) {
      throw new Error('Admin not found');
    }

    await collection.deleteOne({ _id: new ObjectId(adminId) });
    return true;
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  } finally {
    client.close();
  }
}

async function getAllAdmins() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const admins = await collection.find().toArray();
    return admins;
  } catch (error) {
    console.error('Error retrieving admins:', error);
    throw error;
  } finally {
    client.close();
  }
}

module.exports = {
  login,
  addAdmin,
  editAdmin,
  deleteAdmin,
  getAllAdmins,
};
