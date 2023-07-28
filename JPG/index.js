const express = require('express');
const nunjucks = require('nunjucks');
const app = express();
const querystring = require('querystring');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('images'));
const session = require('express-session');
const cloudinary = require("cloudinary").v2;
const multer = require('multer');
const fs = require("fs");
cloudinary.config({
  cloud_name: "dmczw31ga",
  api_key: "332159267635925",
  api_secret: "OCTtKciOpYRAV4s5AgpfEi1oMdU",
});
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));
// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder where uploaded files will be stored
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Set the filename of the uploaded file
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
const authMiddleware = require('./middleware/authMiddleware');
const categoryController = require('./controller/categoryController');
const categoriesDataController = require('./controller/categoriesDataController');
const adminController = require('./controller/adminController');
app.set('view engine', 'njk');
nunjucks.configure('views', {
  autoescape: true, 
  express: app,
});

app.use(authMiddleware.checkAdminAuth);
app.get('/', async (req, res) => {
  const categories = await categoryController.getAllCategories();
  res.render('index',  { categories:categories??'' });
});
 
app.get('/delivery', async (req, res) => {
  const categories = await categoryController.getAllCategories();
  res.render('delivery',  { categories:categories??'' });
}); 

app.get('/markets', async (req, res) => {
  const categories = await categoryController.getAllCategories();
  res.render('markets',  { categories:categories??'' });
});

app.get('/desserts', async (req, res) => {
  const categories = await categoryController.getAllCategories();
  res.render('desserts',  { categories:categories??'' });
}); 
app.get('/gaming', async (req, res) => {
  const categories = await categoryController.getAllCategories();
  res.render('gaming',  { categories:categories??'' });
}); 

app.get('/beauty', async (req, res) => {
  const categories = await categoryController.getAllCategories();
  res.render('beauty',  { categories:categories??'' });
}); 

app.get('/transportations', async (req, res) => {
  const categories = await categoryController.getAllCategories();
  res.render('transportations',  { categories:categories??'' });
}); 

app.get('/shops', async (req, res) => {
  const categories = await categoryController.getAllCategories();
  res.render('shops',  { categories:categories??'' });
}); 


app.get('/beachbars', async (req, res) => {
  const categories = await categoryController.getAllCategories();
  res.render('beachbars',  { categories:categories??'' });
});

app.get('/info', async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    console.log("Received categoryId:", categoryId);
    const category = await categoryController.getCategoryById(categoryId);

    if (category) {
      
      const reviews = await categoryController.getReviewsByCategoryId(categoryId);

      res.render('information', { category, reviews });
    } else {
      res.status(404).render('error', { message: 'Category not found' });
    }
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).render('error', { message: 'Internal server error' });
  }
});


app.post('/addReview', async (req, res) => {
  try {
    // Extracting data from the request body
    const categoryId = req.body.categoryId;
    const review = req.body.review;
    const rating = req.body.rating;
    const email = req.body.email;
    console.log(categoryId);
    console.log(review);
    console.log(rating);
    console.log(email);
    // Validate the input data (optional step)
    if (!categoryId || !review || !rating || !email) {
      return res.status(400).json({ success: false, error: 'Invalid input data' });
    }

    // You can perform additional validation here if needed

    // Add the review to the category
    const modifiedCount = await categoryController.addReviewToCategory(categoryId, {
      review,
      rating,
      email,
    });

    if (modifiedCount > 0) {
      res.redirect(`/info?categoryId=${categoryId}`);
    } else {
      res.status(404).json({ success: false, error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.get('/AdminPanel', (req, res) => {
  res.render('admin/main');
});

app.get('/login', (req, res) => {
  res.render('admin/login' , {message:req.session.message?'Please check your login credentials!':''});
});
app.post('/AdminPanel/Login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const loggedIn = await adminController.login(email, password);
    if (loggedIn) {
      req.session.isAdminLoggedIn = true; // Set the session property
      res.redirect('/AdminPanel');
    } else { 
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.error('Error during login:', error.toString());
    req.session.message = error;
    res.redirect('/login');
  }
});


app.get('/AdminPanel/Categories', async (req, res) => {
  try {
    const categories = await categoryController.getAllCategories();
    
    res.render('admin/categories', { categories });
  } catch (error) { 
    console.error('Error retrieving categories:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/AdminPanel/Categories', upload.single('image'), async (req, res) => {
  try {
    // Access the uploaded file using req.file
    const uploadedImagePath = req.file.path;
    var imagePath = "";
    // Upload the image to Cloudinary
    cloudinary.uploader.upload(uploadedImagePath, async function (error, result) {
      if (error) {
        console.error("Error uploading image:", error);
        return res.status(500).send("Error uploading image");
      } 
        const newCategory = {  
          name: req.body.name,
          image: result.secure_url,
          dynamicFields: req.body.dynamicFields,
        };  
 
        await categoryController.createCategory(newCategory);

        // Delete the uploaded file from the server after processing
        fs.unlinkSync(uploadedImagePath);

        return res.redirect('/AdminPanel/Categories');
      
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/AdminPanel/Categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryController.getCategoryById(categoryId);
    
    res.render('admin/editCategory', { category });
  } catch (error) {
    console.error('Error retrieving category:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/AdminPanel/Categories/Update/:id', upload.single('image'), async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updatedCategory = req.body;

    // Check if an image was uploaded and process it
    if (req.file) {
      // New image was uploaded
      const uploadedImagePath = req.file.path;

      // Upload the new image to Cloudinary
      cloudinary.uploader.upload(uploadedImagePath, async function (error, result) {
        if (error) {
          console.error("Error uploading image:", error);
          return res.status(500).send("Error uploading image");
        }

        updatedCategory.image = result.secure_url;

        // Call the categoryController to update the category with the new data
        await categoryController.updateCategory(categoryId, updatedCategory);

        // Delete the uploaded file from the server after processing
        fs.unlinkSync(uploadedImagePath);

        return res.redirect('/AdminPanel/Categories');
      });
    } else {
      // No new image was uploaded, keep the old image URL
      const existingCategory = await categoryController.getCategoryById(categoryId);
      updatedCategory.image = existingCategory.image;

      // Call the categoryController to update the category with the new data
      await categoryController.updateCategory(categoryId, updatedCategory);

      res.redirect('/AdminPanel/Categories');
    }
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/AdminPanel/Categories/Delete/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    await categoryController.deleteCategory(categoryId);
    res.redirect('/AdminPanel/Categories');
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/AdminPanel/Admins', async (req, res) => {
  try {
    const admins = await adminController.getAllAdmins();
    res.render('admin/admins', { admins });
  } catch (error) {
    console.error('Error retrieving admins:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/AdminPanel/Admins/Add', (req, res) => {
  res.render('admin/add-admin');
});

app.post('/AdminPanel/Admins/Add', async (req, res) => {
  try {
    const { email, password } = req.body;
    await adminController.addAdmin(email, password);
    res.redirect('/AdminPanel/Admins');
  } catch (error) {
    console.error('Error adding admin:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/AdminPanel/Admins/Edit/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await adminController.getAdminById(adminId);
    res.render('admin/edit-admin', { admin });
  } catch (error) {
    console.error('Error retrieving admin:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/AdminPanel/Admins/Update/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    const { email, password } = req.body;
    await adminController.editAdmin(adminId, email, password);
    res.redirect('/AdminPanel/Admins');
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/AdminPanel/Admins/Delete/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    await adminController.deleteAdmin(adminId);
    res.redirect('/AdminPanel/Admins');
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/AdminPanel/Data', async (req, res) => {
  try {
    const categoriesData = await categoriesDataController.getCategoriesData();
    res.render('admin/data', { categoriesData });
  } catch (error) {
    console.error('Error retrieving categories data:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.listen(3000, () => {
  console.log('Server started on port 3000');
});
