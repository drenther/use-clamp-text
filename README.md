# use-clamp-text

![Bundle Size](https://badgen.net/bundlephobia/minzip/use-clamp-text) ![npm version](https://badgen.net/npm/v/use-clamp-text) ![types](https://badgen.net/npm/types/use-clamp-text) ![license](https://badgen.net/github/license/drenther/use-clamp-text)

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

| prop     | type      | required | default | description                                              |
| -------- | --------- | -------- | ------- | -------------------------------------------------------- |
| text     | `string`  | `true`   |         | Text you wish to clamp                                   |
| ellipsis | `string`  | `false`  | `'…'`   | String displayed after the clamped `text`                |
| expanded | `boolean` | `false`  | `false` | To control whether the string should be truncated or not |
| lines    | `number`  | `false`  | `3`     | Number of visible lines                                  |
| debounce | `number`  | `false`  | `300`   | Time in milliseconds used for debounce                   |

## Prior Art (packages I ~~copied~~ adapted code from)

- [`react-clamp-lines`](https://github.com/zoltantothcom/react-clamp-lines)
- [`nanoclamp`](https://github.com/microlinkhq/nanoclamp)
