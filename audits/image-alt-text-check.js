import {Audit} from 'lighthouse';

class ImageAltTextCheck extends Audit {
    
  static get meta() {
    return {
      id: 'image-alt-text-check', // Same ID as the default audit to override it
      title: '<img> elements have meaningful alt attributes and matching language',
      failureTitle: '<img> elements do not have meaningful alt attributes or matching language',
      description: 'Ensures that <img> elements have meaningful alt attributes and that the language of the alt text matches the declared HTML language.',
      requiredArtifacts: ['ImageElements', 'MetaElements'],
      group: 'a11y-best-practices'
    };
  }

  static audit(artifacts) {
    // Artifacts requested in requiredArtifacts above are passed to your audit.
    // See the "API -> Plugin Audits" section below for what artifacts are available.
    const images = artifacts.ImageElements;
    const metaElements = artifacts.MetaElements || [];
    const totalImages = images.length;
    let totalVisibleImages = 0;
    const languageFailures = [];

    const htmlLangMeta = metaElements.find(meta => meta.name === 'html-lang');
    const pageLang = htmlLangMeta ? htmlLangMeta.content : 'bn';

    const missingAltImages = [];
    const languageMismatchImages = [];

    for (const image of images) {
        if (!isElementVisible(image)) {
            continue;
        }
        totalVisibleImages++;
        // console.log("image: ", image);
        var altText = image.node.nodeLabel;
        if (isActualText(altText)) {
            const detectedAltLang = detectLanguage(altText); // Custom language detection function
            // console.log(altText, " =================> detectedAltLang: ", detectedAltLang);
            if (detectedAltLang !== pageLang) {
                let nodeSnippet = image.node.snippet;
                languageMismatchImages.push({
                  node: { type: 'node', snippet: nodeSnippet },
                  altText,
                  expectedLanguage: pageLang,
                  detectedLanguage: detectedAltLang
                });
            }
        }
        else {
            let nodeSnippet = image.node.snippet;
            // console.log("image: ", image, image.src);
            // console.log("nodeSnippet: ", nodeSnippet);
            let imageSrc = image.src;
            missingAltImages.push({ node: { type: 'node', snippet: nodeSnippet }, imageSrc });
        }
    }
    // console.log("count: ", totalVisible, "totalImages: ", totalImages);
    // console.log("missingAltImages: ", missingAltImages);
    // const catImages = images.filter(image => image.src.toLowerCase().includes('cat'));

    // return {
    //   // Give users a 100 if they had a cat image, 0 if they didn't.
    //   score: catImages.length > 0 ? 1 : 0,
    //   // Also return the total number of cat images that can be used by report JSON consumers.
    //   numericValue: catImages.length,
    // };

    if (totalVisibleImages === 0) {
        return {
          score: null,
          notApplicable: true,
          explanation: 'No visible images found on the page.',
        };
      }

    return {
        score: missingAltImages.length === 0 && languageMismatchImages.length === 0 ? 1 : 0,
        details: {
          type: 'table',
          headings: [
            { key: 'type', itemType: 'text', text: 'Issue Type' },
            { key: 'snippet', itemType: 'code', text: 'Element' },
            { key: 'altText', itemType: 'text', text: 'Alt Text (if any)' },
            { key: 'expectedLanguage', itemType: 'text', text: 'Expected Language' },
            { key: 'detectedLanguage', itemType: 'text', text: 'Detected Language' }
          ],
          items: [
            ...missingAltImages.map(img => ({
              type: 'Missing Alt Text',
              snippet: img.node.snippet,
              altText: 'N/A',
              expectedLanguage: 'N/A',
              detectedLanguage: 'N/A'
            })),
            ...languageMismatchImages.map(img => ({
              type: 'Language Mismatch',
              snippet: img.node.snippet,
              altText: img.altText,
              expectedLanguage: img.expectedLanguage,
              detectedLanguage: img.detectedLanguage
            }))
          ]
        }
      };

  }
}

const LANGUAGE_RANGES = {
  pk: {
    name: 'Urdu',
    ranges: [
      [0x0600, 0x06FF],
      [0x0750, 0x077F]
    ],
    additional_chars: ['\u0679', '\u0688', '\u0691', '\u06BA', '\u06BE', '\u06C1', '\u06C2', '\u06C3', '\u06D2', '\u06D3']
  },
  in: { name: 'Hindi (Devanagari)', ranges: [[0x0900, 0x097F]] },
  gr: { name: 'Greek', ranges: [[0x0370, 0x03FF]] },
  eg: { name: 'Arabic', ranges: [[0x0600, 0x06FF], [0x0750, 0x077F]] },
  dz: { name: 'Arabic (MSA - Algeria)', ranges: [[0x0600, 0x06FF], [0x0750, 0x077F]] },
  bn: { name: 'Bangla', ranges: [[0x0980, 0x09FF]] },
  kr: { name: 'Korean', ranges: [[0xAC00, 0xD7AF]] },
  jp: { name: 'Japanese', ranges: [[0x3040, 0x309F], [0x30A0, 0x30FF], [0x4E00, 0x9FFF]] },
  il: { name: 'Hebrew', ranges: [[0x0590, 0x05FF]] },
  th: { name: 'Thai', ranges: [[0x0E00, 0x0E7F]] },
  ru: { name: 'Russian', ranges: [[0x0400, 0x04FF]] },
  lk: { name: 'Sinhala', ranges: [[0x0D80, 0x0DFF]] },
  mm: { name: 'Burmese', ranges: [[0x1000, 0x109F]] },
  hk: { name: 'Cantonese', ranges: [[0x4E00, 0x9FFF]] },
  ge: { name: 'Georgian', ranges: [[0x10A0, 0x10FF], [0x2D00, 0x2D2F]] },
  cn: {
    name: 'Mandarin',
    ranges: [
      [0x4E00, 0x9FFF],
      [0x3400, 0x4DBF],
      [0x20000, 0x2A6DF],
      [0x2A700, 0x2B73F]
    ]
  }
};

function detectLanguage(text) {
  for (const [code, langData] of Object.entries(LANGUAGE_RANGES)) {
    const { ranges, additional_chars = [] } = langData;

    for (const char of text) {
      const codePoint = char.codePointAt(0);

      // Check unicode range
      const inRange = ranges.some(([start, end]) => codePoint >= start && codePoint <= end);
      if (inRange) return code;

      // Check additional characters (if any)
      if (additional_chars.includes(char)) return code;
    }
  }

  return 'unknown';
}


function isActualText(nodeLabel) {
    // List of common structural elements
    const nonTextElements = new Set([
        'div', 'span', 'section', 'article', 'aside', 'footer', 'header', 'nav', 'ul', 'li', 
        'ol', 'table', 'tbody', 'thead', 'tr', 'td', 'th', 'dl', 'dt', 'dd', 'form', 'fieldset', 
        'legend', 'label', 'button', 'input', 'select', 'textarea', 'iframe', 'canvas', 'svg', 'img'
    ]);

    if (!nodeLabel || typeof nodeLabel !== 'string') {
        return false; // Not a valid text label
    }

    // Check if it's an HTML structure (contains > which indicates DOM path)
    if (nodeLabel.includes('>')) {
        return false;
    }

    // Split words and check if most of them are non-HTML elements
    const words = nodeLabel.split(/\s+/); // Split on spaces
    const nonElementWords = words.filter(word => !nonTextElements.has(word.toLowerCase()));

    // If the majority of words are NOT HTML elements, assume it's real text
    return nonElementWords.length >= words.length / 2;
}

function isElementVisible(element) {
    if (!element || typeof element !== 'object') return false;

    const { displayedWidth, displayedHeight, clientRect, computedStyles, isCss } = element;

    // Check if element has non-zero width & height
    if (displayedWidth <= 0 || displayedHeight <= 0) return false;

    // Check if bounding rectangle is valid
    if (
        clientRect.top === 0 &&
        clientRect.bottom === 0 &&
        clientRect.left === 0 &&
        clientRect.right === 0
    ) {
        return false;
    }

    // Check computed styles for visibility
    if (computedStyles) {
        if (computedStyles.display === 'none' || computedStyles.visibility === 'hidden') {
            return false;
        }
    }

    // Ensure it's not just a CSS background image
    if (isCss) return false;

    return true;
}

export default ImageAltTextCheck;
