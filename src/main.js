import sketch from 'sketch';
import { objFromArr } from './utils';

export default function() {
  const document = sketch.Document.getSelectedDocument();
  const colors = document.colors;
  const symbolsMaster = document.getSymbols();

  const populateTheme = () => {
    const theme = {};

    const colorsUpdated = objFromArr(colors);
    const themeUpdated = {
      colors: colorsUpdated,
      components: nestObject(generatePathOfKeys(symbolsMaster)),
    };

    const spreadTheme = { ...theme, ...themeUpdated };
    return JSON.stringify(spreadTheme);
  };

  const generatePathOfKeys = symbols => {
    // Takes a string such as "Button/Primary/Default" and parses it into button.primary.default.
    const mappedSymbols = symbols.map(symbol => {
      const nameToObjectPath = symbol.name.toLowerCase().replace(/\//g, '.');
      return nameToObjectPath;
    });

    return mappedSymbols.toString();
  };

  const nestObject = path => {
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

  console.log('THEME -----------------------------------------------------', populateTheme());

  sketch.UI.message('Copied your theme to clipboard 🎨!');
}
