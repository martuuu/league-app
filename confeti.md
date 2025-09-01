skip to:contentpackage searchsign in
❤
Pro
Teams
Pricing
Documentation
npm
Search packages
Search
canvas-confetti
DefinitelyTyped icon, indicating that this package has TypeScript declarations provided by the separate @types/canvas-confetti package
1.9.3 • Public • Published a year ago
Canvas Confetti
github actions ci jsdelivr npm-downloads npm-version

Demo
catdad.github.io/canvas-confetti

Install
You can install this module as a component from NPM:

npm install --save canvas-confetti
You can then require('canvas-confetti'); to use it in your project build. Note: this is a client component, and will not run in Node. You will need to build your project with something like webpack in order to use this.

You can also include this library in your HTML page directly from a CDN:

<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
Note: you should use the latest version at the time that you include your project. You can see all versions on the releases page.

Reduced Motion
Thank you for joining me in this very important message about motion on your website. See, not everyone likes it, and some actually prefer no motion. They have ways to tell us about it and we should listen. While I don't want to go as far as tell you not to have confetti on your page just yet, I do want to make it easy for you to respect what your users want. There is a disableForReducedMotion option you can use so that users that have trouble with chaotic animations don't need to struggle on your website. This is disabled by default, but I am considering changing that in a future major release. If you have strong feelings about this, please let me know. For now, please confetti responsibly.

API
When installed from npm, this library can be required as a client component in your project build. When using the CDN version, it is exposed as a confetti function on window.

confetti([options {Object}]) → Promise|null
confetti takes a single optional object. When window.Promise is available, it will return a Promise to let you know when it is done. When promises are not available (like in IE), it will return null. You can polyfill promises using any of the popular polyfills. You can also provide a promise implementation to confetti through:

const MyPromise = require('some-promise-lib');
const confetti = require('canvas-confetti');
confetti.Promise = MyPromise;
If you call confetti multiple times before it is done, it will return the same promise every time. Internally, the same canvas element will be reused, continuing the existing animation with the new confetti added. The promise returned by each call to confetti will resolve once all animations are done.

options
The confetti parameter is a single optional options object, which has the following properties:

particleCount Integer (default: 50): The number of confetti to launch. More is always fun... but be cool, there's a lot of math involved.
angle Number (default: 90): The angle in which to launch the confetti, in degrees. 90 is straight up.
spread Number (default: 45): How far off center the confetti can go, in degrees. 45 means the confetti will launch at the defined angle plus or minus 22.5 degrees.
startVelocity Number (default: 45): How fast the confetti will start going, in pixels.
decay Number (default: 0.9): How quickly the confetti will lose speed. Keep this number between 0 and 1, otherwise the confetti will gain speed. Better yet, just never change it.
gravity Number (default: 1): How quickly the particles are pulled down. 1 is full gravity, 0.5 is half gravity, etc., but there are no limits. You can even make particles go up if you'd like.
drift Number (default: 0): How much to the side the confetti will drift. The default is 0, meaning that they will fall straight down. Use a negative number for left and positive number for right.
flat Boolean (default: false): Optionally turns off the tilt and wobble that three dimensional confetti would have in the real world. Yeah, they look a little sad, but y'all asked for them, so don't blame me.
ticks Number (default: 200): How many times the confetti will move. This is abstract... but play with it if the confetti disappear too quickly for you.
origin Object: Where to start firing confetti from. Feel free to launch off-screen if you'd like.
origin.x Number (default: 0.5): The x position on the page, with 0 being the left edge and 1 being the right edge.
origin.y Number (default: 0.5): The y position on the page, with 0 being the top edge and 1 being the bottom edge.
colors Array<String>: An array of color strings, in the HEX format... you know, like #bada55.
shapes Array<String|Shape>: An array of shapes for the confetti. There are 3 built-in values of square, circle, and star. The default is to use both squares and circles in an even mix. To use a single shape, you can provide just one shape in the array, such as ['star']. You can also change the mix by providing a value such as ['circle', 'circle', 'square'] to use two third circles and one third squares. You can also create your own shapes using the confetti.shapeFromPath or confetti.shapeFromText helper methods.
scalar Number (default: 1): Scale factor for each confetti particle. Use decimals to make the confetti smaller. Go on, try teeny tiny confetti, they are adorable!
zIndex Integer (default: 100): The confetti should be on top, after all. But if you have a crazy high page, you can set it even higher.
disableForReducedMotion Boolean (default: false): Disables confetti entirely for users that prefer reduced motion. The confetti() promise will resolve immediately in this case.
confetti.shapeFromPath({ path, matrix? }) → Shape
This helper method lets you create a custom confetti shape using an SVG Path string. Any valid path should work, though there are a few caveats:

All paths will be filed. If you were hoping to have a stroke path, that is not implemented.
Paths are limited to a single color, so keep that in mind.
All paths need a valid transform matrix. You can pass one in, or you can leave it out and use this helper to calculate the matrix for you. Do note that calculating the matrix is a bit expensive, so it is best to calculate it once for each path in development and cache that value, so that production confetti remain fast. The matrix is deterministic and will always be the same given the same path value.
For best forward compatibility, it is best to re-generate and re-cache the matrix if you update the canvas-confetti library.
Support for path-based confetti is limited to browsers which support Path2D, which should really be all major browser at this point.
This method will return a Shape -- it's really just a plain object with some properties, but shhh... we'll pretend it's a shape. Pass this Shape object into the shapes array directly.

As an example, here's how you might do a triangle confetti:

var triangle = confetti.shapeFromPath({ path: 'M0 10 L5 0 L10 10z' });

confetti({
  shapes: [triangle]
});
confetti.shapeFromText({ text, scalar?, color?, fontFamily? }) → Shape
This is the highly anticipated feature to render emoji confetti! Use any standard unicode emoji. Or other text, but... maybe don't use other text.

While any text should work, there are some caveats:

For flailing confetti, something that is mostly square works best. That is, a single character, especially an emoji.
Rather than rendering text every time a confetti is drawn, this helper actually rasterizes the text. Therefore, it does not scale well after it is created. If you plan to use the scalar value to scale your confetti, use the same scalar value here when creating the shape. This will make sure the confetti are not blurry.
The options for this method are:

options Object:
text String: the text to be rendered as a confetti. If you can't make up your mind, I suggest "🐈".
scalar Number, optional, default: 1: a scale value relative to the default size. It matches the scalar value in the confetti options.
color String, optional, default: #000000: the color used to render the text.
fontFamily String, optional, default: native emoji: the font family name to use when rendering the text. The default follows best practices for rendring the native OS emoji of the device, falling back to sans-serif. If using a web font, make sure this font is loaded before rendering your confetti.
var scalar = 2;
var pineapple = confetti.shapeFromText({ text: '🍍', scalar });

confetti({
  shapes: [pineapple],
  scalar
});
confetti.create(canvas, [globalOptions]) → function
This method creates an instance of the confetti function that uses a custom canvas. This is useful if you want to limit the area on your page in which confetti appear. By default, this method will not modify the canvas in any way (other than drawing to it).

Canvas can be misunderstood a bit though, so let me explain why you might want to let the module modify the canvas just a bit. By default, a canvas is a relatively small image -- somewhere around 300x150, depending on the browser. When you resize it using CSS, this sets the display size of the canvas, but not the image being represented on that canvas. Think of it as loading a 300x150 jpeg image in an img tag and then setting the CSS for that tag to 1500x600 -- your image will end up stretched and blurry. In the case of a canvas, you need to also set the width and height of the canvas image itself. If you don't want to do that, you can allow confetti to set it for you.

Note also that you should persist the custom instance and avoid initializing an instance of confetti with the same canvas element more than once.

The following global options are available:

resize Boolean (default: false): Whether to allow setting the canvas image size, as well as keep it correctly sized if the window changes size (e.g. resizing the window, rotating a mobile device, etc.). By default, the canvas size will not be modified.
useWorker Boolean (default: false): Whether to use an asynchronous web worker to render the confetti animation, whenever possible. This is turned off by default, meaning that the animation will always execute on the main thread. If turned on and the browser supports it, the animation will execute off of the main thread so that it is not blocking any other work your page needs to do. Using this option will also modify the canvas, but more on that directly below -- do read it. If it is not supported by the browser, this value will be ignored.
disableForReducedMotion Boolean (default: false): Disables confetti entirely for users that prefer reduced motion. When set to true, use of this confetti instance will always respect a user's request for reduced motion and disable confetti for them.
Important: If you use useWorker: true, I own your canvas now. It's mine now and I can do whatever I want with it (don't worry... I'll just put confetti inside it, I promise). You must not try to use the canvas in any way (other than I guess removing it from the DOM), as it will throw an error. When using workers for rendering, control of the canvas must be transferred to the web worker, preventing any usage of that canvas on the main thread. If you must manipulate the canvas in any way, do not use this option.

var myCanvas = document.createElement('canvas');
document.body.appendChild(myCanvas);

var myConfetti = confetti.create(myCanvas, {
  resize: true,
  useWorker: true
});
myConfetti({
  particleCount: 100,
  spread: 160
  // any other options from the global
  // confetti function
});
confetti.reset()
Stops the animation and clears all confetti, as well as immediately resolves any outstanding promises. In the case of a separate confetti instance created with confetti.create, that instance will have its own reset method.

confetti();

setTimeout(() => {
  confetti.reset();
}, 100);
var myCanvas = document.createElement('canvas');
document.body.appendChild(myCanvas);

var myConfetti = confetti.create(myCanvas, { resize: true });

myConfetti();

setTimeout(() => {
  myConfetti.reset();
}, 100);
Examples
Launch some confetti the default way:

confetti();
Launch a bunch of confetti:

confetti({
  particleCount: 150
});
Launch some confetti really wide:

confetti({
  spread: 180
});
Get creative. Launch a small poof of confetti from a random part of the page:

confetti({
  particleCount: 100,
  startVelocity: 30,
  spread: 360,
  origin: {
    x: Math.random(),
    // since they fall down, start a bit higher than random
    y: Math.random() - 0.2
  }
});
I said creative... we can do better. Since it doesn't matter how many times we call confetti (just the total number of confetti in the air), we can do some fun things, like continuously launch more and more confetti for 30 seconds, from multiple directions:

// do this for 30 seconds
var duration = 30 * 1000;
var end = Date.now() + duration;

(function frame() {
  // launch a few confetti from the left edge
  confetti({
    particleCount: 7,
    angle: 60,
    spread: 55,
    origin: { x: 0 }
  });
  // and launch a few from the right edge
  confetti({
    particleCount: 7,
    angle: 120,
    spread: 55,
    origin: { x: 1 }
  });

  // keep going until we are out of time
  if (Date.now() < end) {
    requestAnimationFrame(frame);
  }
}());
Readme
Keywords
canvasconfettianimationburstfireworkssnowparticles
Package Sidebar
Install
npm i canvas-confetti

Repository
github.com/catdad/canvas-confetti

Homepage
github.com/catdad/canvas-confetti#readme

Fund this package
Weekly Downloads
918,503

Version
1.9.3

License
ISC

Unpacked Size
92.3 kB

Total Files
6

Last publish
a year ago

Collaborators
kirilv
Try on RunKit
Report malware
Footer
Support
Help
Advisories
Status
Contact npm
Company
About
Blog
Press
Terms & Policies
Policies
Terms of Use
Code of Conduct
Privacy
