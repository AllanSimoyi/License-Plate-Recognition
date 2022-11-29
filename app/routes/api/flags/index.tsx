import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";

export async function loader (_: LoaderArgs) {
  try {
    const flags = await prisma.flag.findMany({
      include: { vehicle: true },
    });
    flags.slice(0, 5).forEach(flag => {
      console.log(JSON.stringify(flag));
    });

    return json({ flags });
  } catch ({ message }) {
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 200 });
  }
}