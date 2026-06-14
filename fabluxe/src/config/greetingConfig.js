// ─── VISITOR GREETING CONFIGURATION ──────────────────────────────────────────
// This is the WhatsApp greeting sent to a visitor right after they check in.
// Staff get a "Send / Skip" choice each time (so repeat walk-ins aren't spammed).
//
// HOW TO EDIT:
//   • Edit the message text below to change wording.
//   • Use these placeholders — they get filled in automatically:
//       {name}     → visitor's name
//       {showroom} → showroom name
//       {staff}    → staff member who checked them in
//   • To switch the active template, change ACTIVE_TEMPLATE to a key below.

export const GREETING_TEMPLATES = {
  warm: {
    label: 'Warm Welcome',
    message:
`Dear {name}, 🙏

Welcome to *{showroom}*! It's our pleasure to have you visit us today.

Our team is here to help you design a home that reflects your style. Feel free to ask us anything.

Warm regards,
Team FABLUXE ✨`,
  },

  luxury: {
    label: 'Luxury Concierge',
    message:
`Hello {name}, ✨

Thank you for stepping into *{showroom}* — where interiors meet elegance.

We'd be delighted to craft something timeless for your space. Our consultants are at your service.

With warm regards,
FABLUXE Interior Home Solutions`,
  },

  short: {
    label: 'Short & Simple',
    message:
`Hi {name}! 👋 Thank you for visiting *{showroom}* today. We're glad to have you — reach out anytime. — Team FABLUXE`,
  },
};

// The active greeting template that will be sent.
export const ACTIVE_TEMPLATE = 'warm';

// Allow every staff role to send greetings (set false to restrict to manager+admin).
export const ALLOW_ALL_STAFF = true;

// Default: ask Send/Skip after each check-in (recommended for repeat walk-ins).
export const ASK_BEFORE_SEND = true;
