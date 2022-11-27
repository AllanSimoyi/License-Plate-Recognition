import { faker } from '@faker-js/faker';
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed () {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      username: "test_user",
      hashedPassword: await bcrypt.hash("default@8901", 10),
    },
  });

  await prisma.user.create({
    data: {
      username: "admin_user",
      hashedPassword: await bcrypt.hash("admin@8901", 10),
    },
  });

  [...Array(20).keys()].reduce(async acc => {
    await acc;
    await prisma.vehicle.create({
      data: {
        image: "nciyiic9yzpbxichfitm",
        fullName: faker.name.fullName(),
        phoneNumber: faker.phone.number(),
        makeAndModel: faker.vehicle.model(),
        vin: faker.vehicle.vin(),
        licenseNumber: faker.vehicle.vrm(),
      }
    });
  }, Promise.resolve());

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
