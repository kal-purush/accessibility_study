const ImageAltTextCheck = require('./audits/image-alt-text-check.js');

module.exports = {
  audits: [ImageAltTextCheck],
  category: {
    title: 'Custom Accessibility',
    description: 'Custom checks for accessibility.',
    auditRefs: [
      { id: 'image-alt-text-check', weight: 1 },
    ],
  },
};
