import mongoose from "mongoose";
// for thisrt/shirt/hoodie
const printAreaSchema = new mongoose.Schema(
  {
    key: { 
        type: String, 
        required: true 
    },      
    label: { 
        type: String, 
        required: true
     },     
    maxWidth: {
        type:Number,
    },                            
    maxHeight: {
        type:Number
    },
    price: { 
        type: Number,
         default: 0 
        },     
    enabled: { 
        type: Boolean,
         default: true
     },
  },
  { _id: false }
);

const customizableItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, 
    type: {
      type: String,
      enum: ["tshirt", "shirt", "hoodie", "accessory"],
      required: true,
    },
    mockups: {
      type: Map,
      of: String, 
      default: {},
    },

    availableSizes: [{
         type: String
         }],          
    availableColors: [{ 
        type: String,
         default: ["White", "Black"] 
        }],

    basePrice: { 
        type: Number,
         required: true 
        },
    printAreas: { 
        type: [printAreaSchema], 
        default: [] 
    },

    isActive: { 
        type: Boolean, 
        default: true 
    },
  },
  { timestamps: true }
);

const customization=mongoose.model("CustomizableItem", customizableItemSchema);
module.exports=customization;