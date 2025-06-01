import { Audit } from 'lighthouse';

export default class ButtonAccessibilityAudit extends Audit {
  static get meta() {
    return {
      id: 'button-accessibility',
      title: 'Button Accessibility',
      failureTitle: 'Some buttons are not accessible',
      description: 'Ensure all buttons have accessible text (innerText, aria-label, or aria-labelledby).',
      requiredArtifacts: ['AllButtons'], // Use the Gatherer's artifact
      group: 'a11y-best-practices'
    };
  }

  static audit(artifacts) {
    console.log("artifacts: ", artifacts);
    const buttons = artifacts.AllButtons;
    const violations = [];

    // Check each button for accessibility
    buttons.forEach(button => {
      const hasAccessibleText =
        button.innerText !== '' ||
        button.ariaLabel !== null ||
        button.ariaLabelledBy !== null;

      if (!hasAccessibleText) {
        violations.push({
          nodeName: button.nodeName,
          role: button.role,
          message: 'Button does not have accessible text.',
        });
      }
    });

    return {
      score: violations.length === 0 ? 1 : 0, // 1 if no violations, 0 otherwise
      numericValue: violations.length, // Number of violations
      scoreDisplayMode: 'binary', // Score is either 0 or 1
      details: {
        items: violations, // List of violating buttons
      },
    };
  }
}