import mongoose from 'mongoose';

const addOnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Add-on name is required'],
    trim: true,
    maxlength: [100, 'Add-on name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Add-on price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Add-on image is required']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  }
}, {
  timestamps: true
});

const AddOn = mongoose.models.AddOn || mongoose.model('AddOn', addOnSchema);

export default AddOn;
