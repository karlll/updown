# Sizing rules

## Invariant

- All content on a slide should have a size that fits in the browser area, so no scrolling should be required, either vertical nor horizontal 

## Behavior, text

- Text and graphics should scale so that they fit the parent container
- Text have a maximum size, which is the size set by the theme
- When scaling text to fit, the size should decrease
- There is no lower limit to the size of the text when scaled
- Headlines level 1 and 2 (h1, h2) should not be scaled (other headlines should scale)

## Behavior, graphics (SVG)

- SVGs from Mermaid, PlantUML and Excalidraw shold also scale according to the above
- A viewbox for a SVG from the above tools should be adapted so that it completely fills its parent container.
