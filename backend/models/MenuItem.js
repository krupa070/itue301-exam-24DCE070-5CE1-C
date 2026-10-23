const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be at least 0']
    },
    category: {
      type: String,
      enum: {
        values: ['snack', 'meal', 'drink'],
        message: '{VALUE} is not a valid category'
      },
      default: 'snack'
    },
    available: {
      type: Boolean,
      default: true
    },
    caloriesPer100g: {
      type: Number,
      required: [true, 'Calories per 100g is required'],
      min: [0, 'Calories per 100g must be at least 0'],
      max: [900, 'Calories per 100g cannot exceed 900']
    },
    weightG: {
      type: Number,
      default: 100,
      min: [1, 'Weight must be at least 1g'],
      max: [2000, 'Weight cannot exceed 2000g'],
      validate: {
        validator: function (val) {
          const category = this.category || (this.getUpdate && (this.getUpdate().$set?.category || this.getUpdate()?.category));
          if (category === 'drink') {
            return val <= 500;
          }
          return true;
        },
        message: 'Drink weight must not exceed 500g'
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
