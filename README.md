# use-clamp-text

![Bundle Size](https://badgen.net/bundlephobia/minzip/use-clamp-text) ![npm version](https://badgen.net/npm/v/use-clamp-text) ![types](https://badgen.net/npm/types/use-clamp-text) ![visitor badge](https://visitor-badge.glitch.me/badge?page_id=use-clamp-text)

react hook to clamp multiline text to a given height in a responsive way and with extreme flexibility _(under 2.5kb)_

[Line Clampin’ (Truncating Multiple Line Text)](https://css-tricks.com/line-clampin/) is a major hassle still for most browsers.

This tiny react hook eases that pain.

## Why hook?

Cause it gives extreme flexibility over how you want to control the text. Do you want truncate it or not? When to truncate it? How to show read more interactions? and more...

## Usage

### Basic Example

```js
import { useClampText } from 'use-clamp-text';

const longText = "Spicy jalapeno bacon ipsum dolor amet drumstick sirloin chuck shankle. Flank ribeye pancetta andouille ham hock. Turkey cow tenderloin landjaeger filet mignon hamburger. Pig tail strip steak pastrami t-bone venison bresaola biltong corned beef drumstick pork hamburger tri-tip. Tongue ham hock corned beef tri-tip meatball t-bone fatback andouille sirloin chuck jowl biltong pastrami. Ham hock ground round landjaeger tail strip steak. Ham sirloin pork loin salami spare ribs. Jerky cow short ribs ground round. Hamburger porchetta shankle meatloaf shank.";

function ClampedText {
const [ref, { noClamp, clampedText }] = useClampText({
  text: longText,
});

  return (
    <section>
      <h1>
        {noClamp ? 'Not truncated' : 'Truncated'}
      </h1>
      <div ref={ref}>
        {clampedText}
      </div>
    </section>
  );
}
```

### Advanced Example

[Check out the codesandbox example](https://codesandbox.io/s/xenodochial-hoover-ty3u49?file=/src/App.js)

## API Reference

### Arguments

The hook accepts only a single object argument is accepted with the following properties:

| property  | type               | required | default | description                                                                                                                                                        |
| --------- | ------------------ | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| text      | `string`           | `true`   |         | Text you wish to clamp                                                                                                                                             |
| ellipsis  | `string \| number` | `false`  | `'…'`   | String displayed after the clamped text or number of characters to be trimmed off the string (useful for adding inline custom ellipsis like a `<a>` or `<button>`) |
| expanded  | `boolean`          | `false`  | `false` | To control whether the string should be truncated or not                                                                                                           |
| lines     | `number`           | `false`  | `3`     | Number of visible lines                                                                                                                                            |
| debounce  | `number`           | `false`  | `300`   | Time in milliseconds used for debounce                                                                                                                             |
| charWidth | `number`           | `false`  | `1.2`   | Character width to be assumed for calculating clamped string length (an average depending on your font size should work well enough)                               |

### Return

The hook returns a tuple -

- [0] (first element) - `React.MutableRefObject<HTMLElement | null>` - a ref to attach to the element where the clamped text will be rendered
- [1] (second element) - `Object` - The properties of the object are documented in the table below

| property    | type      | description                                                                                                            |
| ----------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| noClamp     | `boolean` | Whether the text is clamped or not. Will return true if not clamped                                                    |
| clampedText | `string`  | The string to be rendered                                                                                              |
| key         | `string`  | A key to attach to the element that contains the string to be rendered (only needed when using custom inline ellipsis) |

## Prior Art (packages I ~~copied~~ adapted code from)

- [`react-clamp-lines`](https://github.com/zoltantothcom/react-clamp-lines)
- [`nanoclamp`](https://github.com/microlinkhq/nanoclamp)
