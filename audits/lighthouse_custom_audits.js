import { Audit } from 'lighthouse';

const accessibilityChecks = [
  { id: 'button-name', title: 'Button elements have meaningful accessible names', artifact: 'DOM', failureMessage: 'Button is missing a meaningful name.' },
  { id: 'document-title', title: 'Document has a title', artifact: 'MetaElements', failureMessage: 'Page is missing a `<title>` element.' },
  { id: 'frame-title', title: 'Frame elements have titles', artifact: 'Accessibility', failureMessage: 'Frame is missing a `title` attribute.' },
  { id: 'image-alt', title: 'Images have meaningful alt attributes', artifact: 'ImageElements', failureMessage: 'Image is missing a meaningful `alt` attribute.' },
  { id: 'input-button-name', title: 'Input buttons have meaningful names', artifact: 'FormElements', failureMessage: 'Input button is missing a meaningful name.' },
  { id: 'input-image-alt', title: 'Input image elements have alt attributes', artifact: 'FormElements', failureMessage: 'Input image is missing a meaningful `alt` attribute.' },
  { id: 'label', title: 'Form elements have labels', artifact: 'Accessibility', failureMessage: 'Form element is missing a `<label>`.' },
  { id: 'link-name', title: 'Links have meaningful names', artifact: 'AnchorElements', failureMessage: 'Link is missing meaningful text or `aria-label`.' },
  { id: 'object-alt', title: 'Objects have alternative text', artifact: 'Accessibility', failureMessage: 'Object is missing alternative text.' },
  { id: 'select-name', title: 'Select elements have meaningful names', artifact: 'FormElements', failureMessage: 'Select element is missing a meaningful label.' },
  { id: 'summary-name', title: 'Summary elements have meaningful names', artifact: 'Accessibility', failureMessage: 'Summary element is missing a meaningful name.' },
  { id: 'svg-img-alt', title: 'SVG images have alternative text', artifact: 'Accessibility', failureMessage: 'SVG image is missing an accessible label.' },
  { id: 'video-caption', title: 'Videos have captions', artifact: 'Accessibility', failureMessage: 'Video is missing captions.' }
];

const audits = accessibilityChecks.map(({ id, title, artifact, failureMessage }) => {
    return class extends Audit {
        static get meta() {
            return {
                id: `${id}-check`,
                title: title,
                failureTitle: `${title} (Failure)`,
                description: `Ensures that ${title.toLowerCase()}.`,
                requiredArtifacts: [artifact],
                group: 'a11y-best-practices'
            };
        }

        static audit(artifacts) {
            // console.log("artifacts: ", artifacts);
            if (id== 'button-name') {
                console.log("artifacts: ", artifacts);
                return handleButtonName(artifacts);
            }
            
            else if (id== 'image-alt') {
                return handleImageAltText(artifacts);
            }
        };
    };
});

function handleButtonName(artifacts) {
    const violations = [];
    const elements = artifacts.DOM;
    console.log("elements: ", elements);
    // for (const button of elements) {
        // console.log("element: ", button);
    // }
    // elements.forEach(element => {
    //     console.log("element: ", element);
    // //   if (element.node.role === 'button' || element.node.nodeName === 'BUTTON') {
    // //     console.log("element: ", element);
    // //     // const hasInnerText = element.node.children.some(child => child.nodeType === 3 && child.nodeValue.trim() !== '');
    // //     // const hasAriaLabel = element.node.attributes.some(attr => attr.name === 'aria-label' && attr.value.trim() !== '');
    // //     // const hasAriaLabelledBy = element.node.attributes.some(attr => attr.name === 'aria-labelledby');
    // //     // const hasPresentationRole = element.node.attributes.some(attr => (attr.name === 'role' && (attr.value === 'presentation' || attr.value === 'none')) && element.node.attributes.some(attr => attr.name === 'tabindex' && attr.value === '-1');

    // //     // if (!hasInnerText && !hasAriaLabel && !hasAriaLabelledBy && !hasPresentationRole) {
    // //     //   violations.push({
    // //     //     node: element.node,
    // //     //     message: 'Button element is not accessible to screen readers.',
    // //     //   });
    // //     // }
    // //   }
    // });
}

function handleImageAltText(artifacts) {
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
        var altText = image.node.nodeLabel;
        if (isActualText(altText)) {
            const detectedAltLang = detectLanguage(altText);
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
            let imageSrc = image.src;
            missingAltImages.push({ node: { type: 'node', snippet: nodeSnippet }, imageSrc });
        }
    }
    

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


function detectLanguage(text) {
    const langPatterns = {
      en: /[a-zA-Z]/, // English (Latin script)
      bn: /[\u0980-\u09FF]/, // Bengali
      hi: /[\u0900-\u097F]/, // Hindi
      ar: /[\u0600-\u06FF]/, // Arabic
      zh: /[\u4E00-\u9FFF]/, // Chinese
    };
  
    for (const [lang, pattern] of Object.entries(langPatterns)) {
      if (pattern.test(text)) return lang;
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

    // Check if it's an HTML structure (contains `>` which indicates DOM path)
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

export default audits;
