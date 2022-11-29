import { faker } from '@faker-js/faker';
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dayjs from 'dayjs';

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

  await [...Array(4).keys()].reduce(async (acc, current) => {
    await acc;
    await prisma.vehicle.create({
      data: {
        image: "nciyiic9yzpbxichfitm",
        fullName: faker.name.fullName(),
        phoneNumber: faker.phone.number(),
        makeAndModel: faker.vehicle.model(),
        vin: faker.vehicle.vrm(),
        licenseNumber: faker.vehicle.vin(),
        createdAt: current % 2 === 0 ? new Date() : dayjs().subtract(1, "day").toDate(),
      }
    });
  }, Promise.resolve());

  const vehicles = await prisma.vehicle.findMany();

  await vehicles.reduce(async (acc, vehicle, index) => {
    await acc;
    await prisma.flag.create({
      data: {
        vehicleId: vehicle.id,
        dateTime: index % 2 === 0 ? new Date() : dayjs().subtract(1, "day").toDate(),
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
