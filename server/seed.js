import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample product data
const sampleProducts = [
  // Cakes
  {
    name: "Chocolate Fudge Cake",
    description: "Rich, moist chocolate cake with layers of creamy chocolate fudge frosting. Perfect for chocolate lovers!",
    price: 599,
    originalPrice: 799,
    category: "cakes",
    image: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Dark Chocolate", "Butter", "Eggs", "Flour", "Sugar", "Cocoa Powder"],
    rating: 4.8
  },
  {
    name: "Vanilla Bean Cake",
    description: "Classic vanilla sponge cake with vanilla buttercream frosting. Light, fluffy and absolutely delicious!",
    price: 449,
    category: "cakes",
    image: "https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Vanilla Beans", "Butter", "Eggs", "Flour", "Sugar", "Milk"],
    rating: 4.6
  },
  {
    name: "Red Velvet Cake",
    description: "Stunning red velvet cake with cream cheese frosting. A perfect balance of flavor and visual appeal.",
    price: 699,
    category: "cakes",
    image: "https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Cocoa Powder", "Buttermilk", "Red Food Coloring", "Cream Cheese", "Butter"],
    rating: 4.9
  },
  {
    name: "Black Forest Cake",
    description: "Traditional German cake with chocolate sponge, cherries, and whipped cream layers.",
    price: 799,
    category: "cakes",
    image: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Chocolate Sponge", "Fresh Cherries", "Whipped Cream", "Kirsch", "Dark Chocolate"],
    rating: 4.7
  },

  // Pizza
  {
    name: "Margherita Pizza",
    description: "Classic Italian pizza with fresh mozzarella, tomato sauce, and fresh basil leaves.",
    price: 299,
    category: "pizza",
    image: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Mozzarella Cheese", "Tomato Sauce", "Fresh Basil", "Olive Oil"],
    rating: 4.5
  },
  {
    name: "Pepperoni Pizza",
    description: "Loaded with spicy pepperoni slices and melted cheese on our signature pizza base.",
    price: 399,
    category: "pizza",
    image: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Pepperoni", "Mozzarella Cheese", "Tomato Sauce", "Italian Herbs"],
    rating: 4.6
  },
  {
    name: "Veggie Supreme Pizza",
    description: "Loaded with fresh vegetables including bell peppers, mushrooms, onions, and olives.",
    price: 349,
    category: "pizza",
    image: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Bell Peppers", "Mushrooms", "Onions", "Olives", "Tomatoes", "Mozzarella"],
    rating: 4.4
  },

  // Brownies
  {
    name: "Classic Chocolate Brownies",
    description: "Fudgy, rich chocolate brownies with a perfect chewy texture. Made with premium dark chocolate.",
    price: 199,
    category: "brownies",
    image: "https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Dark Chocolate", "Butter", "Eggs", "Brown Sugar", "Flour", "Vanilla"],
    rating: 4.7
  },
  {
    name: "Walnut Brownies",
    description: "Rich chocolate brownies loaded with crunchy walnuts for extra texture and flavor.",
    price: 249,
    category: "brownies",
    image: "https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Dark Chocolate", "Walnuts", "Butter", "Eggs", "Brown Sugar", "Flour"],
    rating: 4.6
  },
  {
    name: "Salted Caramel Brownies",
    description: "Decadent brownies with gooey salted caramel swirls throughout. An irresistible combination!",
    price: 279,
    category: "brownies",
    image: "https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Dark Chocolate", "Caramel", "Sea Salt", "Butter", "Eggs", "Brown Sugar"],
    rating: 4.8
  },

  // Custom Cakes
  {
    name: "Custom Birthday Cake",
    description: "Personalized birthday cake made to your specifications. Choose your flavors, colors, and decorations!",
    price: 1299,
    category: "custom",
    image: "https://images.pexels.com/photos/1729808/pexels-photo-1729808.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Customizable based on your choice"],
    rating: 4.9
  },
  {
    name: "Wedding Cake",
    description: "Elegant multi-tier wedding cake designed to make your special day even more memorable.",
    price: 2999,
    category: "custom",
    image: "https://images.pexels.com/photos/1729808/pexels-photo-1729808.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Premium ingredients based on your selection"],
    rating: 5.0
  },
  {
    name: "Anniversary Cake",
    description: "Romantic anniversary cake with elegant decorations to celebrate your love and commitment.",
    price: 899,
    category: "custom",
    image: "https://images.pexels.com/photos/1729808/pexels-photo-1729808.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Heart-shaped decorations", "Premium flavors of your choice"],
    rating: 4.8
  }
];

// Connect to MongoDB and seed data
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dingdongcakes');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();