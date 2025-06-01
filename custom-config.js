import ImageAltTextCheck from './audits/image-alt-text-check.js';

const config = {
  extends: 'lighthouse:default',
  audits: [ImageAltTextCheck],
  categories: {
    'custom-accessibility': {
      title: 'Custom Accessibility Checks',
      description: 'Custom audits to check accessibility aspects like alt text.',
      auditRefs: [
        { id: 'image-alt-text-check', weight: 1 }
      ]
    }
  }
};

export default config;



// import audits from './audits/image-alt-text-check.js';

// // const customCategories = {
// //   'custom-accessibility': {
// //     title: 'Custom Accessibility Checks',
// //     description: 'Custom audits to check accessibility aspects like button names, alt text, labels, and more.',
// //     auditRefs: audits.map(audit => ({
// //       id: audit.meta.id,
// //       weight: 1, // Adjust weighting based on importance
// //     })),
// //   },
// // };

// const customCategories = {
//   'custom-accessibility': {
//     title: 'Custom Accessibility Checks',
//     description: 'Custom audits to check accessibility aspects like button names, alt text, labels, and more.',
//     auditRefs: [
//         { id: 'image-alt-text-check', weight: 1 }, // Reference the Audit
//     ],
//   },
// };

// const config = {
//   extends: 'lighthouse:default',
//   audits: audits,
//   categories: customCategories,
// };

// export default config;


// const customCategories = {
//   'custom-accessibility': {
//     title: 'Custom Accessibility Checks',
//     description: 'Custom audits to check accessibility aspects like button names, alt text, labels, and more.',
//     auditRefs: [
//       { id: 'button-accessibility', weight: 1 }, // Reference the Audit
//     ],
//   },
// };

// import AllButtons from './gatherers/button-elements.js';
// import ButtonAccessibilityAudit from './audits/button-accessibility.js';

// export default {
//   extends: 'lighthouse:default',
//   passes: [
//     {
//       passName: 'defaultPass',
//       gatherers: [AllButtons], // Include the Gatherer
//     },
//   ],
//   audits: [ButtonAccessibilityAudit], // Include the Audit
//   categories: {
//     ...customCategories, // Include the custom category
//   },
// };
