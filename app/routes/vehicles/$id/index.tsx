import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink, Img, Spacer, Stack, Text, VStack
} from '@chakra-ui/react';
import { AdvancedImage, placeholder } from "@cloudinary/react";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useCatch, useLoaderData, useNavigate, useTransition } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import { useCallback } from "react";
import placeholderImage from "~/../public/images/light_placeholder.jpeg";
import { CustomCatchBoundary } from "~/components/CustomCatchBoundary";
import { CustomErrorBoundary } from "~/components/CustomErrorBoundary";
import { DeleteConfirmation } from "~/components/DeleteConfirmation";
import { PrimaryButton } from "~/components/PrimaryButton";
import { useDelete } from "~/hooks/useDelete";
import { PositiveIntSchema } from "~/lib/core.validations";

import { ChevronRight } from 'tabler-icons-react';
import { Card } from '~/components/Card';
import { CardSection } from '~/components/CardSection';
import { prisma } from "~/db.server";
import { cloudinaryImages } from "~/lib/images";
import { requireUser } from "~/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "License Plate Reader - Vehicle Details",
  };
};

function fetchVehicle (id: number) {
  return prisma.vehicle.findUnique({
    where: { id },
  });
}

interface LoaderData {
  vehicle: Awaited<ReturnType<typeof fetchVehicle>>;
  CLOUD_NAME: string;
}

export async function loader ({ request, params }: LoaderArgs) {
  await requireUser(request);

  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
  const UPLOAD_RESET = process.env.CLOUDINARY_UPLOAD_RESET || "";

  const result = await PositiveIntSchema.safeParseAsync(params.id);
  if (!result.success) {
    throw new Response("Invalid vehicle ID", { status: 400 });
  }
  const vehicleId = result.data;

  const vehicle = await fetchVehicle(vehicleId);
  if (!vehicle) {
    throw new Response("Vehicle record not found", { status: 404 });
  }

  return json({ vehicle, CLOUD_NAME, UPLOAD_RESET });
}

interface ActionData {
  updatedVehicle: Awaited<ReturnType<typeof fetchVehicle>>;
}

export async function action ({ request, params }: ActionArgs) {
  await requireUser(request);

  const result = await PositiveIntSchema.safeParseAsync(params.id);
  if (!result.success) {
    throw new Error("Invalid vehicle ID");
  }
  const vehicleId = result.data;

  const form = await request.formData();
  if (form.get("_method") === "delete") {
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });
    return redirect("/vehicles");
  }

  return redirect("/vehicles");
}

export default function VehiclePage () {
  const { vehicle: initialVehicle, CLOUD_NAME } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;

  const vehicle = actionData?.updatedVehicle || initialVehicle!;

  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";

  const {
    confirmDeleteIsOpen, handleDeleteSubmit,
    onConfirmDelete, onCloseConfirmDelete, cancelDeleteRef
  } = useDelete();

  return (
    <VStack key={vehicle.id} align="stretch" py={8} maxW={{ base: "100%", md: "80%", lg: "60%" }}>
      <DeleteConfirmation
        identifier="Vehicle"
        isOpen={confirmDeleteIsOpen}
        isDeleting={isSubmitting}
        onConfirm={onConfirmDelete}
        onCancel={onCloseConfirmDelete}
        cancelRef={cancelDeleteRef}
      />
      <VStack align="stretch" spacing={8}>
        <Card>
          <CardSection>
            <Stack direction={{ base: "column", lg: "row" }} align={{ base: "flex-start", lg: "center" }} spacing={4}>
              <VStack align="center">
                <Breadcrumb spacing='8px' separator={<ChevronRight />}>
                  <BreadcrumbItem color="purple.600">
                    <BreadcrumbLink as={Link} to="/vehicles">
                      <Text fontSize="md" fontWeight="bold">Vehicles</Text>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </Breadcrumb>
              </VStack>
              <Spacer />
              <Link to={`/vehicles/${vehicle.id}/edit`}>
                <PrimaryButton isDisabled={isSubmitting}>
                  Edit
                </PrimaryButton>
              </Link>
              <Form onSubmit={handleDeleteSubmit} method="post">
                <input type="hidden" name="_method" value="delete" />
                <PrimaryButton type="submit" colorScheme="red" w="100%" isDisabled={isSubmitting}>
                  Delete
                </PrimaryButton>
              </Form>
            </Stack>
          </CardSection>
          <CardSection>
            <Stack direction={{ base: "column", lg: "row" }} align="flex-start" spacing={4}>
              <VStack align="flex-start" spacing={6}>
                <Text fontSize="sm">
                  {`Name: `}<b>{vehicle.fullName}</b>
                </Text>
                <Text fontSize="sm">
                  {`Phone #: `}<b>{vehicle.phoneNumber}</b>
                </Text>
                <Text fontSize="sm">
                  {`Make and Model: `}<b>{vehicle.makeAndModel}</b>
                </Text>
                <Text fontSize="sm">
                  {`VIN: `}<b>{vehicle.vin}</b>
                </Text>
                <Text fontSize="sm">
                  {`License #: `}<b>{vehicle.licenseNumber}</b>
                </Text>
              </VStack>
              <Spacer />
              {Boolean(vehicle.image) && (
                <VStack maxW={{ base: "100%", lg: "50%" }} align="stretch">
                  <AdvancedImage
                    cldImg={cloudinaryImages(CLOUD_NAME).getThumbnail(vehicle.image)}
                    plugins={[placeholder({ mode: 'blur' })]}
                  />
                </VStack>
              )}
              {!vehicle.image && (
                <Img boxSize='400px' src={placeholderImage} alt={vehicle.makeAndModel} />
              )}
            </Stack>
          </CardSection>
        </Card>
      </VStack>
    </VStack>
  );
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