import { render } from "preact";
import * as fabric from "fabric";
import { App } from "./app";
import { TooltipProvider } from "./components/ui/tooltip";
import "./styles.css";

// Fabric v6 drops unknown properties on serialize, and `canvas.toJSON()` takes
// no argument list any more. Registering `fieldName` here is what makes it
// survive every save and reload, without touching the toJSON call sites.
// `fit` is how an imported image refits on resize (see Fit in resize.ts);
// `selectable`/`evented` keep a locked backdrop locked after a reload.
fabric.FabricObject.customProperties = ["fieldName", "fit", "selectable", "evented"];

render(
  <TooltipProvider>
    <App />
  </TooltipProvider>,
  document.getElementById("app")!
);
