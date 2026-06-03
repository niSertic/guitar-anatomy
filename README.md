# Electric Guitar Anatomy

An interactive single-page website that lets you explore the anatomy of an
electric guitar — a Stratocaster-style instrument presented as an interactive
blueprint.

## Features

- **Interactive anatomy** — hover any component to highlight it; click to open a
  card explaining its function and tonal impact. A synced parts list lets you
  explore by name.
- **Signal path** — an animated schematic tracing how the signal flows from
  strings to amplifier, with an explanation at each stage.
- **How it works** — a concise explanation of the physics behind the instrument,
  from electromagnetic induction to amplification.
- **Specifications** — typical specs for a Stratocaster-style guitar.

## Tech stack

- HTML
- Tailwind CSS (via CDN)
- Vanilla JavaScript
- Inline SVG for the interactive guitar

No build step required.

## Running locally

Clone the repository and open `index.html` in a browser. For the best
experience (and because the page works best when served), use a local server —
for example the Live Server extension in VS Code, or:
python -m http.server
then visit the address shown.

## Credits

- Guitar illustration sourced from [OpenClipart](https://openclipart.org) and is
  in the **public domain**. It was restructured into labeled, individually
  selectable component groups for the interactive features in this project.
- Fonts: [Sora](https://fonts.google.com/specimen/Sora) and
  [Inter](https://fonts.google.com/specimen/Inter), via Google Fonts.

## License

"All rights reserved."