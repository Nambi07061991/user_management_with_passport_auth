'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // User.hasMany(models.Post, { foreignKey: 'userId' });
    }
  }
  User.init({
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetPassword: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'User',
  });

   // Hash the password before saving to the database
   User.beforeCreate(async (user) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
  });

  // Method to validate password
  User.prototype.validPassword = async function (password) {
    try {
    if (!password) {
      return false; // Password parameter is missing or invalid
    }
    if (!this.password) {
      return false; // Hashed password is missing or invalid
    }
    // Compare the plaintext password with the hashed password
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false; // Return false in case of any error
  }
  };

  
  return User;
};