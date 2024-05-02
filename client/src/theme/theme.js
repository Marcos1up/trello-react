import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        margin: 0,
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.3rem",
        fontSize: "14px",
      },
      // Específico para títulos: h1, h2, h3, etc.
      h1: {},
      h2: {},
      // Específico para párrafos
      p: {},
      // Puedes continuar definiendo estilos para otros elementos HTML...
    },
  },

  colors: {
    brand: {
      bg100: "#fffefb",
      bg200: "#f5f4f1",
      bg300: "#cccbc8",

      primary100: "#d4eaf7",
      primary200: "#b6ccd8",
      primary300: "#3b3c3d",

      accent100: "#71c4ef",
      accent200: "#00668c",

      text100: "#1d1c1c",
      text200: "#313d44",
    },
  },

  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === "dark" ? "brand.600" : "brand.500",
          color: "white",
        }),
      },
      defaultProps: {
        size: "md",
        variant: "solid",
      },
    },
  },
});

export default theme;
