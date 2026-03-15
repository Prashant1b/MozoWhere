  const express = require('express');
  const app = express();
  const dotenv = require('dotenv')
  dotenv.config();
  const main = require('./config/db');
  const cookieparser=require('cookie-parser')
  const redisClient = require('./config/redis');
const categoryRoutes = require("./route/category.routes");
const Router=require("./route/userAuth")
const productRoutes = require("./route/product.routes");
const variantRoutes =require("./route/variant.routes");
const cartRoutes = require("./route/cart.routes");
const orderRoutes = require("./route/order.routes");
const paymentRoutes = require("./route/payment.route");
const AdminRouter=require("./route/admin.routes");
const CouponRoute= require("./route/coupon.routes");
const ReviewRoute=require("./route/review.routes");
const Wishlistroute=require("./route/wishlist.routes");
const customizeTemplateRoutes = require("./route/customize.template.routes");
const customizeDesignRoutes = require("./route/customize.design.routes");
const bulkOrderRoutes = require("./route/bulkOrder.routes");
const serviceRoutes = require("./route/service.routes");
const aiRoutes = require("./route/ai.routes");

  const cors = require("cors");
  app.use(
  cors({
    origin: ["https://mozowhere.vercel.app"],
    credentials: true,
  })
);

  app.use(express.json({ limit: "20mb" }));
  app.use(cookieparser());
app.use("/user",Router);
 app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/variants", variantRoutes);

app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use("/admin",AdminRouter);

app.use("/coupons",CouponRoute);
app.use("/reviews", ReviewRoute);
app.use("/wishlist", Wishlistroute);
app.use("/customize/templates", customizeTemplateRoutes);
app.use("/customize/designs", customizeDesignRoutes);
app.use("/bulk-orders", bulkOrderRoutes);
app.use("/services", serviceRoutes);
app.use("/ai", aiRoutes);

  const Initaliseconnection=async()=>{
      try{
          await Promise.all([main(),redisClient.connect()]);
          console.log("DB connected")
                  app.listen(process.env.PORT, () => {
                  console.log("Server is listen on the port: " + process.env.PORT)
            })
      }
      catch(err){
          console.log(err.message)
      }
  }

  Initaliseconnection();

  // main()
  //     .then(async () => {
  //        console.log("connected to mongodb")
  //         app.listen(process.env.PORT, () => {
  //             console.log("Server is listen on the port: " + process.env.PORT)
  //         })
  //     })
  // .catch(err=>console.log(err.message))




