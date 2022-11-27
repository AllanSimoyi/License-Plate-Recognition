import { Heading, HStack, SimpleGrid, Spacer, VStack } from "@chakra-ui/react";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData, useNavigate } from "@remix-run/react";
import { useCallback } from "react";
import { CustomCatchBoundary } from "~/components/CustomCatchBoundary";
import { CustomErrorBoundary } from "~/components/CustomErrorBoundary";
import { PrimaryButton } from "~/components/PrimaryButton";
import { ScrollAnimateUp } from "~/components/ScrollAnimateUp";
import { VehicleListItem } from "~/components/vehicles/VehicleListItem";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "License Plate Reader - Vehicle Records",
  };
};

export async function loader ({ request }: LoaderArgs) {
  await requireUser(request);
  const vehicles = await prisma.vehicle.findMany();
  return json({
    vehicles: vehicles.sort((a, b) => b.id - a.id),
  });
}

export default function VehiclesPage () {
  const { vehicles } = useLoaderData<typeof loader>();
  return (
    <VStack align="stretch">
      <HStack align="flex-start" py={4}>
        <VStack visibility="hidden">
          <PrimaryButton>Add Vehicle</PrimaryButton>
        </VStack>
        <Spacer />
        <Heading size="md">Vehicle Records</Heading>
        <Spacer />
        <Link to="/vehicles/new">
          <PrimaryButton variant="outline">Add Vehicle</PrimaryButton>
        </Link>
      </HStack>
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={5}>
        {vehicles.map((vehicle, index) => (
          <ScrollAnimateUp key={vehicle.id} delay={0 + (index * .1)}>
            <VehicleListItem
              vehicle={{
                ...vehicle,
                createdAt: new Date(vehicle.createdAt),
                updatedAt: new Date(vehicle.updatedAt),
              }}
            />
          </ScrollAnimateUp>
        ))}
      </SimpleGrid>
    </VStack>
  )
}

export function CatchBoundary () {
  const caught = useCatch();
  const navigate = useNavigate();
  const reload = useCallback(() => {
    navigate('.', { replace: true })
  }, [navigate]);
  return <CustomCatchBoundary reload={reload} caught={caught} />
}

export function ErrorBoundary ({ error }: { error: Error }) {
  console.error(error);
  const navigate = useNavigate();
  const reload = useCallback(() => {
    navigate('.', { replace: true })
  }, [navigate]);
  return <CustomErrorBoundary reload={reload} error={error} />
}