# Swisstek virtual showroom, working samples

Artslab Creatives. Concept demonstration for Swisstek (Ceylon) PLC.
This is the **hosted build**, served as a static site from GitHub Pages.

## What is here

```
index.html                    swisstekceylon.com homepage, rebuilt near-replica
showroom/index.html           Pitch microsite: choose one of three routes
showroom/direction-01.html    Luxury 360 category showroom, ten spaces
showroom/direction-02.html    Product-focused 360 showroom, ten spaces, with
                              39 of Swisstek's own films playing inside the room
showroom/direction-03.html    Real-time 3D configurator, four rooms
assets/js/tour.js             Shared ten-space tour engine for 01 and 02
assets/js/gate.js             Passphrase gate and the attribution line
```

The homepage follows the real swisstekceylon.com section by section: their three
hero headlines, Welcome to SWISSTEK, the Finishing / Cleaning / Beautification
collections, Tiler Club, Latest News, testimonials, and their navigation
including Aluminium and Downloadables. Copy is theirs, quoted not paraphrased.

Direction 03 has four rooms: living space, bathroom, kitchen and terrace. Each
carries the same live material configurator, so a grout or floor change applies
across whichever room you are standing in.

The 360 tour covers ten spaces: entrance atrium, tile installation, wet area, wall
finishing, Swissparkett flooring, Roof Master, decorative pebbles, aluminium
architectural, aluminium hardware, and the specification desk. Directions 01 and
02 walk the same ten spaces on the same engine; 01 leads with collections, 02
leads with individual products.

## The passphrase

The site opens behind a passphrase so a forwarded link does not drop a stranger
straight into the showroom. The current phrase, and the steps to change it or
switch it off, are in the comment block at the top of `assets/js/gate.js`.

This is a courtesy lock, not security. These are public files on a static host,
so anyone who reads the page source or requests an asset directly can reach the
content without ever seeing the lock screen. It stops casual forwarding and
nothing more. Do not put anything confidential behind it.

## Updating the site

Edit, commit, push. GitHub Pages rebuilds in under a minute. There is no build
step: it is plain HTML, CSS and JavaScript, and three.js is already bundled at
`assets/vendor/three.min.js`.

## How this differs from the offline zip

The offline build inlines every panorama as a base64 data URL, because Chrome
treats a `file://` image as cross-origin, refuses to upload it to the GPU, and
would leave the 360 spheres black. Served over HTTP none of that applies, so
this build drops the two data URL bundles and loads the `.webp` panoramas
normally. Same pixels, about 2.5 MB less to download, and the images now cache
properly between pages. Direction 03 was checked pixel for pixel against the
offline build to confirm its image-based lighting still loads.

## What is real and what is not

**Real, from Swisstek's own catalogue and website:**

- All product photography in product cards, from the swisstekceylon.com media library
- The Swisstek Aluminium range: four categories, 32 product names and the sliding
  system names, from swisstekaluminium.com
- The homepage copy, collections, news headlines and testimonials, quoted from
  swisstekceylon.com
- The official logo lockup
- Product names, pack sizes, and the C2 / C2T / CG2WA and SLS 1375 / 1376 standards
- All 25 Tile Grout shade names and numeric codes
- The 12 SW-101 epoxy shade names and EX-G codes, kept as a separate range
- The six Swissparkett timber species
- Company history, certifications and addresses

**Generated concept visualisation, labelled as such in the interface:**

- The showroom environments in Directions 01 and 02. These were generated with the
  real pack shots supplied as image references, so the packaging resembles Swisstek's
  but is NOT exact and printed text on it is not readable product text. Every product
  card uses the real photograph instead.
- The interior photography on the homepage
- The lighting environment used by Direction 03

**Indicative, not measured:**

- Grout swatch colours are sampled from the printed catalogue chart. The
  catalogue itself says actual colours may vary.
- Swissparkett tones are approximations, not finish samples.
- Tile finishes are generic. Swisstek does not manufacture tiles, and this is
  marked in the source so nobody reads them as a Swisstek range.

**Two things to raise with the client:** the catalogue spells two shades
AVACADO GREEN and COBLAT BLUE, reproduced here as printed. And the SW-101 page
text claims 25 colours while the chart shows 12.

## The films

Direction 02 plays 39 films that are Swisstek's own, taken from the two official
channels: Swisstek Ceylon PLC and Swisstek Aluminium. Every video id was checked
against YouTube before it was wired in, and each entry stores the exact
published title alongside the short label shown in the interface, so no product
name in the film library is invented.

Four ranges have no film on either channel: Swissparkett wooden flooring,
general purpose silicone, Roof Master roofing and decorative pebbles. Those are
left empty on purpose and the panel says so rather than borrowing a film from a
neighbouring product.

Playback needs an internet connection. Without one the player shows a branded
panel saying so, with a direct link to the film on YouTube. Everything else in
the showroom works offline.

## Rebuilding

The three.js bundle at `assets/vendor/three.min.js` is built with esbuild from
`three` 0.185.1. Do not concatenate three.js by hand; it imports across module
scopes and will throw a duplicate declaration error.
