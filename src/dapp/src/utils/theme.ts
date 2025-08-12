import { extendTheme, withDefaultColorScheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const colors = {
  brand: {
    50: "#f7f7f7",
    100: "#ededed",
    200: "#d1d1d1",
    300: "#b5b5b5",
    400: "#999999",
    500: "#7d7d7d",
    600: "#616161",
    700: "#454545",
    800: "#292929",
    900: "#0d0d0d",
  },
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },
  accent: {
    primary: "#000000",
    secondary: "#ffffff",
    hover: "#333333",
  }
};

const fonts = {
  heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const fontSizes = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
  "6xl": "3.75rem",
  "7xl": "4.5rem",
};

const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

const lineHeights = {
  normal: "normal",
  none: 1,
  shorter: 1.25,
  short: 1.375,
  base: 1.5,
  tall: 1.625,
  taller: 2,
};

const letterSpacings = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
};

const space = {
  px: "1px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem",
};

const radii = {
  none: "0",
  sm: "0.125rem",
  base: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
};

const shadows = {
  xs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  outline: "0 0 0 3px rgba(66, 153, 225, 0.6)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  none: "none",
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: "medium",
      borderRadius: "none",
      textTransform: "uppercase",
      letterSpacing: "wider",
      transition: "all 0.2s ease",
    },
    sizes: {
      sm: {
        fontSize: "xs",
        px: 4,
        py: 2,
      },
      md: {
        fontSize: "sm",
        px: 6,
        py: 3,
      },
      lg: {
        fontSize: "md",
        px: 8,
        py: 4,
      },
    },
    variants: {
      solid: {
        bg: "accent.primary",
        color: "accent.secondary",
        _hover: {
          bg: "accent.hover",
          transform: "translateY(-2px)",
          boxShadow: "lg",
        },
        _active: {
          transform: "translateY(0)",
        },
      },
      outline: {
        borderColor: "accent.primary",
        color: "accent.primary",
        borderWidth: "1px",
        _hover: {
          bg: "accent.primary",
          color: "accent.secondary",
          transform: "translateY(-2px)",
        },
      },
      ghost: {
        color: "accent.primary",
        _hover: {
          bg: "neutral.100",
        },
      },
    },
    defaultProps: {
      variant: "solid",
    },
  },
  Card: {
    baseStyle: ({ colorMode }: { colorMode: string }) => ({
      container: {
        borderRadius: "none",
        boxShadow: "sm",
        border: "1px solid",
        borderColor: colorMode === 'dark' ? 'gray.700' : 'neutral.200',
        bg: colorMode === 'dark' ? 'gray.800' : 'white',
        overflow: "hidden",
        transition: "all 0.3s ease",
        _hover: {
          boxShadow: "lg",
          transform: "translateY(-4px)",
        },
      },
    }),
  },
  Input: {
    baseStyle: ({ colorMode }: { colorMode: string }) => ({
      field: {
        borderRadius: "none",
        borderColor: colorMode === 'dark' ? 'gray.600' : 'neutral.300',
        bg: colorMode === 'dark' ? 'gray.700' : 'white',
        _hover: {
          borderColor: colorMode === 'dark' ? 'gray.500' : 'neutral.400',
        },
        _focus: {
          borderColor: "accent.primary",
          boxShadow: "0 0 0 1px var(--chakra-colors-accent-primary)",
        },
      },
    }),
  },
  Select: {
    baseStyle: ({ colorMode }: { colorMode: string }) => ({
      field: {
        borderRadius: "none",
        borderColor: colorMode === 'dark' ? 'gray.600' : 'neutral.300',
        bg: colorMode === 'dark' ? 'gray.700' : 'white',
        _hover: {
          borderColor: colorMode === 'dark' ? 'gray.500' : 'neutral.400',
        },
        _focus: {
          borderColor: "accent.primary",
          boxShadow: "0 0 0 1px var(--chakra-colors-accent-primary)",
        },
      },
    }),
  },
  Textarea: {
    baseStyle: ({ colorMode }: { colorMode: string }) => ({
      borderRadius: "none",
      borderColor: colorMode === 'dark' ? 'gray.600' : 'neutral.300',
      bg: colorMode === 'dark' ? 'gray.700' : 'white',
      _hover: {
        borderColor: colorMode === 'dark' ? 'gray.500' : 'neutral.400',
      },
      _focus: {
        borderColor: "accent.primary",
        boxShadow: "0 0 0 1px var(--chakra-colors-accent-primary)",
      },
    }),
  },
  Heading: {
    baseStyle: {
      fontWeight: "bold",
      letterSpacing: "tight",
    },
  },
  Text: {
    baseStyle: {
      lineHeight: "tall",
    },
  },
};

const styles = {
  global: ({ colorMode }: { colorMode: string }) => ({
    "html, body": {
      backgroundColor: colorMode === 'dark' ? 'gray.900' : 'neutral.50',
      color: colorMode === 'dark' ? 'gray.100' : 'neutral.900',
      lineHeight: "base",
      fontFamily: "body",
    },
    "*::placeholder": {
      color: colorMode === 'dark' ? 'gray.500' : 'neutral.400',
    },
    "*, *::before, &::after": {
      borderColor: colorMode === 'dark' ? 'gray.700' : 'neutral.200',
    },
  }),
};

const semanticTokens = {
  colors: {
    text: {
      default: "gray.900",
      _dark: "gray.100",
    },
    bg: {
      default: "neutral.50",
      _dark: "gray.900",
    },
    border: {
      default: "gray.200",
      _dark: "gray.700",
    },
    card: {
      default: "white",
      _dark: "gray.800",
    },
    hover: {
      default: "gray.50",
      _dark: "gray.700",
    },
    panel: {
      default: "white",
      _dark: "gray.800",
    },
    input: {
      default: "white",
      _dark: "gray.700",
    },
  },
};

const baseTheme = {
  config,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  space,
  radii,
  shadows,
  components,
  styles,
  semanticTokens,
};

export const sendTheme = extendTheme(baseTheme);
export const getTheme = extendTheme(baseTheme);

export const modernTheme = extendTheme(baseTheme);