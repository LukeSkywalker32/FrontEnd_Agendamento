import "styled-components";
import type { lightTheme } from "./theme";

type ThemeType = typeof lightTheme;

declare module "styled-components" {
   export interface DefaultTheme extends ThemeType {}
}
