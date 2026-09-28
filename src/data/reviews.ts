export type ClientReview = { quote: string; name: string; context: string };

// The two client comments supplied by Adeel, lightly edited for clarity.
export const clientReviews: ClientReview[] = [
  {
    name: 'Angela Horga',
    context: 'Company dashboard',
    quote:
      'I’m amazed by the dashboard. Instead of jumping between Slack channels, I now have one clear view of every employee’s progress. It makes the daily check-in so much easier.',
  },
  {
    name: 'Mobi Shair',
    context: 'Workflow automation',
    quote:
      'Adeel automated so many of the repetitive tasks we used to handle manually every day. It has taken a real load off our daily workload.',
  },
];
