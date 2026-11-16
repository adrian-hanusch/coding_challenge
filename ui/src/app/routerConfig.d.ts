import type { NavigateOptions } from 'react-router'

// Types `routerOptions` on HeroUI links, forwarded to react-router by RouterLinkProvider.
declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: NavigateOptions
  }
}
