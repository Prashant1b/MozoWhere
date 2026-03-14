const mongoose=require('mongoose');

async function main() {
   await mongoose.connect(process.env.MONGODBURL, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
   })

   // Clean up stale indexes from old schema fields
   try {
      const collection = mongoose.connection.collection("users");
      const indexes = await collection.indexes();
      const staleIndex = indexes.find((idx) => idx.key && idx.key.problemsolved !== undefined);
      if (staleIndex) {
         await collection.dropIndex(staleIndex.name);
         console.log("Dropped stale index: " + staleIndex.name);
      }
   } catch (e) {
      // ignore if already dropped
   }
}

module.exports=main
