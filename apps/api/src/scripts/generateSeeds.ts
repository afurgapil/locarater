const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { seedBadges } = require("../seeds/badges.seed");
const { UserBadge } = require("../models/user-badge.model");
const path = require("path");

const environment = process.env.NODE_ENV || "development";
console.log(`Environment: ${environment}`);

const envPath = path.resolve(__dirname, `../../.env.${environment}`);
console.log(`Loading .env file from: ${envPath}`);

dotenv.config({
  path: envPath,
});

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI bulunamadı!");
  process.exit(1);
}

console.log("MongoDB URI:", MONGODB_URI);

const generateSeeds = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("================================================");
    console.log("MongoDB'ye başarıyla bağlanıldı!");
    console.log("================================================");

    await UserBadge.deleteMany({});
    console.log("UserBadge koleksiyonu temizlendi.");

    await seedBadges();
  } catch (error) {
    console.error("Seed işlemi hatası:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB bağlantısı kapatıldı.");
  }
};

if (require.main === module) {
  generateSeeds()
    .then(() => {
      console.log("Seed işlemi tamamlandı!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed işlemi başarısız:", error);
      process.exit(1);
    });
}
