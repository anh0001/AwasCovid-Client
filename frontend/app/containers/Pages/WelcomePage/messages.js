/*
 * Blank Page Messages
 *
 * This contains all the text for the Blank Page.
 */
import { defineMessages } from 'react-intl';

export const scope = 'boilerplate.containers.Welcome';

export default defineMessages({
  title: {
    id: `${scope}.title`,
    defaultMessage: 'Welcome to AwasCovid',
  },
  paperTitle: {
    id: `${scope}.paper.title`,
    defaultMessage: 'Welcome to AwasCovid',
  },
  paperSubtitle: {
    id: `${scope}.paper.subtitle`,
    defaultMessage: 'Portable monitoring covid based on smartphone',
  },
  content: {
    id: `${scope}.paper.content`,
    defaultMessage: 'Open the main dashboard to start',
  },
});
