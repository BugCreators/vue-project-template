module.exports = {
  presets: [
    "@vue/cli-plugin-babel/preset",
    [
      "@babel/preset-env",
      {
        useBuiltIns: "entry",
        corejs: 3,
      },
    ],
  ],

  plugins: [
    [
      "component",
      {
        libraryName: "element-ui",
        styleLibraryName: "~src/assets/theme",
      },
    ],
  ],
};
