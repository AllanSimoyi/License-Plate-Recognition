import { Avatar, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { AdvancedImage, placeholder } from "@cloudinary/react";
import type { Vehicle } from "@prisma/client";
import { Link } from "@remix-run/react";
import { Card } from "~/components/Card";
import { CardSection } from "~/components/CardSection";
import { cloudinaryImages } from "~/lib/images";
import { useCloudinary } from "../CloudinaryContextProvider";

interface Props {
  vehicle: Vehicle;
}

export function VehicleListItem (props: Props) {
  const { vehicle } = props;
  const { CLOUDINARY_CLOUD_NAME } = useCloudinary();
  return (
    <Link to={`/vehicles/${vehicle.id}`}>
      <Card h="100%">
        <CardSection>
          <HStack>
            <Flex flexDirection="column" justify="center" align="center">
              {Boolean(vehicle.image) && (
                <AdvancedImage
                  cldImg={cloudinaryImages(CLOUDINARY_CLOUD_NAME).getUploadThumbnail(vehicle.image)}
                  plugins={[placeholder({ mode: 'blur' })]}
                />
              )}
              {!vehicle.image && (
                <Avatar name={vehicle.fullName} src={vehicle.image} />
              )}
            </Flex>
            <VStack align="flex-start" gap="1">
              <Text fontSize="md">
                <b>{vehicle.fullName}</b>
                <br />
                License #: {vehicle.licenseNumber}
              </Text>
            </VStack>
          </HStack>
        </CardSection>
        <CardSection noBottomBorder>
          <Text fontSize="md">
            {`Model: `}<b>{vehicle.makeAndModel}</b>
          </Text>
          <Text fontSize="md">
            {`License Number: `}<b>{vehicle.licenseNumber}</b>
          </Text>
          <Text fontSize="md">
            {`VIN: `}<b>{vehicle.vin}</b>
          </Text>
        </CardSection>
      </Card >
    </Link>
  )
}