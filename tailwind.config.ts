import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        shrine: "#B9965B",
        signal: "#E4572E",
        mist: "#F5F2EA",
        night: "#12151C"
      },
      boxShadow: {
        panel: "0 18px 50px rgba(18, 21, 28, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
