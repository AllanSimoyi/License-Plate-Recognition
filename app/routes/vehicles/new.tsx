import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink, Text, VStack
} from '@chakra-ui/react';
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useCatch, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import * as React from "react";
import { ChevronRight } from 'tabler-icons-react';
import { z } from "zod";
import { ActionContextProvider } from "~/components/ActionContextProvider";
import { Card } from '~/components/Card';
import { CardSection } from "~/components/CardSection";
import { CustomAlert } from "~/components/CustomAlert";
import { CustomCatchBoundary } from "~/components/CustomCatchBoundary";
import { CustomErrorBoundary } from "~/components/CustomErrorBoundary";
import { PrimaryButton } from "~/components/PrimaryButton";
import { ScrollAnimateUp } from "~/components/ScrollAnimateUp";
import { TextField } from "~/components/TextField";
import { UploadImage } from '~/components/UploadImage';
import { prisma } from "~/db.server";
import { useUploadCloudinaryImage } from '~/hooks/useUploadCloudinaryImage';
import type { inferSafeParseErrors } from "~/lib/core.validations";
import { badRequest } from "~/lib/core.validations";
import { requireUser } from "~/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "License Plate Reader - Add Vehicle",
  };
};

export async function loader ({ request }: LoaderArgs) {
  await requireUser(request);
  return json({});
}

const Schema = z.object({
  image: z.string().min(0).max(800),
  fullName: z.string().min(1).max(255),
  phone: z.string(),
  makeAndModel: z.string().min(1).max(255),
  vin: z.string().min(1).max(255),
  licenseNumber: z.string().min(1).max(255),
})

type Fields = z.infer<typeof Schema>;
type FieldErrors = inferSafeParseErrors<typeof Schema>;
type ActionData = {
  formError?: string
  fields?: Fields
  fieldErrors?: FieldErrors
};

export async function action ({ request, params }: ActionArgs) {
  await requireUser(request);

  const formData = await request.formData();
  const fields = Object.fromEntries(formData.entries());

  const result = await Schema.safeParseAsync(fields);
  if (!result.success) {
    const { formErrors, fieldErrors } = result.error.flatten();
    return badRequest({ fields, fieldErrors, formError: formErrors.join(", ") });
  }
  const { image, fullName, phone, makeAndModel, vin, licenseNumber } = result.data;

  await prisma.vehicle.create({
    data: {
      image,
      fullName,
      phoneNumber: phone,
      makeAndModel,
      vin,
      licenseNumber,
    }
  });

  return redirect(`/vehicles`);
}

export default function AddVehicle () {
  useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionData>();
  const isProcessing = !!fetcher.submission;

  const defaultValues: Fields = {
    image: "",
    fullName: "",
    phone: "",
    makeAndModel: "",
    vin: "",
    licenseNumber: "",
  }

  const image = useUploadCloudinaryImage({
    initialPublicId: "",
  });

  return (
    <VStack justify={"center"} align="stretch" maxW={{ base: "100%", md: "80%", lg: "40%" }}>
      <ScrollAnimateUp delay={0.25}>
        <fetcher.Form method="post">
          <ActionContextProvider
            fields={fetcher.data?.fields || defaultValues}
            fieldErrors={fetcher.data?.fieldErrors}
            formError={fetcher.data?.formError}
            isSubmitting={isProcessing}
          >
            <Card>
              <CardSection py={2}>
                <VStack align="flex-start" py={4}>
                  <Breadcrumb spacing='8px' separator={<ChevronRight />}>
                    <BreadcrumbItem color="purple.600">
                      <BreadcrumbLink as={Link} to="/vehicles">
                        Vehicles
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                      <Text>Add Record</Text>
                    </BreadcrumbItem>
                  </Breadcrumb>
                </VStack>
              </CardSection>
              {fetcher.data?.formError && (
                <CardSection noBottomBorder py={2}>
                  <ScrollAnimateUp delay={0.25}>
                    <CustomAlert status="error">
                      {fetcher.data.formError}
                    </CustomAlert>
                  </ScrollAnimateUp>
                </CardSection>
              )}
              <CardSection noBottomBorder py={6}>
                <input type="hidden" name="image" value={image.publicId} />
                <UploadImage {...image} identifier={"Image"} />
                <TextField
                  name="fullName"
                  label="Full Name"
                  placeholder="Full Name"
                />
                <TextField
                  name="phone"
                  label="Phone Number"
                  placeholder="Phone Number"
                />
                <TextField
                  name="makeAndModel"
                  label="Make And Model"
                  placeholder="Make And Model"
                />
                <TextField
                  name="vin"
                  label="Plate Number"
                  placeholder="Plate Number"
                />
                <TextField
                  name="licenseNumber"
                  label="License Number"
                  placeholder="License Number"
                />
              </CardSection>
              <CardSection noBottomBorder py={2}>
                <PrimaryButton type="submit" isDisabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Submit"}
                </PrimaryButton>
              </CardSection>
            </Card>
          </ActionContextProvider>
        </fetcher.Form>
      </ScrollAnimateUp>
    </VStack>
  )
}

export function CatchBoundary () {
  const caught = useCatch();
  const navigate = useNavigate();
  const reload = React.useCallback(() => {
    navigate('.', { replace: true })
  }, [navigate]);
  return <CustomCatchBoundary reload={reload} caught={caught} />
}

export function ErrorBoundary ({ error }: { error: Error }) {
  console.error(error);
  const navigate = useNavigate();
  const reload = React.useCallback(() => {
    navigate('.', { replace: true })
  }, [navigate]);
  return <CustomErrorBoundary reload={reload} error={error} />
}