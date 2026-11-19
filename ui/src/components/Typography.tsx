import { Typography as HeroTypography } from '@heroui/react'
import type { ComponentProps, JSX } from 'react'

type TypographyProps = ComponentProps<typeof HeroTypography> & { elementType?: keyof JSX.IntrinsicElements }

/**
 * HeroUI `Typography` with `elementType`, so the visual type and the HTML element can differ. HeroUI forwards the prop
 * to React Aria `Text` at runtime, only its type omits it.
 */
export function Typography(props: TypographyProps) {
  return <HeroTypography {...props} />
}
