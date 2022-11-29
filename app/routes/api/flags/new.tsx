import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/db.server";
import { badRequest, DateSchema, PositiveIntSchema } from "~/lib/core.validations";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";

const Schema = z.object({
  vehicleId: PositiveIntSchema,
  dateTime: DateSchema,
});

export async function action ({ request, params }: ActionArgs) {
  try {
    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());

    const result = await Schema.safeParseAsync(fields);
    if (!result.success) {
      const { formErrors, fieldErrors } = result.error.flatten();
      console.log("formErrors", formErrors);
      console.log("fieldErrors", fieldErrors);
      return badRequest({ fields, fieldErrors, formError: formErrors.join(", ") });
    }
    const { vehicleId, dateTime } = result.data;

    const flag = await prisma.flag.create({
      data: {
        vehicleId,
        dateTime,
      },
      include: {
        vehicle: true,
      }
    });

    return json({ flag });
  } catch ({ message }) {
    console.log("Caught Error", message as string);
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 200 });
  }
}