import sketch from 'sketch';
import { colorsArrToObj, fontsArrToObj } from './utils';
import { deepmerge } from './deepMerge';

export default function() {
  const document = sketch.Document.getSelectedDocument();
  const colors = document.colors;
  const symbols = document.getSymbols();
  const textStyles = document.sharedTextStyles;

  const createTheme = () => {
    const theme = {};

    const themeUpdated = {
      colors: colorsArrToObj(colors),
      fonts: mergeAllObjects(generateFonts(textStyles)),
      components: mergeAllObjects(generateComponents(symbols)),
    };

    const spreadTheme = { ...theme, ...themeUpdated };

    return spreadTheme;
  };

  const createPropertiesFromName = symbol => {
    // Takes a string such as "Button/Primary/Default" and parses it into button.primary.default.
    const properties = symbol.name.toLowerCase().replace(/\//g, '.');

    return properties.toString();
  };

  const createObjectFromProperties = path => {
    // Takes a button.primary.default, parse it into an array and nests all properties.
    // Ending up with:
    // button {
    //   primary {
    //     default: {}
    //   }
    // }

    const keysToBeNested = path.split('.').reverse();
    const nestedObject = keysToBeNested.reduce((prev, current) => ({ [current]: { ...prev } }), {});
    return nestedObject;
  };

  const generateComponents = () => {
    const components = symbols.map(symbol => {
      return createObjectFromProperties(createPropertiesFromName(symbol));
    });

    return components;
  };

  const generateFonts = textStyles => {
    const properties = textStyles.map(font => createPropertiesFromName(font));
    const propertiesWithoutColor = properties.map(property => property.substr(0, property.lastIndexOf('.')));

    const uniqueProperties = [...new Set(propertiesWithoutColor)];

    const fontStyles = uniqueProperties.map(font => createObjectFromProperties(font));

    return fontStyles;
  };

  const mergeAllObjects = objects => {
    if (objects.length > 1) {
      return deepmerge.all(objects);
    }

    return objects;
  };

  const traverseTree = () => {
    const theme = createTheme();
    const keys = Object.keys(theme.fonts);

    const getKeys = fontNames => {
      return fontNames.map(key => {
        //Get the font style names present in the theme.

        const checkForKeysInTextStyles = () => {
          // Filter by the textStyles that partially include our font style names.
          const test = textStyles.filter(style => {
            const textStylesNames = style.name.toLowerCase().replace(/\//g, '.');
            return textStylesNames.includes(key);
          });

          const THEMATCH = {
            fontSize: [...new Set(test.map(text => text.style.fontSize))].toString(),
            textTransform: [...new Set(test.map(text => text.style.textTransform))].toString(),
            kerning: [...new Set(test.map(text => text.style.kerning))].toString(),
            lineHeight: [...new Set(test.map(text => text.style.lineHeight))].toString(),
          };
          return THEMATCH;
        };

        // MUTATE THEME
        Object.assign(theme.fonts[key], checkForKeysInTextStyles());
      });
    };

    getKeys(keys);

    return JSON.stringify(theme);
  };

  console.log('THEME -----------------------------------------------------', traverseTree());

  sketch.UI.message('Copied your theme to clipboard 🎨!');
}
