import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/db.server";
import { badRequest, DateSchema, PositiveIntSchema } from "~/lib/core.validations";

const Schema = z.object({
  vehicleId: PositiveIntSchema,
  dateTime: DateSchema,
});

export async function action ({ request, params }: ActionArgs) {
  const formData = await request.formData();
  const fields = Object.fromEntries(formData.entries());

  const result = await Schema.safeParseAsync(fields);
  if (!result.success) {
    const { formErrors, fieldErrors } = result.error.flatten();
    return badRequest({ fields, fieldErrors, formError: formErrors.join(", ") });
  }
  const { vehicleId, dateTime } = result.data;

  const flag = await prisma.flag.create({
    data: {
      vehicleId,
      dateTime,
    }
  });

  return json({ flag });
}