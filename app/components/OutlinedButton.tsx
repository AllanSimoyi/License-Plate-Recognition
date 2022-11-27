import type { ButtonProps } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react"

interface Props extends ButtonProps { }

export function OutlinedButton (props: Props) {
  return (
    <Button size="sm" variant="outline" colorScheme="purple" {...props}>
      {props.children}
    </Button>
  )
}
